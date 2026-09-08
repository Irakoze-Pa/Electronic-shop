import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} from "./category.controller.js";
import {
  optionalAuth,
  requireAuth,
  requireRole,
} from "../auth/auth.middleware.js";

export const categoryRouter = Router();
const requireAdmin = [requireAuth, requireRole("Admin")];
categoryRouter
  .route("/")
  .get(optionalAuth, listCategories)
  .post(requireAdmin, createCategory);
categoryRouter
  .route("/:id")
  .get(optionalAuth, getCategory)
  .patch(requireAdmin, updateCategory)
  .delete(requireAdmin, deleteCategory);
