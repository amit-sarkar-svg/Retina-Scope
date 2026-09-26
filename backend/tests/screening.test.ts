import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/prisma/client';
import { ScreeningStatus, Gender } from '@prisma/client';
import { createTestToken } from './helpers';

describe('Screening API (/api/screenings)', () => {
  const token = createTestToken();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/screenings (Image Upload)', () => {
    it('should create a screening with valid image file', async () => {
      const mockPatient = {
        id: 'patient-123',
        patientCode: 'P-1001',
        name: 'Anita Verma',
        age: 52,
        gender: Gender.FEMALE,
        phone: '9876543210',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockScreening = {
        id: 'screening-123',
        patientId: 'patient-123',
        imagePath: 'uploads/retinal-scan-123.png',
        status: ScreeningStatus.UPLOADED,
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: mockPatient,
      };

      jest.spyOn(prisma.patient, 'findUnique').mockResolvedValueOnce(mockPatient);
      jest.spyOn(prisma.screening, 'create').mockResolvedValueOnce(mockScreening);

      // Create a small 1x1 png buffer for multipart upload
      const dummyPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const response = await request(app)
        .post('/api/screenings')
        .set('Authorization', `Bearer ${token}`)
        .field('patientId', 'patient-123')
        .attach('image', dummyPng, 'scan.png');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('screening-123');
      expect(response.body.data.status).toBe('UPLOADED');
    });

    it('should reject screening creation without image file', async () => {
      const response = await request(app)
        .post('/api/screenings')
        .set('Authorization', `Bearer ${token}`)
        .field('patientId', 'patient-123');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('NO_FILE_UPLOADED');
    });

    it('should reject invalid image file types (e.g. .txt)', async () => {
      const textBuffer = Buffer.from('hello world text file');

      const response = await request(app)
        .post('/api/screenings')
        .set('Authorization', `Bearer ${token}`)
        .field('patientId', 'patient-123')
        .attach('image', textBuffer, 'report.txt');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_FILE_TYPE');
    });
  });

  describe('GET /api/screenings', () => {
    it('should return list of screenings with pagination and status filtering', async () => {
      jest.spyOn(prisma.screening, 'count').mockResolvedValueOnce(1);
      jest.spyOn(prisma.screening, 'findMany').mockResolvedValueOnce([
        {
          id: 's1',
          patientId: 'p1',
          imagePath: 'uploads/scan1.png',
          status: ScreeningStatus.REVIEW_PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
          patient: {
            id: 'p1',
            patientCode: 'P-1001',
            name: 'Anita Verma',
            age: 52,
            gender: Gender.FEMALE,
            phone: '123',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          aiResult: null,
          specialistReview: null,
        },
      ] as never);

      const response = await request(app)
        .get('/api/screenings?status=REVIEW_PENDING&page=1&limit=20')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.total).toBe(1);
    });
  });
});
