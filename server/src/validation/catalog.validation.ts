import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid identifier");
const optionalUrl = z.union([z.literal(""), z.string().url()]);

export const idParamsSchema = z.object({ id: objectId });

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).default(""),
  isActive: z.boolean().default(true),
});

export const categoryUpdateSchema = categoryInputSchema.partial();

export const brandInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).default(""),
  logoUrl: optionalUrl.default(""),
  websiteUrl: optionalUrl.default(""),
  isActive: z.boolean().default(true),
});

export const brandUpdateSchema = brandInputSchema.partial();

export const productInputSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    sku: z.string().trim().min(1).max(80),
    description: z.string().trim().min(1).max(5000),
    price: z.number().nonnegative(),
    compareAtPrice: z.number().nonnegative().nullable().default(null),
    category: objectId,
    brand: objectId,
    imageUrls: z.array(z.string().url()).max(12).default([]),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
  })
  .refine(
    ({ compareAtPrice, price }) =>
      compareAtPrice === null || compareAtPrice >= price,
    {
      message: "Compare-at price must be greater than or equal to price",
      path: ["compareAtPrice"],
    },
  );

export const productUpdateSchema = productInputSchema.safeExtend({}).partial();

export const inventoryInputSchema = z
  .object({
    product: objectId,
    type: z.enum(["inbound", "outbound", "adjustment"]),
    quantity: z
      .number()
      .int()
      .refine((value) => value !== 0, "Quantity cannot be zero"),
    note: z.string().trim().max(500).default(""),
  })
  .refine(({ quantity, type }) => type === "adjustment" || quantity > 0, {
    message: "Inbound and outbound quantities must be positive",
    path: ["quantity"],
  });
