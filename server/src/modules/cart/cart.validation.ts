import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().trim().min(1),
  quantity: z.number().int().positive(),
});

export const cartQuantitySchema = z.object({
  quantity: z.number().int().positive(),
});
