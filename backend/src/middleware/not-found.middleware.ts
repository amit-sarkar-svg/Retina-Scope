import { Request, Response } from 'express';
import { HTTP_STATUS } from '../config/constants';
import { ApiResponse } from '../utils/api-response';

export const notFoundHandler = (req: Request, res: Response): void => {
  ApiResponse.error(
    res,
    'ROUTE_NOT_FOUND',
    `Cannot ${req.method} ${req.originalUrl} - Endpoint does not exist`,
    HTTP_STATUS.NOT_FOUND
  );
};
