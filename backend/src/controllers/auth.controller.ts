import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { ApiResponse } from '../utils/api-response';
import { HTTP_STATUS } from '../config/constants';
import { AppError } from '../middleware/error.middleware';

export class AuthController {
  public register = async (req: Request, res: Response) => {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.register(validatedData);
    return ApiResponse.success(res, result, 'User registered successfully', HTTP_STATUS.CREATED);
  };

  public login = async (req: Request, res: Response) => {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData);
    return ApiResponse.success(res, result, 'Login successful', HTTP_STATUS.OK);
  };

  public getMe = async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
    }
    const user = await authService.getMe(req.user.id);
    return ApiResponse.success(res, { user }, 'User profile retrieved', HTTP_STATUS.OK);
  };
}

export const authController = new AuthController();
