import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '@/errors/app-error.js';
import { logger } from '@/config/logger.js';

interface ErrorBody {
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: Readonly<Record<string, unknown>>;
  };
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      requestId: req.requestId,
    },
  } satisfies ErrorBody);
}

/**
 * Global error handler. Must be registered LAST.
 * - AppError → structured JSON with its status/code.
 * - ZodError → 400 with field-level details.
 * - Anything else → 500 with generic message (details logged, not returned).
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    logger.warn(
      { requestId: req.requestId, code: err.code, details: err.details, err },
      'handled error',
    );
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        requestId: req.requestId,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    } satisfies ErrorBody);
    return;
  }

  if (err instanceof ZodError) {
    logger.warn({ requestId: req.requestId, err }, 'validation error');
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        requestId: req.requestId,
        details: { issues: err.flatten() },
      },
    } satisfies ErrorBody);
    return;
  }

  logger.error({ requestId: req.requestId, err }, 'unhandled error');
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      requestId: req.requestId,
    },
  } satisfies ErrorBody);
}
