import type { RequestHandler } from "express";
import { adminService } from "./admin.service.js";
import { createCustomerSchema, customerParamsSchema, customerQuerySchema, customerStatusSchema, reportQuerySchema } from "./admin.validation.js";
export const dashboard: RequestHandler = async (_req, res) => res.json({ success: true, data: await adminService.dashboard() });
export const report: RequestHandler = async (req, res) => { const q = reportQuerySchema.parse(req.query); res.json({ success: true, data: await adminService.report(q.period, q.from, q.to) }); };
export const customers: RequestHandler = async (req, res) => { const result = await adminService.customers(customerQuerySchema.parse(req.query)); res.json({ success: true, data: result.items, pagination: result.pagination }); };
export const createCustomer: RequestHandler = async (req, res) => res.status(201).json({ success: true, data: await adminService.createCustomer(createCustomerSchema.parse(req.body)), message: "Customer created" });
export const customer: RequestHandler = async (req, res) => { const { id } = customerParamsSchema.parse(req.params); res.json({ success: true, data: await adminService.customer(id) }); };
export const updateCustomerStatus: RequestHandler = async (req, res) => { const { id } = customerParamsSchema.parse(req.params); const { status } = customerStatusSchema.parse(req.body); res.json({ success: true, data: await adminService.updateCustomerStatus(id, status), message: "Customer status updated" }); };
