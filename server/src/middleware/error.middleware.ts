import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(
    new AppError(
      `Route ${request.method} ${request.originalUrl} not found`,
      404,
    ),
  );
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  void _next;

  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.flatten().fieldErrors,
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    response.status(400).json({
      success: false,
      message: "Database validation failed",
      errors: Object.values(error.errors).map((item) => item.message),
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    response.status(400).json({ success: false, message: "Invalid identifier" });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    response.status(409).json({
      success: false,
      message: "A record with that unique value already exists",
    });
    return;
  }

  const knownError = error instanceof AppError;
  const statusCode = knownError ? error.statusCode : 500;
  const message = knownError ? error.message : "Internal server error";

  if (!knownError) console.error(error);

  response.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === "development" && error instanceof Error
      ? { stack: error.stack }
      : {}),
  });
};
