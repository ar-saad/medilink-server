import status from "http-status";
import { Prisma } from "../../generated/prisma/client";
import { TErrorResponse, TErrorSources } from "../types/errorResponse.type";

const getStatusCodeFromPrismaError = (errorCode: string): number => {
  // P2002: Unique constraint failed
  if (errorCode === "P2002") {
    return status.CONFLICT; // 409
  }

  // P2001, P2015, P2018, P2025: Record not found
  if (["P2001", "P2015", "P2018", "P2025"].includes(errorCode)) {
    return status.NOT_FOUND; // 404
  }

  // P1000, P6002: DB Authentication error
  if (["P1000", "P6002"].includes(errorCode)) {
    return status.UNAUTHORIZED; // 401
  }

  // P1010, P6010: Access denied error
  if (["P1010", "P6010"].includes(errorCode)) {
    return status.FORBIDDEN; // 403
  }

  // P6003: Prisma Accelerate plan limit reached
  if (errorCode === "P6003") {
    return status.PAYMENT_REQUIRED; // 402
  }

  // P1008, P2004, P6004: Timeout error
  if (["P1008", "P2004", "P6004"].includes(errorCode)) {
    return status.GATEWAY_TIMEOUT; // 504
  }

  // P5011: Rate limit exceeded
  if (errorCode === "P5011") {
    return status.TOO_MANY_REQUESTS; // 429
  }

  // P6009: Response size limit exceeded
  if (errorCode === "P6009") {
    return status.REQUEST_ENTITY_TOO_LARGE; // 413
  }

  // P1XXX, P2024, P2037, P6008: Connection error
  if (
    errorCode.startsWith("P1") ||
    ["P2024", "P2037", "P6008"].includes(errorCode)
  ) {
    return status.SERVICE_UNAVAILABLE; // 503
  }

  // P2XXX: Except unhandled errors, Bad Request
  if (errorCode.startsWith("P2")) {
    return status.BAD_REQUEST; // 400
  }

  // P3XXX, P4XXX: Internal server error
  if (errorCode.startsWith("P3") || errorCode.startsWith("P4")) {
    return status.INTERNAL_SERVER_ERROR; // 500
  }

  return status.INTERNAL_SERVER_ERROR;
};

const formatPrismaErrorMeta = (meta?: Record<string, unknown>): string => {
  if (!meta) return "";

  const parts: string[] = [];

  if (meta.target) {
    parts.push(`Field(s): ${String(meta.target)}`);
  }

  if (meta.field_name) {
    parts.push(`Field: ${String(meta.field_name)}`);
  }

  if (meta.column_name) {
    parts.push(`Column: ${String(meta.column_name)}`);
  }

  if (meta.table) {
    parts.push(`Table: ${String(meta.table)}`);
  }

  if (meta.model_name) {
    parts.push(`Model: ${String(meta.model_name)}`);
  }

  if (meta.relation_name) {
    parts.push(`Relation: ${String(meta.relation_name)}`);
  }

  if (meta.constraint) {
    parts.push(`Constraint: ${String(meta.constraint)}`);
  }

  if (meta.database_error) {
    parts.push(`Database Error: ${String(meta.database_error)}`);
  }

  return parts.length > 0 ? parts.join(" | ") : "";
};

export const handlePrismaClientKnownRequestError = (
  error: Prisma.PrismaClientKnownRequestError,
): TErrorResponse => {
  const statusCode = getStatusCodeFromPrismaError(error.code);
  const metaInfo = formatPrismaErrorMeta(error.meta);

  let message = error.message;

  // Remove the "Invalid `prisma.user.create()` invocation: " part from the message for better readability
  message = message.replace(/Invalid `.*?` invocation:?\s*/i, "");

  // split by new line and take the first line as the main message, rest can be added to error sources
  const lines = message.split("\n").filter((line) => line.trim());
  const mainMessage =
    lines[0] || "An error occurred with the database operation.";

  const errorSources: TErrorSources[] = [
    {
      path: error.code,
      message: metaInfo ? `${mainMessage} | ${metaInfo}` : mainMessage,
    },
  ];

  if (error.meta?.cause) {
    errorSources.push({
      path: "cause",
      message: String(error.meta.cause),
    });
  }

  return {
    success: false,
    statusCode,
    message: `Prisma Client Known Request Error: ${mainMessage}`,
    errorSources,
  };
};

export const handlePrismaClientUnknownRequestError = (
  error: Prisma.PrismaClientUnknownRequestError,
): TErrorResponse => {
  let message = error.message;

  // Remove the "Invalid `prisma.user.create()` invocation: " part from the message for better readability
  message = message.replace(/Invalid `.*?` invocation:?\s*/i, "");

  const lines = message.split("\n").filter((line) => line.trim());
  const mainMessage =
    lines[0] || "An unknown error occurred with the database operation.";

  const errorSources: TErrorSources[] = [
    {
      path: "Unknown Prisma Error",
      message: mainMessage,
    },
  ];

  return {
    success: false,
    statusCode: status.INTERNAL_SERVER_ERROR,
    message: `Prisma Client Unknown Request Error: ${mainMessage}`,
    errorSources,
  };
};

export const handlePrismaClientValidationError = (
  error: Prisma.PrismaClientValidationError,
): TErrorResponse => {
  let message = error.message;

  // Remove the "Invalid `prisma.user.create()` invocation: " part from the message for better readability
  message = message.replace(/Invalid `.*?` invocation:?\s*/i, "");

  const lines = message.split("\n").filter((line) => line.trim());

  const errorSources: TErrorSources[] = [];

  // extract field name for field-specific validation errors
  // Example message: "Argument `data.email`: Got invalid value `invalid-email` on prisma.user.create()"
  const fieldMatch = message.match(/Argument `(\w+)`/i);
  const fieldName = fieldMatch ? fieldMatch[1] : "Unknown Field";

  //main message

  const mainMessage =
    lines.find(
      (line) =>
        !line.includes("Argument") && !line.includes("→") && line.length > 10,
    ) ||
    lines[0] ||
    "Invalid query parameters provided to the database operation.";

  errorSources.push({
    path: fieldName,
    message: mainMessage,
  });

  return {
    success: false,
    statusCode: status.BAD_REQUEST,
    message: `Prisma Client Validation Error: ${mainMessage}`,
    errorSources,
  };
};

export const handlePrismaClientInitializationError = (
  error: Prisma.PrismaClientInitializationError,
): TErrorResponse => {
  const statusCode = error.errorCode
    ? getStatusCodeFromPrismaError(error.errorCode)
    : status.SERVICE_UNAVAILABLE;

  let message = error.message;

  message = message.replace(/Invalid `.*?` invocation:?\s*/i, "");

  const lines = message.split("\n").filter((line) => line.trim());

  const mainMessage =
    lines[0] || "An error occurred while initializing the Prisma Client.";

  const errorSources: TErrorSources[] = [
    {
      path: error.errorCode || "Initialization Error",
      message: mainMessage,
    },
  ];

  return {
    success: false,
    statusCode,
    message: `Prisma Client Initialization Error: ${mainMessage}`,
    errorSources,
  };
};

export const handlePrismaClientRustPanicError = (): TErrorResponse => {
  const errorSources: TErrorSources[] = [
    {
      path: "Rust Engine Crashed",
      message:
        "The database engine encountered a fatal error and crashed. This is usually due to an internal bug in the Prisma engine or an unexpected edge case in the database operation. Please check the Prisma logs for more details and consider reporting this issue to the Prisma team if it persists.",
    },
  ];

  return {
    success: false,
    statusCode: status.INTERNAL_SERVER_ERROR,
    message:
      "Prisma Client Rust Panic Error: The database engine crashed due to a fatal error.",
    errorSources,
  };
};
