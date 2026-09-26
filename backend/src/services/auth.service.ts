import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { prisma } from '../prisma/client';
import { ENV } from '../config/env';
import { AppError } from '../middleware/error.middleware';
import { HTTP_STATUS } from '../config/constants';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { AuthSuccessResponse, JwtPayload, UserResponse } from '../types/auth.types';

export class AuthService {
  private static sanitizeUser(user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: (ENV.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
    });
  }

  public async register(input: RegisterInput): Promise<AuthSuccessResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError(
        'A user with this email address already exists.',
        HTTP_STATUS.CONFLICT,
        'EMAIL_ALREADY_EXISTS'
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: input.email.toLowerCase().trim(),
        passwordHash,
        role: input.role || UserRole.SCREENING_OPERATOR,
      },
    });

    const jwtPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = AuthService.generateToken(jwtPayload);
    return {
      user: AuthService.sanitizeUser(user),
      token,
    };
  }

  public async login(input: LoginInput): Promise<AuthSuccessResponse> {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new AppError(
        'Invalid email or password.',
        HTTP_STATUS.UNAUTHORIZED,
        'INVALID_CREDENTIALS'
      );
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError(
        'Invalid email or password.',
        HTTP_STATUS.UNAUTHORIZED,
        'INVALID_CREDENTIALS'
      );
    }

    const jwtPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = AuthService.generateToken(jwtPayload);
    return {
      user: AuthService.sanitizeUser(user),
      token,
    };
  }

  public async getMe(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    return AuthService.sanitizeUser(user);
  }
}

export const authService = new AuthService();
