import { Schema, model } from "mongoose";

export const inventoryTransactionTypes = [
  "inbound",
  "outbound",
  "adjustment",
] as const;

const inventoryTransactionSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    type: { type: String, enum: inventoryTransactionTypes, required: true },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true, min: 0 },
    resultingStock: { type: Number, required: true, min: 0 },
    note: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { timestamps: true },
);

export const InventoryTransaction = model(
  "InventoryTransaction",
  inventoryTransactionSchema,
);
