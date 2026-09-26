import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { ENV } from '../src/config/env';
import { JwtPayload } from '../src/types/auth.types';

export const createTestToken = (
  user: { id?: string; email?: string; role?: UserRole; name?: string } = {}
): string => {
  const payload: JwtPayload = {
    id: user.id || 'test-user-id-123',
    email: user.email || 'test@retinascope.health',
    role: user.role || UserRole.SPECIALIST,
    name: user.name || 'Test Specialist',
  };

  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '1h' });
};
