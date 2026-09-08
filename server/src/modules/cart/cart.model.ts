import { Schema, model } from "mongoose";

const cartItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true },
);

cartSchema.path("items").validate(function (items: Array<{ product: unknown }>) {
  const ids = items.map((item) => String(item.product));
  return ids.length === new Set(ids).size;
}, "Cart cannot contain duplicate products");

export const Cart = model("Cart", cartSchema);
