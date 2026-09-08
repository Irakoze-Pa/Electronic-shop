import { Router } from "express";
import {
  createBrand,
  deleteBrand,
  getBrand,
  listBrands,
  updateBrand,
} from "./brand.controller.js";
import {
  optionalAuth,
  requireAuth,
  requireRole,
} from "../auth/auth.middleware.js";

export const brandRouter = Router();
const requireAdmin = [requireAuth, requireRole("Admin")];
brandRouter
  .route("/")
  .get(optionalAuth, listBrands)
  .post(requireAdmin, createBrand);
brandRouter
  .route("/:id")
  .get(optionalAuth, getBrand)
  .patch(requireAdmin, updateBrand)
  .delete(requireAdmin, deleteBrand);
