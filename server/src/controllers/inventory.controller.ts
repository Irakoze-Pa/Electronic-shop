import type { RequestHandler } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { InventoryTransaction } from "../models/inventory-transaction.model.js";
import { Product } from "../modules/product/product.model.js";
import { AppError } from "../utils/AppError.js";
import { objectIdSchema } from "../modules/shared/validation.js";

const inventoryInputSchema = z
  .object({
    product: objectIdSchema,
    type: z.enum(["inbound", "outbound", "adjustment"]),
    quantity: z.number().int().refine((value) => value !== 0, "Quantity cannot be zero"),
    note: z.string().trim().max(500).default(""),
  })
  .refine(({ quantity, type }) => type === "adjustment" || quantity > 0, {
    message: "Inbound and outbound quantities must be positive",
    path: ["quantity"],
  });

export const listInventoryTransactions: RequestHandler = async (request, response) => {
  const product = request.query.product
    ? objectIdSchema.parse(String(request.query.product))
    : undefined;
  const transactions = await InventoryTransaction.find(product ? { product } : {})
    .populate("product", "name code")
    .sort({ createdAt: -1 })
    .limit(200);
  response.json({ success: true, data: transactions });
};

export const createInventoryTransaction: RequestHandler = async (request, response) => {
  const input = inventoryInputSchema.parse(request.body);
  const change = input.type === "outbound" ? -input.quantity : input.quantity;
  const session = await mongoose.startSession();
  let transaction;

  try {
    await session.withTransaction(async () => {
      const product = await Product.findOneAndUpdate(
        { _id: input.product, stock: { $gte: Math.max(-change, 0) } },
        { $inc: { stock: change } },
        { new: false, session },
      );
      if (!product) {
        throw new AppError("Product not found or stock would become negative", 400);
      }
      [transaction] = await InventoryTransaction.create(
        [{ ...input, quantity: change, previousStock: product.stock, resultingStock: product.stock + change }],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  response.status(201).json({ success: true, data: transaction });
};
