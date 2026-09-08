import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  addWishlistItem,
  clearWishlist,
  getWishlist,
  removeWishlistItem,
} from "./wishlist.controller.js";

export const wishlistRouter = Router();
wishlistRouter.use(requireAuth);
wishlistRouter.route("/").get(getWishlist).delete(clearWishlist);
wishlistRouter.route("/:id").post(addWishlistItem).delete(removeWishlistItem);
