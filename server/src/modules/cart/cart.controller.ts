import type { RequestHandler } from "express";
import { idParamsSchema } from "../shared/validation.js";
import { cartService } from "./cart.service.js";
import { cartItemSchema, cartQuantitySchema } from "./cart.validation.js";

function userId(request: Parameters<RequestHandler>[0]) {
  return request.authUser!._id;
}

export const getCart: RequestHandler = async (request, response) => {
  response.json({ success: true, data: await cartService.get(userId(request)) });
};
export const addCartItem: RequestHandler = async (request, response) => {
  const input = cartItemSchema.parse(request.body);
  response.status(201).json({
    success: true,
    data: await cartService.add(userId(request), input.productId, input.quantity),
    message: "Product added to cart",
  });
};
export const updateCartItem: RequestHandler = async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  const { quantity } = cartQuantitySchema.parse(request.body);
  response.json({
    success: true,
    data: await cartService.update(userId(request), id, quantity),
    message: "Cart updated",
  });
};
export const removeCartItem: RequestHandler = async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  response.json({
    success: true,
    data: await cartService.remove(userId(request), id),
    message: "Product removed from cart",
  });
};
export const clearCart: RequestHandler = async (request, response) => {
  response.json({
    success: true,
    data: await cartService.clear(userId(request)),
    message: "Cart cleared",
  });
};
