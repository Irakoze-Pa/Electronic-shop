import { z } from "zod";
import { optionalUrlSchema, statusSchema } from "../shared/validation.js";

const categoryFields = () => ({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500),
  image: optionalUrlSchema,
  status: statusSchema,
});

export const updateCategorySchema = z.object(categoryFields()).partial();

const createFields = categoryFields();

export const createCategorySchema = z.object({
  ...createFields,
  description: createFields.description.optional().default(""),
  image: createFields.image.optional().default(""),
  status: createFields.status.optional().default("Active"),
});
