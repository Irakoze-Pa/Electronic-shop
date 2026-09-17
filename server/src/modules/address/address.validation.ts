import { z } from "zod";

export const addressInputSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(5).max(30),
  country: z.string().trim().min(2).max(80).default("Rwanda"),
  city: z.string().trim().min(2).max(100),
  district: z.string().trim().max(100).default(""),
  sector: z.string().trim().max(100).default(""),
  addressLine: z.string().trim().min(3).max(300),
  landmark: z.string().trim().max(200).default(""),
  postalCode: z.string().trim().max(30).default(""),
  isDefault: z.boolean().default(false),
});
export const updateAddressSchema = addressInputSchema.partial();
