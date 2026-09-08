import { Types } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { Product } from "../product/product.model.js";
import { Wishlist } from "./wishlist.model.js";

async function present(userId: string) {
  const wishlist = await Wishlist.findOne({ user: userId }).populate({
    path: "products",
    select:
      "name slug code images price oldPrice stock unit brand category status shortDescription",
    populate: [
      { path: "brand", select: "name slug status" },
      { path: "category", select: "name slug status" },
    ],
  });
  return { products: wishlist?.products.filter(Boolean) ?? [] };
}

export const wishlistService = {
  get: present,
  async add(userId: string, productId: string) {
    if (!Types.ObjectId.isValid(productId))
      throw new AppError("Invalid product identifier", 400);
    if (!(await Product.exists({ _id: productId })))
      throw new AppError("Product not found", 404);
    await Wishlist.findOneAndUpdate(
      { user: userId },
      { $setOnInsert: { user: userId }, $addToSet: { products: productId } },
      { upsert: true, setDefaultsOnInsert: true },
    );
    return present(userId);
  },
  async remove(userId: string, productId: string) {
    await Wishlist.updateOne(
      { user: userId },
      { $pull: { products: productId } },
    );
    return present(userId);
  },
  async clear(userId: string) {
    await Wishlist.updateOne({ user: userId }, { $set: { products: [] } });
    return present(userId);
  },
};
