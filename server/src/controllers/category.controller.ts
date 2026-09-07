import type { RequestHandler } from "express";
import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import { AppError } from "../utils/AppError.js";
import { slugify } from "../utils/slugify.js";
import {
  categoryInputSchema,
  categoryUpdateSchema,
  idParamsSchema,
} from "../validation/catalog.validation.js";

export const listCategories: RequestHandler = async (_request, response) => {
  const categories = await Category.find().sort({ name: 1 });
  response.json({ success: true, data: categories });
};

export const getCategory: RequestHandler = async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  const category = await Category.findById(id);
  if (!category) throw new AppError("Category not found", 404);
  response.json({ success: true, data: category });
};

export const createCategory: RequestHandler = async (request, response) => {
  const input = categoryInputSchema.parse(request.body);
  const category = await Category.create({
    ...input,
    slug: slugify(input.name),
  });
  response.status(201).json({ success: true, data: category });
};

export const updateCategory: RequestHandler = async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  const input = categoryUpdateSchema.parse(request.body);
  const category = await Category.findByIdAndUpdate(
    id,
    { ...input, ...(input.name ? { slug: slugify(input.name) } : {}) },
    { new: true, runValidators: true },
  );
  if (!category) throw new AppError("Category not found", 404);
  response.json({ success: true, data: category });
};

export const deleteCategory: RequestHandler = async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  if (await Product.exists({ category: id })) {
    throw new AppError("Category is assigned to products", 409);
  }
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new AppError("Category not found", 404);
  response.status(204).send();
};
