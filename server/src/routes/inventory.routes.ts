import { Router } from "express";
import {
  createInventoryTransaction,
  listInventoryTransactions,
} from "../controllers/inventory.controller.js";
import { requireAuth, requireRole } from "../modules/auth/auth.middleware.js";

export const inventoryRouter = Router();

inventoryRouter
  .route("/")
  .get(requireAuth, requireRole("Admin"), listInventoryTransactions)
  .post(requireAuth, requireRole("Admin"), createInventoryTransaction);
