import { Router } from "express";
import {
  createInventoryTransaction,
  listInventoryTransactions,
  getInventoryReceipt,
  listInventoryReceipts,
} from "../controllers/inventory.controller.js";
import { requireAuth, requireRole } from "../modules/auth/auth.middleware.js";

export const inventoryRouter = Router();

inventoryRouter
  .route("/")
  .get(requireAuth, requireRole("Admin"), listInventoryTransactions)
  .post(requireAuth, requireRole("Admin"), createInventoryTransaction);
inventoryRouter.post("/adjustments", requireAuth, requireRole("Admin"), createInventoryTransaction);
inventoryRouter.get("/receipts/:id", requireAuth, requireRole("Admin"), getInventoryReceipt);
inventoryRouter.get("/receipts", requireAuth, requireRole("Admin"), listInventoryReceipts);
