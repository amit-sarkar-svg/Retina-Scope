import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { ENV } from '../config/env';
import { HTTP_STATUS } from '../config/constants';
import { ApiResponse } from '../utils/api-response';
import { JwtPayload } from '../types/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ApiResponse.error(
      res,
      'UNAUTHORIZED',
      'Authentication required. Please provide a valid Bearer token.',
      HTTP_STATUS.UNAUTHORIZED
    );
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      ApiResponse.error(
        res,
        'TOKEN_EXPIRED',
        'Authentication token has expired. Please log in again.',
        HTTP_STATUS.UNAUTHORIZED
      );
      return;
    }

    ApiResponse.error(
      res,
      'INVALID_TOKEN',
      'Authentication token is invalid.',
      HTTP_STATUS.UNAUTHORIZED
    );
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponse.error(
        res,
        'UNAUTHORIZED',
        'Authentication required.',
        HTTP_STATUS.UNAUTHORIZED
      );
      return;
    }

    if (!roles.includes(req.user.role)) {
      ApiResponse.error(
        res,
        'FORBIDDEN',
        `Access forbidden. Requires one of roles: [${roles.join(', ')}]. Current role: ${req.user.role}`,
        HTTP_STATUS.FORBIDDEN
      );
      return;
    }

    next();
  };
};
