import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/prisma/client';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { createTestToken } from './helpers';

describe('Authentication API (/api/auth)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return token', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValueOnce('$2a$10$fake' as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('hashed_password' as never);
      jest.spyOn(prisma.user, 'create').mockResolvedValueOnce({
        id: 'user-uuid-1',
        name: 'Dr. Jane Doe',
        email: 'jane@retinascope.health',
        passwordHash: 'hashed_password',
        role: UserRole.SPECIALIST,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app).post('/api/auth/register').send({
        name: 'Dr. Jane Doe',
        email: 'jane@retinascope.health',
        password: 'SecurePassword123!',
        role: 'SPECIALIST',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('jane@retinascope.health');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.passwordHash).toBeUndefined();
    });

    it('should reject registration if email already exists', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: 'user-uuid-existing',
        name: 'Existing User',
        email: 'existing@retinascope.health',
        passwordHash: 'hash',
        role: UserRole.SCREENING_OPERATOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app).post('/api/auth/register').send({
        name: 'Existing User',
        email: 'existing@retinascope.health',
        password: 'Password123!',
      });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should reject registration with invalid input', async () => {
      const response = await request(app).post('/api/auth/register').send({
        name: '',
        email: 'invalid-email',
        password: '123',
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-uuid-1',
        name: 'Dr. Jane Doe',
        email: 'jane@retinascope.health',
        passwordHash: 'hashed_password',
        role: UserRole.SPECIALIST,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as never);

      const response = await request(app).post('/api/auth/login').send({
        email: 'jane@retinascope.health',
        password: 'SecurePassword123!',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('jane@retinascope.health');
    });

    it('should reject login with wrong password', async () => {
      const mockUser = {
        id: 'user-uuid-1',
        name: 'Dr. Jane Doe',
        email: 'jane@retinascope.health',
        passwordHash: 'hashed_password',
        role: UserRole.SPECIALIST,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as never);

      const response = await request(app).post('/api/auth/login').send({
        email: 'jane@retinascope.health',
        password: 'WrongPassword!',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile when valid token provided', async () => {
      const token = createTestToken({ id: 'user-uuid-1', email: 'jane@retinascope.health' });

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: 'user-uuid-1',
        name: 'Dr. Jane Doe',
        email: 'jane@retinascope.health',
        passwordHash: 'hash',
        role: UserRole.SPECIALIST,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('jane@retinascope.health');
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
