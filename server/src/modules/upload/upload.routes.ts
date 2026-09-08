import express, { Router } from "express";
import { uploadImage } from "./upload.controller.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";

export const uploadRouter = Router();

uploadRouter.post(
  "/images",
  requireAuth,
  requireRole("Admin"),
  express.raw({ type: "image/*", limit: "8mb" }),
  uploadImage,
);
