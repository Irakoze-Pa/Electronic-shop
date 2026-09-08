import type { RequestHandler } from "express";
import { idParamsSchema } from "../shared/validation.js";
import { categoryService } from "./category.service.js";
import { createCategorySchema, updateCategorySchema } from "./category.validation.js";

export const listCategories: RequestHandler = async (_request, response) => { response.json({ success: true, data: await categoryService.list() }); };
export const getCategory: RequestHandler = async (request, response) => { const { id } = idParamsSchema.parse(request.params); response.json({ success: true, data: await categoryService.get(id) }); };
export const createCategory: RequestHandler = async (request, response) => { const input = createCategorySchema.parse(request.body); response.status(201).json({ success: true, data: await categoryService.create(input), message: "Category created" }); };
export const updateCategory: RequestHandler = async (request, response) => { const { id } = idParamsSchema.parse(request.params); const input = updateCategorySchema.parse(request.body); response.json({ success: true, data: await categoryService.update(id, input), message: "Category updated" }); };
export const deleteCategory: RequestHandler = async (request, response) => { const { id } = idParamsSchema.parse(request.params); await categoryService.remove(id); response.status(200).json({ success: true, message: "Category deleted" }); };
