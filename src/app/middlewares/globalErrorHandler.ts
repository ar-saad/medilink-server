import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import status from "http-status";
import * as z from "zod";
import { TErrorResponse, TErrorSources } from "../types/errorResponse.type";
import { handleZodError } from "../errorHelpers/handleZodError";
import { AppError } from "../errorHelpers/AppError";
import { deleteUploadedFilesFromGlobalErrorHandler } from "../utils/deleteUploadedFilesFromGlobalErrorHandler";
import { Prisma } from "../../generated/prisma/client";
import {
  handlePrismaClientKnownRequestError,
  handlePrismaClientUnknownRequestError,
  handlePrismaClientValidationError,
  handlePrismaClientInitializationError,
  handlePrismaClientRustPanicError,
} from "../errorHelpers/handlePrismaError";

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
  await deleteUploadedFilesFromGlobalErrorHandler(req);

  let errorSources: TErrorSources[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal server error";
  let stack: string | undefined = undefined;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known Prisma errors
    const simplifiedError = handlePrismaClientKnownRequestError(err);

    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSources = [...(simplifiedError.errorSources || [])];
    stack = err.stack;
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    // Handle unknown Prisma errors
    const simplifiedError = handlePrismaClientUnknownRequestError(err);

    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSources = [...(simplifiedError.errorSources || [])];
    stack = err.stack;
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    // Handle Prisma validation errors
    const simplifiedError = handlePrismaClientValidationError(err);

    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSources = [...(simplifiedError.errorSources || [])];
    stack = err.stack;
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    // Handle Prisma initialization errors
    const simplifiedError = handlePrismaClientInitializationError(err);

    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSources = [...(simplifiedError.errorSources || [])];
    stack = err.stack;
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    // Handle Prisma Rust panic errors
    const simplifiedError = handlePrismaClientRustPanicError();

    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSources = [...(simplifiedError.errorSources || [])];
    stack = err.stack;
  } else if (err instanceof z.ZodError) {
    // Handle Zod validation errors
    const simplifiedError = handleZodError(err);

    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSources = [...(simplifiedError.errorSources || [])];
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
