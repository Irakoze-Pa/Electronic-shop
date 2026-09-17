import { Schema, model } from "mongoose";

const inventoryTransactionSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["Increase", "Decrease", "Correction"],
      required: true,
      index: true,
    },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true, min: 0 },
    newStock: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, trim: true, maxlength: 120 },
    note: { type: String, trim: true, maxlength: 500, default: "" },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    order: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    receipt: { type: Schema.Types.ObjectId, ref: "InventoryReceipt", default: null },
  },
  { timestamps: true },
);

inventoryTransactionSchema.index({ createdAt: -1, product: 1, type: 1 });

export const InventoryTransaction = model(
  "InventoryTransaction",
  inventoryTransactionSchema,
);
