import type { RequestHandler } from "express";
import { Brand } from "../models/brand.model.js";
import { Product } from "../models/product.model.js";
import { AppError } from "../utils/AppError.js";
import { slugify } from "../utils/slugify.js";
import {
  brandInputSchema,
  brandUpdateSchema,
  idParamsSchema,
} from "../validation/catalog.validation.js";

export const listBrands: RequestHandler = async (_request, response) => {
  const brands = await Brand.find().sort({ name: 1 });
  response.json({ success: true, data: brands });
};

export const getBrand: RequestHandler = async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  const brand = await Brand.findById(id);
  if (!brand) throw new AppError("Brand not found", 404);
  response.json({ success: true, data: brand });
};

export const createBrand: RequestHandler = async (request, response) => {
  const input = brandInputSchema.parse(request.body);
  const brand = await Brand.create({ ...input, slug: slugify(input.name) });
  response.status(201).json({ success: true, data: brand });
};

export const updateBrand: RequestHandler = async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  const input = brandUpdateSchema.parse(request.body);
  const brand = await Brand.findByIdAndUpdate(
    id,
    { ...input, ...(input.name ? { slug: slugify(input.name) } : {}) },
    { new: true, runValidators: true },
  );
  if (!brand) throw new AppError("Brand not found", 404);
  response.json({ success: true, data: brand });
};

export const deleteBrand: RequestHandler = async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  if (await Product.exists({ brand: id })) {
    throw new AppError("Brand is assigned to products", 409);
  }
  const brand = await Brand.findByIdAndDelete(id);
  if (!brand) throw new AppError("Brand not found", 404);
  response.status(204).send();
};
