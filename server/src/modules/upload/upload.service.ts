import { cloudinary, isCloudinaryConfigured } from "../../config/cloudinary.js";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

interface CloudinaryUploadError {
  http_code?: number;
  message?: string;
}

function normalizeUploadError(error: unknown): AppError {
  const cloudinaryError =
    typeof error === "object" && error !== null
      ? (error as CloudinaryUploadError)
      : undefined;

  if (cloudinaryError?.http_code === 401) {
    return new AppError(
      "Cloudinary authentication failed. Check the API key and secret.",
      502,
    );
  }

  if (cloudinaryError?.http_code === 403) {
    return new AppError(
      "Cloudinary rejected image uploads. Verify that this cloud uses Programmable Media and permits Upload API access.",
      502,
    );
  }

  if (cloudinaryError?.http_code === 400) {
    return new AppError(
      cloudinaryError.message ?? "Cloudinary rejected the image file.",
      400,
    );
  }

  return new AppError("Image upload service is currently unavailable.", 502);
}

export async function uploadCatalogImage(
  buffer: Buffer,
  mimeType: string,
): Promise<UploadedImage> {
  if (!isCloudinaryConfigured) {
    throw new AppError("Cloudinary is not configured", 503);
  }

  const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;
  let result;
  try {
    result = await cloudinary.uploader.upload(dataUri, {
      folder: env.CLOUDINARY_FOLDER,
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
  } catch (error: unknown) {
    throw normalizeUploadError(error);
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}
