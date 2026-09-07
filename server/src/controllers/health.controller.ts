import type { Request, Response } from "express";

export function getHealth(_request: Request, response: Response): void {
  response.status(200).json({
    success: true,
    data: {
      service: "electronic-shop-api",
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
}
