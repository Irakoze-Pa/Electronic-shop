import type { RequestHandler } from "express";
import { Brand } from "../models/brand.model.js";
import { Category } from "../models/category.model.js";
import { InventoryTransaction } from "../models/inventory-transaction.model.js";
import { Product } from "../models/product.model.js";
import { AppError } from "../utils/AppError.js";
import { slugify } from "../utils/slugify.js";
import {
  idParamsSchema,
  productInputSchema,
  productUpdateSchema,
} from "../validation/catalog.validation.js";

async function ensureRelations(category: string, brand: string): Promise<void> {
  const [categoryExists, brandExists] = await Promise.all([
    Category.exists({ _id: category }),
    Brand.exists({ _id: brand }),
  ]);
  if (!categoryExists) throw new AppError("Category not found", 400);
  if (!brandExists) throw new AppError("Brand not found", 400);
}

export const listProducts: RequestHandler = async (request, response) => {
  const page = Math.max(Number(request.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(request.query.limit) || 20, 1), 100);
  const filter = request.query.search
    ? { $text: { $search: String(request.query.search) } }
    : {};
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);
  response.json({
    success: true,
    data: products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const getProduct: RequestHandler = async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  const product = await Product.findById(id)
    .populate("category", "name slug")
    .populate("brand", "name slug");
  if (!product) throw new AppError("Product not found", 404);
  response.json({ success: true, data: product });
};

export const createProduct: RequestHandler = async (request, response) => {
  const input = productInputSchema.parse(request.body);
  await ensureRelations(input.category, input.brand);
  const product = await Product.create({
    ...input,
    sku: input.sku.toUpperCase(),
    slug: slugify(input.name),
  });
  response.status(201).json({ success: true, data: product });
};

export const updateProduct: RequestHandler = async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  const input = productUpdateSchema.parse(request.body);
  if (input.category || input.brand) {
    const existing = await Product.findById(id);
    if (!existing) throw new AppError("Product not found", 404);
    await ensureRelations(
      input.category ?? existing.category.toString(),
      input.brand ?? existing.brand.toString(),
    );
  }
  const product = await Product.findByIdAndUpdate(
    id,
    {
      ...input,
      ...(input.name ? { slug: slugify(input.name) } : {}),
      ...(input.sku ? { sku: input.sku.toUpperCase() } : {}),
    },
    { new: true, runValidators: true },
  );
  if (!product) throw new AppError("Product not found", 404);
  response.json({ success: true, data: product });
};

export const deleteProduct: RequestHandler = async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  if (await InventoryTransaction.exists({ product: id })) {
    throw new AppError(
      "Products with inventory history cannot be deleted",
      409,
    );
  }
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new AppError("Product not found", 404);
  response.status(204).send();
};
