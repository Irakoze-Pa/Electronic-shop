import { Schema, model } from "mongoose";

const receiptItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  previousStock: { type: Number, required: true, min: 0 },
  newStock: { type: Number, required: true, min: 0 },
}, { _id: false });

const inventoryReceiptSchema = new Schema({
  receiptNumber: { type: String, required: true, unique: true, index: true },
  purchaseOrder: { type: Schema.Types.ObjectId, ref: "PurchaseOrder", default: null, index: true },
  supplierName: { type: String, required: true, trim: true, maxlength: 160 },
  deliveryNote: { type: String, trim: true, maxlength: 120, default: "" },
  receivedAt: { type: Date, required: true, default: Date.now, index: true },
  items: { type: [receiptItemSchema], required: true },
  note: { type: String, trim: true, maxlength: 500, default: "" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export const InventoryReceipt = model("InventoryReceipt", inventoryReceiptSchema);

const inventoryReceiptCounterSchema = new Schema({ _id: String, sequence: { type: Number, default: 0 } });
export const InventoryReceiptCounter = model("InventoryReceiptCounter", inventoryReceiptCounterSchema);
