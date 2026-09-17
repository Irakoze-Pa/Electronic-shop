import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import {
  cancelMyOrder,
  createOrder,
  getAdminOrder,
  getCheckoutSummary,
  getMyOrder,
  listAdminOrders,
  listMyOrders,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
} from "./order.controller.js";
export const orderRouter = Router();
orderRouter.use(requireAuth);
orderRouter.post("/", createOrder);
orderRouter.get("/checkout-summary", getCheckoutSummary);
orderRouter.get("/my", listMyOrders);
orderRouter.get("/my/:id", getMyOrder);
orderRouter.post("/my/:id/cancel", cancelMyOrder);
export const adminOrderRouter = Router();
adminOrderRouter.use(requireAuth, requireRole("Admin"));
adminOrderRouter.get("/", listAdminOrders);
adminOrderRouter.get("/:id", getAdminOrder);
adminOrderRouter.patch("/:id/status", updateAdminOrderStatus);
adminOrderRouter.patch("/:id/payment-status", updateAdminPaymentStatus);
