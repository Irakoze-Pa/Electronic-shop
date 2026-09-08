import type { QueryFilter, SortOrder } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { slugify } from "../../utils/slugify.js";
import { Brand } from "../brand/brand.model.js";
import { Category } from "../category/category.model.js";
import { Product } from "./product.model.js";
import type { ProductInput, ProductQuery } from "./product.types.js";

async function validateReferences(category: string, brand: string) {
  const [categoryExists, brandExists] = await Promise.all([Category.exists({ _id: category }), Brand.exists({ _id: brand })]);
  if (!categoryExists) throw new AppError("Category not found", 400);
  if (!brandExists) throw new AppError("Brand not found", 400);
}

export const productService = {
  async list(query: ProductQuery) {
    const filter: QueryFilter<unknown> = {};
    if (query.search) filter.$text = { $search: query.search };
    if (query.category) filter.category = query.category;
    if (query.brand) filter.brand = query.brand;
    if (query.status) filter.status = query.status;
    if (query.featured !== undefined) filter.featured = query.featured;
    if (query.bestSeller !== undefined) filter.bestSeller = query.bestSeller;
    if (query.newArrival !== undefined) filter.newArrival = query.newArrival;
    const sorts: Record<ProductQuery["sort"], Record<string, SortOrder>> = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, "price-asc": { price: 1 }, "price-desc": { price: -1 }, "name-asc": { name: 1 } };
    const [items, total] = await Promise.all([
      Product.find(filter).populate("category", "name slug status").populate("brand", "name slug status").sort(sorts[query.sort]).skip((query.page - 1) * query.limit).limit(query.limit),
      Product.countDocuments(filter),
    ]);
    return { items, pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } };
  },
  async get(id: string) { const product = await Product.findById(id).populate("category", "name slug status").populate("brand", "name slug status"); if (!product) throw new AppError("Product not found", 404); return product; },
  async create(input: ProductInput) {
    await validateReferences(input.category, input.brand);
    const slug = slugify(input.name); const code = input.code.toUpperCase();
    if (await Product.exists({ $or: [{ slug }, { code }] })) throw new AppError("Product slug or code already exists", 409);
    return Product.create({ ...input, slug, code });
  },
  async update(id: string, input: Partial<ProductInput>) {
    const existing = await Product.findById(id); if (!existing) throw new AppError("Product not found", 404);
    await validateReferences(input.category ?? existing.category.toString(), input.brand ?? existing.brand.toString());
    const nextPrice = input.price ?? existing.price;
    const nextOldPrice = input.oldPrice === undefined ? existing.oldPrice : input.oldPrice;
    if (nextOldPrice != null && nextOldPrice < nextPrice) {
      throw new AppError("Old price must be greater than or equal to price", 400);
    }
    const slug = input.name ? slugify(input.name) : undefined; const code = input.code?.toUpperCase();
    if ((slug || code) && (await Product.exists({ _id: { $ne: id }, $or: [...(slug ? [{ slug }] : []), ...(code ? [{ code }] : [])] }))) throw new AppError("Product slug or code already exists", 409);
    const product = await Product.findByIdAndUpdate(id, { ...input, ...(slug ? { slug } : {}), ...(code ? { code } : {}) }, { new: true, runValidators: true });
    if (!product) throw new AppError("Product not found", 404); return product;
  },
  async remove(id: string) { const product = await Product.findByIdAndDelete(id); if (!product) throw new AppError("Product not found", 404); },
};
