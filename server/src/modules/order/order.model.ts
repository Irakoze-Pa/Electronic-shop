import { Schema, model } from "mongoose";
import {
  orderStatuses,
  paymentMethods,
  paymentStatuses,
} from "./order.types.js";
const shippingSchema = new Schema(
  {
    fullName: String,
    phone: String,
    country: String,
    city: String,
    district: String,
    sector: String,
    addressLine: String,
    landmark: String,
    postalCode: String,
  },
  { _id: false },
);
const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);
const historySchema = new Schema(
  {
    status: { type: String, enum: orderStatuses, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, default: "", maxlength: 500 },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);
const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    salesChannel: {
      type: String,
      enum: ["Online", "PhysicalShop"],
      default: "Online",
      index: true,
    },
    cashier: { type: Schema.Types.ObjectId, ref: "User", default: null },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, default: "" },
    shippingAddress: { type: shippingSchema, required: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: paymentMethods, required: true },
    amountPaid: { type: Number, min: 0, default: 0 },
    changeReturned: { type: Number, min: 0, default: 0 },
    paymentStatus: {
      type: String,
      enum: paymentStatuses,
      default: "Pending",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: orderStatuses,
      default: "Pending",
      index: true,
    },
    customerNote: { type: String, trim: true, maxlength: 1000, default: "" },
    adminNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
      select: false,
    },
    statusHistory: { type: [historySchema], default: [] },
    inventoryRestored: { type: Boolean, default: false, select: false },
  },
  { timestamps: true },
);
orderSchema.index({ createdAt: -1 });
export const Order = model("Order", orderSchema);
const counterSchema = new Schema({
  _id: String,
  sequence: { type: Number, default: 0 },
});
export const OrderCounter = model("OrderCounter", counterSchema);
