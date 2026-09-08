import { z } from "zod";
import { objectIdSchema, statusSchema } from "../shared/validation.js";

const booleanQuery = z.enum(["true", "false"]).transform((value) => value === "true");
const productFields = {
  name: z.string().trim().min(2).max(160),
  code: z.string().trim().min(2).max(80),
  category: objectIdSchema,
  brand: objectIdSchema,
  shortDescription: z.string().trim().max(300).optional().default(""),
  description: z.string().trim().max(5000).optional().default(""),
  price: z.number().nonnegative(),
  oldPrice: z.number().nonnegative().nullable().optional().default(null),
  stock: z.number().int().nonnegative(),
  unit: z.string().trim().min(1).max(30).default("piece"),
  status: statusSchema.default("Active"),
  featured: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  images: z.array(z.string().url()).max(12).default([]),
  specifications: z.record(z.string(), z.string().trim().max(300)).default({}),
};

export const createProductSchema = z.object(productFields).refine(({ oldPrice, price }) => oldPrice === null || oldPrice >= price, { message: "Old price must be greater than or equal to price", path: ["oldPrice"] });
export const updateProductSchema = z.object(productFields).partial().refine(
  ({ oldPrice, price }) =>
    oldPrice === undefined ||
    oldPrice === null ||
    price === undefined ||
    oldPrice >= price,
  {
    message: "Old price must be greater than or equal to price",
    path: ["oldPrice"],
  },
);
export const productQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: objectIdSchema.optional(),
  brand: objectIdSchema.optional(),
  status: statusSchema.optional(),
  featured: booleanQuery.optional(),
  bestSeller: booleanQuery.optional(),
  newArrival: booleanQuery.optional(),
  sort: z.enum(["newest", "oldest", "price-asc", "price-desc", "name-asc"]).default("newest"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});
