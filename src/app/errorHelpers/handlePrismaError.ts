import status from "http-status";

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

export const handlePrismaClientKnownRequestError = (error: any) => {};
