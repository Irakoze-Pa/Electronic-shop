import { Types } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { Product } from "../product/product.model.js";
import { Cart } from "./cart.model.js";

const productFields =
  "name slug images price oldPrice stock unit brand category status";

async function validateAvailableProduct(productId: string, quantity: number) {
  if (!Types.ObjectId.isValid(productId))
    throw new AppError("Invalid product identifier", 400);
  const product = await Product.findById(productId);
  if (!product) throw new AppError("Product not found", 404);
  if (product.status !== "Active")
    throw new AppError("This product is not active", 400);
  if (product.stock < 1) throw new AppError("This product is out of stock", 400);
  if (quantity > product.stock)
    throw new AppError(`Only ${product.stock} item(s) are available`, 400);
  return product;
}

async function getCartDocument(userId: string) {
  return Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
}

async function present(userId: string) {
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    select: productFields,
    populate: [
      { path: "brand", select: "name slug" },
      { path: "category", select: "name slug" },
    ],
  });
  if (!cart) return { items: [], totalQuantity: 0, subtotal: 0 };
  const items = cart.items
    .filter((item) => item.product)
    .map((item) => {
      const product = item.product as unknown as {
        _id: Types.ObjectId;
        price: number;
        toJSON: () => Record<string, unknown>;
      };
      return {
        product: product.toJSON(),
        quantity: item.quantity,
        lineSubtotal: product.price * item.quantity,
      };
    });
  return {
    items,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.lineSubtotal, 0),
  };
}

export const cartService = {
  get: present,
  async add(userId: string, productId: string, quantity: number) {
    const cart = await getCartDocument(userId);
    if (!cart) throw new AppError("Could not create cart", 500);
    const existing = cart.items.find(
      (item) => item.product.toString() === productId,
    );
    const nextQuantity = (existing?.quantity ?? 0) + quantity;
    await validateAvailableProduct(productId, nextQuantity);
    if (existing) existing.quantity = nextQuantity;
    else cart.items.push({ product: new Types.ObjectId(productId), quantity });
    await cart.save();
    return present(userId);
  },
  async update(userId: string, productId: string, quantity: number) {
    await validateAvailableProduct(productId, quantity);
    const cart = await Cart.findOne({ user: userId });
    const item = cart?.items.find(
      (entry) => entry.product.toString() === productId,
    );
    if (!cart || !item) throw new AppError("Product is not in your cart", 404);
    item.quantity = quantity;
    await cart.save();
    return present(userId);
  },
  async remove(userId: string, productId: string) {
    const result = await Cart.updateOne(
      { user: userId },
      { $pull: { items: { product: productId } } },
    );
    if (!result.matchedCount || !result.modifiedCount)
      throw new AppError("Product is not in your cart", 404);
    return present(userId);
  },
  async clear(userId: string) {
    await Cart.updateOne({ user: userId }, { $set: { items: [] } });
    return present(userId);
  },
};
