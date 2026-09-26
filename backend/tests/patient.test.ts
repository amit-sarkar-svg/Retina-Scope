import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/prisma/client';
import { Gender } from '@prisma/client';
import { createTestToken } from './helpers';

describe('Patient API (/api/patients)', () => {
  const token = createTestToken();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/patients', () => {
    it('should create a new patient when authenticated', async () => {
      const mockPatient = {
        id: 'patient-uuid-1',
        patientCode: 'P-9001',
        name: 'Anita Verma',
        age: 52,
        gender: Gender.FEMALE,
        phone: '+91 98765 43210',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.patient, 'findUnique').mockResolvedValueOnce(null);
      jest.spyOn(prisma.patient, 'create').mockResolvedValueOnce(mockPatient);

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patientCode: 'P-9001',
          name: 'Anita Verma',
          age: 52,
          gender: 'FEMALE',
          phone: '+91 98765 43210',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.patientCode).toBe('P-9001');
      expect(response.body.data.name).toBe('Anita Verma');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app).post('/api/patients').send({
        patientCode: 'P-9001',
        name: 'Anita Verma',
        age: 52,
        gender: 'FEMALE',
        phone: '+91 98765 43210',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject duplicate patientCode', async () => {
      jest.spyOn(prisma.patient, 'findUnique').mockResolvedValueOnce({
        id: 'existing-id',
        patientCode: 'P-9001',
        name: 'Existing',
        age: 40,
        gender: Gender.FEMALE,
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patientCode: 'P-9001',
          name: 'Anita Verma',
          age: 52,
          gender: 'FEMALE',
          phone: '+91 98765 43210',
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('PATIENT_CODE_EXISTS');
    });
  });

  describe('GET /api/patients', () => {
    it('should return paginated patients list with search support', async () => {
      const mockPatients = [
        {
          id: 'p1',
          patientCode: 'P-1001',
          name: 'Anita Verma',
          age: 52,
          gender: Gender.FEMALE,
          phone: '9876543210',
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { screenings: 2 },
        },
      ];

      jest.spyOn(prisma.patient, 'count').mockResolvedValueOnce(1);
      jest.spyOn(prisma.patient, 'findMany').mockResolvedValueOnce(mockPatients as never);

      const response = await request(app)
        .get('/api/patients?search=Anita&page=1&limit=20')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe('GET /api/patients/:id', () => {
    it('should return patient details with screenings', async () => {
      const mockPatient = {
        id: 'p1',
        patientCode: 'P-1001',
        name: 'Anita Verma',
        age: 52,
        gender: Gender.FEMALE,
        phone: '9876543210',
        createdAt: new Date(),
        updatedAt: new Date(),
        screenings: [],
      };

      jest.spyOn(prisma.patient, 'findUnique').mockResolvedValueOnce(mockPatient);

      const response = await request(app)
        .get('/api/patients/p1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe('p1');
    });

    it('should return 404 for non-existent patient', async () => {
      jest.spyOn(prisma.patient, 'findUnique').mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/patients/non-existent')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('PATIENT_NOT_FOUND');
    });
  });
});
