import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "./cart.controller.js";

export const cartRouter = Router();
cartRouter.use(requireAuth);
cartRouter.route("/").get(getCart).delete(clearCart);
cartRouter.post("/items", addCartItem);
cartRouter.route("/items/:id").patch(updateCartItem).delete(removeCartItem);
