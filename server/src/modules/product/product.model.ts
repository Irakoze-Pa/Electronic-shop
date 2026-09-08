import { Schema, model } from "mongoose";
import { catalogStatuses } from "../shared/catalog.types.js";

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
    shortDescription: { type: String, trim: true, maxlength: 300, default: "" },
    description: { type: String, trim: true, maxlength: 5000, default: "" },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0, default: null },
    stock: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, required: true, trim: true, default: "piece" },
    status: { type: String, enum: catalogStatuses, default: "Active", index: true },
    featured: { type: Boolean, default: false, index: true },
    bestSeller: { type: Boolean, default: false, index: true },
    newArrival: { type: Boolean, default: false, index: true },
    images: [{ type: String, trim: true }],
    specifications: { type: Map, of: String, default: {} },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", code: "text", shortDescription: "text", description: "text" });
export const Product = model("Product", productSchema);
