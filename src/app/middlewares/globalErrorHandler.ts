import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import status from "http-status";

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (env.NODE_ENV === "development") {
    console.error("Global Error Handler:", err);
  }

  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal server error";

  res.status(statusCode).json({
    success: false,
    message: message,
    error: err.message,
  });
};
