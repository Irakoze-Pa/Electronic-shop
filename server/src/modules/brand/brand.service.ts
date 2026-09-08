import { AppError } from "../../utils/AppError.js";
import { slugify } from "../../utils/slugify.js";
import { Product } from "../product/product.model.js";
import { Brand } from "./brand.model.js";
import type { BrandInput } from "./brand.types.js";

export const brandService = {
  list: () => Brand.find().sort({ name: 1 }),
  async get(id: string) { const brand = await Brand.findById(id); if (!brand) throw new AppError("Brand not found", 404); return brand; },
  async create(input: BrandInput) { const slug = slugify(input.name); if (await Brand.exists({ $or: [{ slug }, { name: input.name }] })) throw new AppError("Brand name or slug already exists", 409); return Brand.create({ ...input, slug }); },
  async update(id: string, input: Partial<BrandInput>) { const slug = input.name ? slugify(input.name) : undefined; if (slug && (await Brand.exists({ slug, _id: { $ne: id } }))) throw new AppError("Brand slug already exists", 409); const brand = await Brand.findByIdAndUpdate(id, { ...input, ...(slug ? { slug } : {}) }, { returnDocument: "after", runValidators: true }); if (!brand) throw new AppError("Brand not found", 404); return brand; },
  async remove(id: string) { if (await Product.exists({ brand: id })) throw new AppError("Brand is assigned to products", 409); const brand = await Brand.findByIdAndDelete(id); if (!brand) throw new AppError("Brand not found", 404); },
};
