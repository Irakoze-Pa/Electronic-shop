import { Schema, model } from "mongoose";
import { catalogStatuses } from "../shared/catalog.types.js";

const brandSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    logo: { type: String, trim: true, default: "" },
    status: { type: String, enum: catalogStatuses, default: "Active", index: true },
  },
  { timestamps: true },
);

export const Brand = model("Brand", brandSchema);
