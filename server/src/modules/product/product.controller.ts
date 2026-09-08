import type { RequestHandler } from "express";
import { idParamsSchema } from "../shared/validation.js";
import { productService } from "./product.service.js";
import { createProductSchema, productQuerySchema, updateProductSchema } from "./product.validation.js";

export const listProducts: RequestHandler = async (request, response) => { const result = await productService.list(productQuerySchema.parse(request.query)); response.json({ success: true, data: result.items, pagination: result.pagination }); };
export const getProduct: RequestHandler = async (request, response) => { const { id } = idParamsSchema.parse(request.params); response.json({ success: true, data: await productService.get(id) }); };
export const createProduct: RequestHandler = async (request, response) => { const input = createProductSchema.parse(request.body); response.status(201).json({ success: true, data: await productService.create(input), message: "Product created" }); };
export const updateProduct: RequestHandler = async (request, response) => { const { id } = idParamsSchema.parse(request.params); const input = updateProductSchema.parse(request.body); response.json({ success: true, data: await productService.update(id, input), message: "Product updated" }); };
export const deleteProduct: RequestHandler = async (request, response) => { const { id } = idParamsSchema.parse(request.params); await productService.remove(id); response.json({ success: true, message: "Product deleted" }); };
