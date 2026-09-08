import type { UploadApiResponse } from "cloudinary";
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

export async function uploadCatalogImage(buffer: Buffer): Promise<UploadedImage> {
  if (!isCloudinaryConfigured) {
    throw new AppError("Cloudinary is not configured", 503);
  }

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.CLOUDINARY_FOLDER,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, uploaded) => {
        if (error || !uploaded) reject(error ?? new Error("Upload failed"));
        else resolve(uploaded);
      },
    );
    stream.end(buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}
