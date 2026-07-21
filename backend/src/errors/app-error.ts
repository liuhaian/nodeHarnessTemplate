export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export interface AppErrorOptions {
  readonly cause?: unknown;
  readonly details?: Readonly<Record<string, unknown>>;
}

/**
 * Base class for all expected/handled errors thrown by the app.
 * The global error middleware maps these to JSON responses.
 * Anything not extending AppError is treated as a 500.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: Readonly<Record<string, unknown>>;

  constructor(
    code: ErrorCode,
    status: number,
    message: string,
    options: AppErrorOptions = {},
  ) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = new.target.name;
    this.code = code;
    this.status = status;
    if (options.details !== undefined) {
      this.details = options.details;
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, options?: AppErrorOptions) {
    super('VALIDATION_ERROR', 400, message, options);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, options?: AppErrorOptions) {
    super('NOT_FOUND', 404, message, options);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', options?: AppErrorOptions) {
    super('UNAUTHORIZED', 401, message, options);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', options?: AppErrorOptions) {
    super('FORBIDDEN', 403, message, options);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, options?: AppErrorOptions) {
    super('CONFLICT', 409, message, options);
  }
}
