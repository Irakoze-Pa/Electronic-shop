import type { RequestHandler } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { InventoryTransaction } from "../models/inventory-transaction.model.js";
import { Product } from "../modules/product/product.model.js";
import { objectIdSchema } from "../modules/shared/validation.js";
import { AppError } from "../utils/AppError.js";
import { InventoryReceipt, InventoryReceiptCounter } from "../models/inventory-receipt.model.js";

const adjustmentSchema = z.object({
  product: objectIdSchema,
  type: z.enum(["Increase", "Decrease", "Correction"]),
  quantity: z.number().int().nonnegative(),
  reason: z.string().trim().min(2).max(120),
  note: z.string().trim().max(500).default(""),
}).refine((value) => value.type === "Correction" || value.quantity > 0, {
  message: "Increase and decrease quantities must be greater than zero", path: ["quantity"],
});
const querySchema = z.object({
  product: objectIdSchema.optional(), type: z.enum(["Increase", "Decrease", "Correction"]).optional(),
  from: z.coerce.date().optional(), to: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().min(1).max(100).default(25),
});
const receiptSchema = z.object({
  supplierName: z.string().trim().min(2).max(160),
  deliveryNote: z.string().trim().max(120).default(""),
  receivedAt: z.coerce.date(),
  note: z.string().trim().max(500).default(""),
  items: z.array(z.object({ product: objectIdSchema, quantity: z.number().int().positive() })).min(1).max(100),
}).refine((value) => new Set(value.items.map((item) => item.product)).size === value.items.length, { message: "A product can only appear once per receipt", path: ["items"] });

export const listInventoryTransactions: RequestHandler = async (request, response) => {
  const query = querySchema.parse(request.query);
  const filter: Record<string, unknown> = {};
  if (query.product) filter.product = query.product;
  if (query.type) filter.type = query.type;
  if (query.from || query.to) filter.createdAt = { ...(query.from ? { $gte: query.from } : {}), ...(query.to ? { $lte: new Date(new Date(query.to).setHours(23, 59, 59, 999)) } : {}) };
  const [transactions, total] = await Promise.all([
    InventoryTransaction.find(filter).populate("product", "name code stock lowStockThreshold unit").populate("createdBy", "firstName lastName email").sort({ createdAt: -1 }).skip((query.page - 1) * query.limit).limit(query.limit),
    InventoryTransaction.countDocuments(filter),
  ]);
  response.json({ success: true, data: transactions, pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } });
};

export const createInventoryTransaction: RequestHandler = async (request, response) => {
  const input = adjustmentSchema.parse(request.body);
  const session = await mongoose.startSession();
  let transaction;
  try {
    await session.withTransaction(async () => {
      const product = await Product.findById(input.product).session(session);
      if (!product) throw new AppError("Product not found", 404);
      const previousStock = product.stock;
      const newStock = input.type === "Correction" ? input.quantity : previousStock + (input.type === "Increase" ? input.quantity : -input.quantity);
      if (newStock < 0) throw new AppError("Stock cannot be reduced below zero", 400);
      product.stock = newStock;
      await product.save({ session, validateModifiedOnly: true });
      [transaction] = await InventoryTransaction.create([{ product: product._id, type: input.type, quantity: input.type === "Correction" ? Math.abs(newStock - previousStock) : input.quantity, previousStock, newStock, reason: input.reason, note: input.note, createdBy: request.authUser!._id }], { session });
    });
  } finally { await session.endSession(); }
  response.status(201).json({ success: true, data: transaction, message: "Stock adjusted" });
};

export const createInventoryReceipt: RequestHandler = async (request, response) => {
  const input = receiptSchema.parse(request.body);
  const session = await mongoose.startSession();
  let receipt;
  try {
    await session.withTransaction(async () => {
      const counter = await InventoryReceiptCounter.findByIdAndUpdate("receipts", { $inc: { sequence: 1 } }, { upsert: true, returnDocument: "after", session });
      if (!counter) throw new AppError("Could not generate receipt number", 500);
      const receiptNumber = `GRN-${new Date().getUTCFullYear()}-${String(counter.sequence).padStart(6, "0")}`;
      const receiptItems = [];
      for (const line of input.items) {
        const product = await Product.findById(line.product).session(session);
        if (!product) throw new AppError("A receipt product was not found", 404);
        receiptItems.push({ product: product._id, productName: product.name, sku: product.code, unit: product.unit, quantity: line.quantity, previousStock: product.stock, newStock: product.stock + line.quantity });
        product.stock += line.quantity;
        await product.save({ session, validateModifiedOnly: true });
      }
      [receipt] = await InventoryReceipt.create([{ receiptNumber, supplierName: input.supplierName, deliveryNote: input.deliveryNote, receivedAt: input.receivedAt, note: input.note, items: receiptItems, createdBy: request.authUser!._id }], { session });
      await InventoryTransaction.insertMany(receiptItems.map((line) => ({ product: line.product, type: "Increase", quantity: line.quantity, previousStock: line.previousStock, newStock: line.newStock, reason: "Goods received", note: `${receiptNumber}${input.deliveryNote ? ` · Delivery ${input.deliveryNote}` : ""}`, createdBy: request.authUser!._id, receipt: receipt!._id })), { session });
    });
  } finally { await session.endSession(); }
  response.status(201).json({ success: true, data: receipt, message: "Goods receipt recorded" });
};

export const getInventoryReceipt: RequestHandler = async (request, response) => {
  const id = objectIdSchema.parse(String(request.params.id));
  const receipt = await InventoryReceipt.findById(id).populate("createdBy", "firstName lastName email").populate("purchaseOrder", "orderNumber supplierName");
  if (!receipt) throw new AppError("Goods receipt not found", 404);
  response.json({ success: true, data: receipt });
};

export const listInventoryReceipts: RequestHandler = async (request, response) => {
  const range = z.object({ from: z.coerce.date(), to: z.coerce.date() }).parse(request.query);
  const end = new Date(range.to); end.setHours(23, 59, 59, 999);
  if (range.from > end) throw new AppError("Start date must not be after end date", 400);
  const receipts = await InventoryReceipt.find({ receivedAt: { $gte: range.from, $lte: end } })
    .populate("createdBy", "firstName lastName email")
    .populate("purchaseOrder", "orderNumber supplierName")
    .sort({ receivedAt: -1, createdAt: -1 });
  response.json({ success: true, data: receipts });
};
