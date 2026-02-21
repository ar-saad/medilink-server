import status from "http-status";
import * as z from "zod";
import { TErrorResponse, TErrorSources } from "../types/errorResponse.type";

export const handleZodError = (err: z.ZodError): TErrorResponse => {
  const statusCode = status.BAD_REQUEST;
  const message = "Zod Validation error";
  const errorSources: TErrorSources[] = [];

  err.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join(".") || "unknown",
      message: issue.message,
    });
  });

  return {
    statusCode,
    success: false,
    message,
    errorSources,
  };
};
