import { z } from "zod";
import { optionalUrlSchema, statusSchema } from "../shared/validation.js";

const brandFields = () => ({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500),
  logo: optionalUrlSchema,
  status: statusSchema,
});

export const updateBrandSchema = z.object(brandFields()).partial();

const createFields = brandFields();

export const createBrandSchema = z.object({
  ...createFields,
  description: createFields.description.optional().default(""),
  logo: createFields.logo.optional().default(""),
  status: createFields.status.optional().default("Active"),
});
