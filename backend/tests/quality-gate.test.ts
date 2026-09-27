import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/prisma/client';
import { ScreeningStatus, QualityStatus, Gender } from '@prisma/client';
import { createTestToken } from './helpers';
import * as fileUtils from '../src/utils/file.utils';

describe('Quality Gate & Quality-Enforced Screening Workflow', () => {
  const token = createTestToken();

  const mockPatient = {
    id: 'patient-test-01',
    patientCode: 'P-00126',
    name: 'Rahul Singh',
    age: 52,
    gender: Gender.MALE,
    phone: '+91 98765 43210',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/screenings/:id/quality-check', () => {
    it('should return 200 and PASS when quality score is >= 0.80 (e.g. 0.94)', async () => {
      const mockScreening = {
        id: 'scr-pass-01',
        patientId: mockPatient.id,
        imagePath: 'uploads/good_retinal_scan.png',
        status: ScreeningStatus.UPLOADED,
        qualityStatus: QualityStatus.PENDING,
        qualityScore: null,
        qualityReason: null,
        qualityCheckedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: mockPatient,
      };

      jest.spyOn(prisma.screening, 'findUnique').mockResolvedValueOnce(mockScreening as never);
      jest.spyOn(fileUtils, 'fileExists').mockReturnValue(true);
      jest.spyOn(prisma.screening, 'update').mockImplementation((args: any) => {
        return Promise.resolve({
          ...mockScreening,
          ...args.data,
        }) as any;
      });

      const response = await request(app)
        .post('/api/screenings/scr-pass-01/quality-check')
        .set('Authorization', `Bearer ${token}`)
        .send({ forceScore: 0.94 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('PASSED');
      expect(response.body.data.canProceed).toBe(true);
      expect(response.body.data.qualityScore).toBe(0.94);
      expect(response.body.data.qualityPercentage).toBe(94);
    });

    it('should PASS when quality score is EXACTLY 0.80 (threshold boundary)', async () => {
      const mockScreening = {
        id: 'scr-boundary-01',
        patientId: mockPatient.id,
        imagePath: 'uploads/borderline_scan.png',
        status: ScreeningStatus.UPLOADED,
        qualityStatus: QualityStatus.PENDING,
        qualityScore: null,
        qualityReason: null,
        qualityCheckedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: mockPatient,
      };

      jest.spyOn(prisma.screening, 'findUnique').mockResolvedValueOnce(mockScreening as never);
      jest.spyOn(fileUtils, 'fileExists').mockReturnValue(true);
      jest.spyOn(prisma.screening, 'update').mockImplementation((args: any) => {
        return Promise.resolve({
          ...mockScreening,
          ...args.data,
        }) as any;
      });

      const response = await request(app)
        .post('/api/screenings/scr-boundary-01/quality-check')
        .set('Authorization', `Bearer ${token}`)
        .send({ forceScore: 0.8 });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('PASSED');
      expect(response.body.data.canProceed).toBe(true);
      expect(response.body.data.qualityScore).toBe(0.8);
      expect(response.body.data.qualityPercentage).toBe(80);
    });

    it('should FAIL when quality score is 0.79 (below 80% threshold)', async () => {
      const mockScreening = {
        id: 'scr-fail-01',
        patientId: mockPatient.id,
        imagePath: 'uploads/low_quality_scan.png',
        status: ScreeningStatus.UPLOADED,
        qualityStatus: QualityStatus.PENDING,
        qualityScore: null,
        qualityReason: null,
        qualityCheckedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: mockPatient,
      };

      jest.spyOn(prisma.screening, 'findUnique').mockResolvedValueOnce(mockScreening as never);
      jest.spyOn(fileUtils, 'fileExists').mockReturnValue(true);
      jest.spyOn(prisma.screening, 'update').mockImplementation((args: any) => {
        return Promise.resolve({
          ...mockScreening,
          ...args.data,
        }) as any;
      });

      const response = await request(app)
        .post('/api/screenings/scr-fail-01/quality-check')
        .set('Authorization', `Bearer ${token}`)
        .send({ forceScore: 0.79 });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('FAILED');
      expect(response.body.data.canProceed).toBe(false);
      expect(response.body.data.qualityScore).toBe(0.79);
      expect(response.body.data.qualityPercentage).toBe(79);
    });
  });

  describe('HARD GATE: POST /api/screenings/:id/analyze', () => {
    it('should REJECT analyze request when quality check is PENDING or not run', async () => {
      const mockScreening = {
        id: 'scr-unverified',
        patientId: mockPatient.id,
        imagePath: 'uploads/scan.png',
        status: ScreeningStatus.UPLOADED,
        qualityStatus: QualityStatus.PENDING,
        qualityScore: null,
        qualityReason: null,
        qualityCheckedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: mockPatient,
      };

      jest.spyOn(prisma.screening, 'findUnique').mockResolvedValueOnce(mockScreening as never);

      const response = await request(app)
        .post('/api/screenings/scr-unverified/analyze')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('QUALITY_GATE_REQUIRED');
      expect(response.body.error.message).toContain('quality gate');
    });

    it('should REJECT analyze request when quality check has FAILED', async () => {
      const mockScreening = {
        id: 'scr-failed-quality',
        patientId: mockPatient.id,
        imagePath: 'uploads/bad_scan.png',
        status: ScreeningStatus.QUALITY_REJECTED,
        qualityStatus: QualityStatus.FAILED,
        qualityScore: 0.65,
        qualityReason: 'Image too blurry',
        qualityCheckedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: mockPatient,
      };

      jest.spyOn(prisma.screening, 'findUnique').mockResolvedValueOnce(mockScreening as never);

      const response = await request(app)
        .post('/api/screenings/scr-failed-quality/analyze')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('QUALITY_GATE_REQUIRED');
    });

    it('should ALLOW analyze request and execute model inference when qualityStatus is PASSED', async () => {
      const mockScreening = {
        id: 'scr-passed-quality',
        patientId: mockPatient.id,
        imagePath: 'uploads/good_scan.png',
        status: ScreeningStatus.QUALITY_PASSED,
        qualityStatus: QualityStatus.PASSED,
        qualityScore: 0.94,
        qualityReason: 'Passed',
        qualityCheckedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: mockPatient,
      };

      jest.spyOn(prisma.screening, 'findUnique').mockResolvedValueOnce(mockScreening as never);
      jest.spyOn(fileUtils, 'fileExists').mockReturnValue(true);
      jest.spyOn(prisma.screening, 'update').mockImplementation((args: any) => {
        return Promise.resolve({
          ...mockScreening,
          ...args.data,
        }) as any;
      });

      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        const txMock = {
          aIResult: {
            upsert: jest.fn().mockResolvedValue({ id: 'ai-res-1' }),
          },
          lesion: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            createMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
          screening: {
            update: jest.fn().mockResolvedValue({
              ...mockScreening,
              status: ScreeningStatus.REVIEW_PENDING,
              aiResult: { drGrade: 2, severity: 'MODERATE' },
            }),
          },
        };
        return callback(txMock);
      });

      const response = await request(app)
        .post('/api/screenings/scr-passed-quality/analyze')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('REVIEW_PENDING');
    });
  });

  describe('GET /api/screenings/:id/result', () => {
    it('should return quality details alongside screening and AI result', async () => {
      const mockScreeningWithResult = {
        id: 'scr-result-01',
        patientId: mockPatient.id,
        imagePath: 'uploads/scan.png',
        status: ScreeningStatus.REVIEW_PENDING,
        qualityStatus: QualityStatus.PASSED,
        qualityScore: 0.94,
        qualityReason: 'High sharpness and illumination',
        qualityCheckedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: mockPatient,
        aiResult: {
          id: 'ai-01',
          screeningId: 'scr-result-01',
          drGrade: 2,
          severity: 'MODERATE',
          drConfidence: 0.88,
          dmeRisk: 'LOW',
          dmeConfidence: 0.91,
          imageQualityStatus: 'ACCEPTED',
          imageQualityScore: 0.94,
          uncertaintyLevel: 'LOW',
          abstain: false,
          referralPriority: 'MEDIUM',
          referralRecommendation: 'Follow up in 6 months',
          segmentationMaskPath: null,
          gradcamPath: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        lesions: [],
        specialistReview: null,
      };

      jest.spyOn(prisma.screening, 'findUnique').mockResolvedValueOnce(mockScreeningWithResult as never);

      const response = await request(app)
        .get('/api/screenings/scr-result-01/result')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.quality).toBeDefined();
      expect(response.body.data.quality.status).toBe('PASSED');
      expect(response.body.data.quality.score).toBe(0.94);
      expect(response.body.data.quality.percentage).toBe(94);
    });
  });
});
