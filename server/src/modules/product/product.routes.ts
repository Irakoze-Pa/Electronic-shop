import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "./product.controller.js";
import {
  optionalAuth,
  requireAuth,
  requireRole,
} from "../auth/auth.middleware.js";

export const productRouter = Router();
const requireAdmin = [requireAuth, requireRole("Admin")];
productRouter
  .route("/")
  .get(optionalAuth, listProducts)
  .post(requireAdmin, createProduct);
productRouter
  .route("/:id")
  .get(optionalAuth, getProduct)
  .patch(requireAdmin, updateProduct)
  .delete(requireAdmin, deleteProduct);
