import { Schema, model } from "mongoose";

const brandSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    logoUrl: { type: String, trim: true, default: "" },
    websiteUrl: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Brand = model("Brand", brandSchema);
