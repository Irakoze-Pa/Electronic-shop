import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { createPurchaseOrder, getPurchaseOrder, listPurchaseOrders, receivePurchaseOrder } from "./purchase-order.controller.js";
export const purchaseOrderRouter = Router();
purchaseOrderRouter.use(requireAuth, requireRole("Admin"));
purchaseOrderRouter.get("/", listPurchaseOrders);
purchaseOrderRouter.post("/", createPurchaseOrder);
purchaseOrderRouter.get("/:id", getPurchaseOrder);
purchaseOrderRouter.post("/:id/receipts", receivePurchaseOrder);
