import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import status from "http-status";
import * as z from "zod";
import { TErrorResponse, TErrorSources } from "../types/errorResponse.type";
import { handleZodError } from "../errorHelpers/handleZodError";
import { AppError } from "../errorHelpers/AppError";
// import { deleteFileFromCloudinary } from "../config/cloudinary.config";
import { deleteUploadedFilesFromGlobalErrorHandler } from "../utils/deleteUploadedFilesFromGlobalErrorHandler";

export const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (env.NODE_ENV === "development") {
    console.error("Global Error Handler:", err);
  }

  // If there are uploaded files in the request, attempt to delete them from Cloudinary

  // if (req.file) {
  //   await deleteFileFromCloudinary(req.file.path);
  // }

  // if (req.files && Array.isArray(req.files) && req.files.length > 0) {
  //   const imageUrls = req.files.map((file) => file.path);

  //   await Promise.all(imageUrls.map((url) => deleteFileFromCloudinary(url)));
  // }

  await deleteUploadedFilesFromGlobalErrorHandler(req);

  const errorSources: TErrorSources[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal server error";
  let stack: string | undefined = undefined;

  // Handle Zod validation errors
  if (err instanceof z.ZodError) {
    const simplifiedError = handleZodError(err);

    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSources.push(...(simplifiedError.errorSources || []));
    stack = err.stack;
  } else if (err instanceof AppError) {
    // Handle custom application errors
    statusCode = err.statusCode || status.INTERNAL_SERVER_ERROR;
    message = err.message || message;
    stack = err.stack;
  } else if (err instanceof Error) {
    // Handle generic errors
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = err.message || message;
    stack = err.stack;
  }

  const errorResponse: TErrorResponse = {
    success: false,
    message,
    errorSources: errorSources.length > 0 ? errorSources : undefined,
    error: env.NODE_ENV === "development" ? err : undefined,
    stack: env.NODE_ENV === "development" ? stack : undefined,
  };

  res.status(statusCode).json(errorResponse);
};
