import { z } from "zod";
import { objectIdSchema } from "../shared/validation.js";
import { userStatuses } from "../user/user.types.js";
import { passwordSchema } from "../auth/auth.validation.js";

export const reportQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  period: z.enum(["today", "7d", "30d", "month", "custom"]).default("30d"),
});
export const customerQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.enum(userStatuses).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export const customerParamsSchema = z.object({ id: objectIdSchema });
export const customerStatusSchema = z.object({ status: z.enum(userStatuses) }).strict();
export const createCustomerSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().max(30).default(""),
  temporaryPassword: passwordSchema,
}).strict();
