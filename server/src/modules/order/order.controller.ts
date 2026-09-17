import type { RequestHandler } from "express";
import { orderService } from "./order.service.js";
import {
  createOrderSchema,
  orderQuerySchema,
  paymentStatusUpdateSchema,
  statusUpdateSchema,
} from "./order.validation.js";
const uid = (request: Parameters<RequestHandler>[0]) => request.authUser!._id;
export const getCheckoutSummary: RequestHandler = async (req, res) =>
  res.json({
    success: true,
    data: await orderService.checkoutSummary(uid(req)),
  });
export const createOrder: RequestHandler = async (req, res) =>
  res
    .status(201)
    .json({
      success: true,
      data: await orderService.create(
        uid(req),
        createOrderSchema.parse(req.body),
      ),
      message: "Order placed",
    });
export const listMyOrders: RequestHandler = async (req, res) =>
  res.json({ success: true, data: await orderService.listMine(uid(req)) });
export const getMyOrder: RequestHandler = async (req, res) =>
  res.json({
    success: true,
    data: await orderService.getMine(uid(req), String(req.params.id)),
  });
export const cancelMyOrder: RequestHandler = async (req, res) =>
  res.json({
    success: true,
    data: await orderService.cancelMine(uid(req), String(req.params.id)),
    message: "Order cancelled",
  });
export const listAdminOrders: RequestHandler = async (req, res) => {
  const result = await orderService.listAdmin(
    orderQuerySchema.parse(req.query),
  );
  res.json({
    success: true,
    data: result.items,
    pagination: result.pagination,
    totals: result.totals,
  });
};
export const getAdminOrder: RequestHandler = async (req, res) =>
  res.json({
    success: true,
    data: await orderService.getAdmin(String(req.params.id)),
  });
export const updateAdminOrderStatus: RequestHandler = async (req, res) => {
  const input = statusUpdateSchema.parse(req.body);
  res.json({
    success: true,
    data: await orderService.updateStatus(
      String(req.params.id),
      input.status,
      uid(req),
      input.adminNote,
    ),
    message: "Order status updated",
  });
};
export const updateAdminPaymentStatus: RequestHandler = async (req, res) => {
  const { status } = paymentStatusUpdateSchema.parse(req.body);
  res.json({
    success: true,
    data: await orderService.updatePaymentStatus(String(req.params.id), status),
    message: "Payment status updated",
  });
};
