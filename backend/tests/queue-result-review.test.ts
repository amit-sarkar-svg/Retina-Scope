import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/prisma/client';
import {
  ScreeningStatus,
  DRSeverity,
  DMERisk,
  ReferralPriority,
  ReviewDecision,
  UserRole,
  Gender,
} from '@prisma/client';
import { createTestToken } from './helpers';

describe('Result, Queue, Review & Report Endpoints', () => {
  const specialistToken = createTestToken({ role: UserRole.SPECIALIST });
  const operatorToken = createTestToken({ role: UserRole.SCREENING_OPERATOR });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/screenings/:id/result & GET /api/results/:id', () => {
    it('should return normalized screening result structured for UI', async () => {
      const mockScreeningData = {
        id: 's-101',
        patientId: 'p-101',
        imagePath: 'uploads/scan101.png',
        status: ScreeningStatus.REVIEW_PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: {
          id: 'p-101',
          patientCode: 'P-1001',
          name: 'Anita Verma',
          age: 52,
          gender: Gender.FEMALE,
          phone: '1234567890',
        },
        aiResult: {
          id: 'ai-101',
          drGrade: 2,
          severity: DRSeverity.MODERATE,
          drConfidence: 0.91,
          dmeRisk: DMERisk.HIGH,
          dmeConfidence: 0.87,
          imageQualityStatus: 'ACCEPTED',
          imageQualityScore: 0.94,
          uncertaintyLevel: 'LOW',
          abstain: false,
          referralPriority: ReferralPriority.HIGH,
          referralRecommendation: 'Specialist referral recommended',
          segmentationMaskPath: null,
          gradcamPath: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        lesions: [
          { id: 'l1', type: 'MICROANEURYSM', count: 12, createdAt: new Date() },
          { id: 'l2', type: 'EXUDATE', count: 7, createdAt: new Date() },
        ],
        specialistReview: null,
      };

      jest.spyOn(prisma.screening, 'findUnique').mockResolvedValueOnce(mockScreeningData as never);

      const response = await request(app)
        .get('/api/screenings/s-101/result')
        .set('Authorization', `Bearer ${specialistToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.screening.id).toBe('s-101');
      expect(response.body.data.aiResult.dr.severity).toBe('MODERATE');
      expect(response.body.data.lesions).toHaveLength(2);
    });
  });

  describe('GET /api/queue', () => {
    it('should return filtered and paginated queue items for specialist', async () => {
      jest.spyOn(prisma.screening, 'count').mockResolvedValueOnce(1);
      jest.spyOn(prisma.screening, 'findMany').mockResolvedValueOnce([
        {
          id: 's-101',
          patientId: 'p-101',
          imagePath: 'uploads/scan101.png',
          status: ScreeningStatus.REVIEW_PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
          patient: {
            id: 'p-101',
            patientCode: 'P-1001',
            name: 'Anita Verma',
            age: 52,
            gender: Gender.FEMALE,
            phone: '1234567890',
          },
          aiResult: {
            severity: DRSeverity.MODERATE,
            drGrade: 2,
            drConfidence: 0.91,
            referralPriority: ReferralPriority.HIGH,
            dmeRisk: DMERisk.HIGH,
          },
          specialistReview: null,
        },
      ] as never);

      const response = await request(app)
        .get('/api/queue?priority=HIGH&page=1&limit=20')
        .set('Authorization', `Bearer ${specialistToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].priority).toBe('HIGH');
    });
  });

  describe('POST /api/screenings/:id/review & POST /api/reviews/:id', () => {
    it('should allow specialist to submit review decision and update status to REVIEWED', async () => {
      const mockScreening = {
        id: 's-101',
        patientId: 'p-101',
        imagePath: 'uploads/scan101.png',
        status: ScreeningStatus.REVIEW_PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockReviewer = {
        id: 'test-user-id-123',
        name: 'Dr. Priya Sharma',
        email: 'specialist@retinascope.health',
        role: UserRole.SPECIALIST,
      };

      jest.spyOn(prisma.screening, 'findUnique').mockResolvedValueOnce(mockScreening as never);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(mockReviewer as never);

      jest.spyOn(prisma, '$transaction').mockImplementationOnce(async callback => {
        const mockTx = {
          specialistReview: {
            upsert: jest.fn().mockResolvedValue({
              id: 'rev-1',
              screeningId: 's-101',
              reviewerId: 'test-user-id-123',
              decision: ReviewDecision.AGREE,
              notes: 'Agreed with AI assessment',
              reviewer: mockReviewer,
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
          },
          screening: {
            update: jest.fn().mockResolvedValue({
              ...mockScreening,
              status: ScreeningStatus.REVIEWED,
            }),
          },
        };
        return callback(mockTx as never);
      });

      const response = await request(app)
        .post('/api/screenings/s-101/review')
        .set('Authorization', `Bearer ${specialistToken}`)
        .send({
          decision: 'AGREE',
          notes: 'Agreed with AI assessment',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.decision).toBe('AGREE');
    });

    it('should reject review submission if user is not a specialist or admin', async () => {
      const response = await request(app)
        .post('/api/screenings/s-101/review')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          decision: 'AGREE',
        });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('GET /api/reports/:screeningId', () => {
    it('should compile comprehensive report dataset', async () => {
      const mockScreening = {
        id: 's-101',
        patientId: 'p-101',
        imagePath: 'uploads/scan101.png',
        status: ScreeningStatus.REVIEWED,
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: {
          id: 'p-101',
          patientCode: 'P-1001',
          name: 'Anita Verma',
          age: 52,
          gender: Gender.FEMALE,
          phone: '1234567890',
        },
        aiResult: {
          drGrade: 2,
          severity: DRSeverity.MODERATE,
          drConfidence: 0.91,
          dmeRisk: DMERisk.HIGH,
          dmeConfidence: 0.87,
          imageQualityStatus: 'ACCEPTED',
          imageQualityScore: 0.94,
          uncertaintyLevel: 'LOW',
          abstain: false,
          referralPriority: ReferralPriority.HIGH,
          referralRecommendation: 'Referral recommended',
          segmentationMaskPath: null,
          gradcamPath: null,
        },
        lesions: [{ id: 'l1', type: 'MICROANEURYSM', count: 12 }],
        specialistReview: {
          decision: ReviewDecision.AGREE,
          notes: 'Confirmed',
          reviewer: { id: 'u1', name: 'Dr. Priya', email: 'dr@retina.io', role: UserRole.SPECIALIST },
          createdAt: new Date(),
        },
      };

      jest.spyOn(prisma.screening, 'findUnique').mockResolvedValueOnce(mockScreening as never);

      const response = await request(app)
        .get('/api/reports/s-101')
        .set('Authorization', `Bearer ${specialistToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reportId).toBe('REP-S-101');
      expect(response.body.data.patient.name).toBe('Anita Verma');
      expect(response.body.data.aiAnalysis.drSeverity).toBe('MODERATE');
    });
  });
});
