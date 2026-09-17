import { Schema, model } from "mongoose";

const addressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fullName: { type: String, required: true, trim: true, maxlength: 160 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    country: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      default: "Rwanda",
    },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    district: { type: String, trim: true, maxlength: 100, default: "" },
    sector: { type: String, trim: true, maxlength: 100, default: "" },
    addressLine: { type: String, required: true, trim: true, maxlength: 300 },
    landmark: { type: String, trim: true, maxlength: 200, default: "" },
    postalCode: { type: String, trim: true, maxlength: 30, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);
addressSchema.index({ user: 1, isDefault: 1 });
export const Address = model("Address", addressSchema);
