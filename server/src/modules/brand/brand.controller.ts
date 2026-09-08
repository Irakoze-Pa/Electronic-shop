import type { RequestHandler } from "express";
import { idParamsSchema } from "../shared/validation.js";
import { brandService } from "./brand.service.js";
import { createBrandSchema, updateBrandSchema } from "./brand.validation.js";

export const listBrands: RequestHandler = async (request, response) => {
  response.json({
    success: true,
    data: await brandService.list(request.authUser?.role === "Admin"),
  });
};
export const getBrand: RequestHandler = async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  response.json({
    success: true,
    data: await brandService.get(id, request.authUser?.role === "Admin"),
  });
};
export const createBrand: RequestHandler = async (request, response) => {
  const input = createBrandSchema.parse(request.body);
  response
    .status(201)
    .json({
      success: true,
      data: await brandService.create(input),
      message: "Brand created",
    });
};
export const updateBrand: RequestHandler = async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  const input = updateBrandSchema.parse(request.body);
  response.json({
    success: true,
    data: await brandService.update(id, input),
    message: "Brand updated",
  });
};
export const deleteBrand: RequestHandler = async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  await brandService.remove(id);
  response.status(200).json({ success: true, message: "Brand deleted" });
};
