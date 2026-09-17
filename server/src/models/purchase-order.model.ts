import { Schema, model } from "mongoose";

const purchaseOrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true }, sku: { type: String, required: true }, unit: { type: String, required: true },
  quantityOrdered: { type: Number, required: true, min: 1 }, quantityReceived: { type: Number, required: true, min: 0, default: 0 },
}, { _id: false });
const purchaseOrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true, index: true }, supplierName: { type: String, required: true, trim: true, maxlength: 160 },
  supplierReference: { type: String, trim: true, maxlength: 120, default: "" }, expectedAt: { type: Date, default: null },
  status: { type: String, enum: ["Ordered", "PartiallyReceived", "Received", "Cancelled"], default: "Ordered", index: true },
  items: { type: [purchaseOrderItemSchema], required: true }, note: { type: String, trim: true, maxlength: 500, default: "" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
purchaseOrderSchema.index({ createdAt: -1 });
export const PurchaseOrder = model("PurchaseOrder", purchaseOrderSchema);
const counterSchema = new Schema({ _id: String, sequence: { type: Number, default: 0 } });
export const PurchaseOrderCounter = model("PurchaseOrderCounter", counterSchema);
