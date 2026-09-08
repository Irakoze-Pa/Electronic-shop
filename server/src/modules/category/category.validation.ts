import { z } from "zod";
import { optionalUrlSchema, statusSchema } from "../shared/validation.js";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional().default(""),
  image: optionalUrlSchema.optional().default(""),
  status: statusSchema.optional().default("Active"),
});

export const updateCategorySchema = createCategorySchema.partial();
