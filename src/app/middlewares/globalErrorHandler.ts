import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import status from "http-status";
import * as z from "zod";
import { TErrorResponse, TErrorSources } from "../types/errorResponse.type";
import { handleZodError } from "../errorHelpers/handleZodError";

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (env.NODE_ENV === "development") {
    console.error("Global Error Handler:", err);
  }

  const errorSources: TErrorSources[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal server error";

  // Handle Zod validation errors
  if (err instanceof z.ZodError) {
    const simplifiedError = handleZodError(err);

    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSources.push(...(simplifiedError.errorSources || []));
  }

  const errorResponse: TErrorResponse = {
    success: false,
    message,
    errorSources: errorSources.length > 0 ? errorSources : undefined,
    error: env.NODE_ENV === "development" ? err : undefined,
  };

  res.status(statusCode).json(errorResponse);
};
