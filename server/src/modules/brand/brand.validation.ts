import { z } from "zod";
import { optionalUrlSchema, statusSchema } from "../shared/validation.js";

export const createBrandSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional().default(""),
  logo: optionalUrlSchema.optional().default(""),
  status: statusSchema.optional().default("Active"),
});
export const updateBrandSchema = createBrandSchema.partial();
