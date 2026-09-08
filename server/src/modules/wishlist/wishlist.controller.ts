import type { RequestHandler } from "express";
import { idParamsSchema } from "../shared/validation.js";
import { wishlistService } from "./wishlist.service.js";

function userId(request: Parameters<RequestHandler>[0]) {
  return request.authUser!._id;
}
export const getWishlist: RequestHandler = async (request, response) => {
  response.json({ success: true, data: await wishlistService.get(userId(request)) });
};
export const addWishlistItem: RequestHandler = async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  response.status(201).json({
    success: true,
    data: await wishlistService.add(userId(request), id),
    message: "Product saved to wishlist",
  });
};
export const removeWishlistItem: RequestHandler = async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  response.json({
    success: true,
    data: await wishlistService.remove(userId(request), id),
    message: "Product removed from wishlist",
  });
};
export const clearWishlist: RequestHandler = async (request, response) => {
  response.json({
    success: true,
    data: await wishlistService.clear(userId(request)),
    message: "Wishlist cleared",
  });
};
