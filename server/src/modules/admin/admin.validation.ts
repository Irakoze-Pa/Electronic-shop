import { z } from "zod";
import { objectIdSchema } from "../shared/validation.js";
import { userStatuses } from "../user/user.types.js";

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
