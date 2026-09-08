import express, { Router } from "express";
import { uploadImage } from "./upload.controller.js";

export const uploadRouter = Router();

uploadRouter.post(
  "/images",
  express.raw({ type: "image/*", limit: "8mb" }),
  uploadImage,
);
