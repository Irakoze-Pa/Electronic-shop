import { z } from "zod";
import { objectIdSchema } from "../shared/validation.js";
import {
  orderStatuses,
  paymentMethods,
  paymentStatuses,
} from "./order.types.js";
export const createOrderSchema = z
  .object({
    addressId: objectIdSchema,
    paymentMethod: z.enum(paymentMethods),
    customerNote: z.string().trim().max(1000).default(""),
  })
  .strict();
export const statusUpdateSchema = z
  .object({
    status: z.enum(orderStatuses),
    adminNote: z.string().trim().max(1000).optional(),
  })
  .strict();
export const paymentStatusUpdateSchema = z
  .object({ status: z.enum(paymentStatuses) })
  .strict();
export const orderQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  orderStatus: z.enum(orderStatuses).optional(),
  paymentStatus: z.enum(paymentStatuses).optional(),
  salesChannel: z.enum(["Online", "PhysicalShop"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z
    .enum(["newest", "oldest", "total-asc", "total-desc"])
    .default("newest"),
});
export const physicalSaleSchema = z.object({
  customerId: objectIdSchema.optional(),
  customerName: z.string().trim().min(2).max(160).default("Walk-in customer"),
  customerPhone: z.string().trim().max(30).default(""),
  paymentMethod: z.enum(["Cash", "MobileMoney", "Card", "BankTransfer"]),
  amountPaid: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
  note: z.string().trim().max(500).default(""),
  items: z.array(z.object({ product: objectIdSchema, quantity: z.number().int().positive().max(10000) }).strict()).min(1).max(100),
}).strict();
