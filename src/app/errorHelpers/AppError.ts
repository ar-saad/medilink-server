import status from "http-status";

export class AppError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string, stack = "") {
    super(message);
    this.statusCode = statusCode;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(status.BAD_REQUEST, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(status.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(status.FORBIDDEN, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(status.NOT_FOUND, message);
  }
}
