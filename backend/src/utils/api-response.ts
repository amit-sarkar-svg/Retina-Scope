import { Response } from 'express';
import { HTTP_STATUS } from '../config/constants';

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = HTTP_STATUS.OK,
    pagination?: PaginationInfo
  ) {
    const payload: {
      success: true;
      data: T;
      message?: string;
      pagination?: PaginationInfo;
    } = {
      success: true,
      data,
    };

    if (message) {
      payload.message = message;
    }

    if (pagination) {
      payload.pagination = pagination;
    }

    return res.status(statusCode).json(payload);
  }

  static error(
    res: Response,
    code: string,
    message: string,
    statusCode: number = HTTP_STATUS.BAD_REQUEST,
    details?: unknown
  ) {
    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    });
  }
}
