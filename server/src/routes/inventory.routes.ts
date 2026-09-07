import { Router } from "express";
import {
  createInventoryTransaction,
  listInventoryTransactions,
} from "../controllers/inventory.controller.js";

export const inventoryRouter = Router();

inventoryRouter
  .route("/")
  .get(listInventoryTransactions)
  .post(createInventoryTransaction);
