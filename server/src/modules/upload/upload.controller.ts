import type { RequestHandler } from "express";
import { AppError } from "../../utils/AppError.js";
import { uploadCatalogImage } from "./upload.service.js";

export const uploadImage: RequestHandler = async (request, response) => {
  if (!request.is("image/*")) {
    throw new AppError("Content-Type must be an image", 415);
  }
  if (!Buffer.isBuffer(request.body) || request.body.length === 0) {
    throw new AppError("Image file is required", 400);
  }

  const image = await uploadCatalogImage(request.body);
  response.status(201).json({
    success: true,
    data: image,
    message: "Image uploaded",
  });
};
