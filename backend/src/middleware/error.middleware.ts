import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import { HTTP_STATUS } from '../config/constants';
import { ENV } from '../config/env';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(message: string, statusCode: number = HTTP_STATUS.BAD_REQUEST, code: string = 'BAD_REQUEST', details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Custom Application Error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));

    res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: formattedErrors,
      },
    });
    return;
  }

  // Multer Upload Errors
  if (err instanceof multer.MulterError) {
    let message = err.message;
    let code = 'UPLOAD_ERROR';

    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Uploaded image file exceeds the maximum allowed size (15MB)';
      code = 'FILE_TOO_LARGE';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = `Unexpected file field: ${err.field}. Please upload with field name 'image'.`;
      code = 'INVALID_FIELD';
    }

    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        code,
        message,
      },
    });
    return;
  }

  // Prisma Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || [];
      const fields = Array.isArray(target) ? target.join(', ') : 'unique field';
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: {
          code: 'CONFLICT_ERROR',
          message: `A record with this ${fields} already exists.`,
          details: { target },
        },
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Requested record was not found.',
        },
      });
      return;
    }

    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
        details: ENV.IS_PRODUCTION ? undefined : err.message,
      },
    });
    return;
  }

  // JSON Body Parse Error
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Malformed JSON payload in request body',
      },
    });
    return;
  }

  // Generic Internal Server Error (never leak stack or secrets)
  const isDev = !ENV.IS_PRODUCTION;
  console.error('[Unhandled Error]', err);

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred',
      details: isDev ? err.message : undefined,
    },
  });
};
