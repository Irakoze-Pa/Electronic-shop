import type { RequestHandler } from "express";
import mongoose from "mongoose";
import { InventoryTransaction } from "../models/inventory-transaction.model.js";
import { Product } from "../models/product.model.js";
import { AppError } from "../utils/AppError.js";
import { inventoryInputSchema } from "../validation/catalog.validation.js";

export const listInventoryTransactions: RequestHandler = async (
  request,
  response,
) => {
  const filter = request.query.product
    ? { product: String(request.query.product) }
    : {};
  const transactions = await InventoryTransaction.find(filter)
    .populate("product", "name sku")
    .sort({ createdAt: -1 })
    .limit(200);
  response.json({ success: true, data: transactions });
};

export const createInventoryTransaction: RequestHandler = async (
  request,
  response,
) => {
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
      if (!product)
        throw new AppError(
          "Product not found or stock would become negative",
          400,
        );
      [transaction] = await InventoryTransaction.create(
        [
          {
            ...input,
            quantity: change,
            previousStock: product.stock,
            resultingStock: product.stock + change,
          },
        ],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  response.status(201).json({ success: true, data: transaction });
};
