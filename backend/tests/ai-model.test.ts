import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/prisma/client';
import { MockModel } from '../src/services/model/mock-model';
import { ModelService } from '../src/services/model/model.service';
import { ScreeningStatus, DRSeverity, DMERisk, ReferralPriority } from '@prisma/client';
import { createTestToken } from './helpers';
import * as fileUtils from '../src/utils/file.utils';

describe('AI Model Architecture & Analysis API', () => {
  const token = createTestToken();

  describe('MockModel Unit Contract Tests', () => {
    it('should implement ModelAdapter and return normalized AI contract', async () => {
      const mockModel = new MockModel(0); // 0ms delay for unit tests
      const result = await mockModel.analyze('uploads/sample-scan.png');

      // 1. DR Analysis Contract
      expect(result.dr).toBeDefined();
      expect(typeof result.dr.grade).toBe('number');
      expect([0, 1, 2, 3, 4]).toContain(result.dr.grade);
      expect(Object.values(DRSeverity)).toContain(result.dr.severity);
      expect(result.dr.confidence).toBeGreaterThanOrEqual(0);
      expect(result.dr.confidence).toBeLessThanOrEqual(1);

      // 2. DME Analysis Contract
      expect(result.dme).toBeDefined();
      expect(Object.values(DMERisk)).toContain(result.dme.risk);
      expect(result.dme.confidence).toBeGreaterThanOrEqual(0);
      expect(result.dme.confidence).toBeLessThanOrEqual(1);

      // 3. Image Quality Contract
      expect(result.imageQuality).toBeDefined();
      expect(result.imageQuality.score).toBeGreaterThanOrEqual(0);
      expect(result.imageQuality.score).toBeLessThanOrEqual(1);

      // 4. Lesions Breakdown Contract
      expect(Array.isArray(result.lesions)).toBe(true);
      expect(result.lesions.length).toBeGreaterThan(0);
      for (const lesion of result.lesions) {
        expect(lesion.type).toBeDefined();
        expect(typeof lesion.count).toBe('number');
      }

      // 5. Uncertainty Contract
      expect(result.uncertainty).toBeDefined();
      expect(typeof result.uncertainty.abstain).toBe('boolean');

      // 6. Action Recommendation Contract
      expect(result.action).toBeDefined();
      expect(Object.values(ReferralPriority)).toContain(result.action.priority);
      expect(typeof result.action.recommendation).toBe('string');

      // 7. Visualizations Contract
      expect(result.visualizations).toBeDefined();
      expect('segmentationMaskPath' in result.visualizations).toBe(true);
      expect('gradcamPath' in result.visualizations).toBe(true);
    });

    it('should allow dynamic adapter swapping in ModelService', async () => {
      const customMockAdapter = {
        analyze: jest.fn().mockResolvedValue({
          dr: { grade: 0, severity: DRSeverity.NO_DR, confidence: 0.99 },
          dme: { risk: DMERisk.LOW, confidence: 0.99 },
          imageQuality: { status: 'ACCEPTED' as const, score: 0.99 },
          lesions: [],
          uncertainty: { level: 'LOW' as const, abstain: false },
          action: { priority: ReferralPriority.LOW, recommendation: 'Annual check' },
          visualizations: { segmentationMaskPath: null, gradcamPath: null },
        }),
      };

      const customService = new ModelService(customMockAdapter);
      const output = await customService.analyzeRetinalScan('test-path.png');

      expect(customMockAdapter.analyze).toHaveBeenCalledWith('test-path.png');
      expect(output.dr.severity).toBe(DRSeverity.NO_DR);
    });
  });

  describe('POST /api/screenings/:id/analyze', () => {
    it('should execute analysis pipeline and store AI result and lesions in database', async () => {
      const mockScreening = {
        id: 's-123',
        patientId: 'p-1',
        imagePath: 'uploads/scan1.png',
        status: ScreeningStatus.QUALITY_PASSED,
        qualityStatus: 'PASSED',
        qualityScore: 0.94,
        qualityReason: 'High quality scan',
        qualityCheckedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: { id: 'p-1', name: 'Anita Verma' },
      };

      jest.spyOn(prisma.screening, 'findUnique').mockResolvedValueOnce(mockScreening as never);
      jest.spyOn(fileUtils, 'fileExists').mockReturnValue(true);
      jest.spyOn(prisma.screening, 'update').mockResolvedValueOnce({
        ...mockScreening,
        status: ScreeningStatus.PROCESSING,
      } as never);

      const mockUpdatedScreening = {
        ...mockScreening,
        status: ScreeningStatus.REVIEW_PENDING,
        aiResult: {
          id: 'ai-1',
          screeningId: 's-123',
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
        specialistReview: null,
      };

      // Mock transaction execution
      jest.spyOn(prisma, '$transaction').mockImplementationOnce(async callback => {
        const mockTx = {
          aIResult: {
            upsert: jest.fn().mockResolvedValue(mockUpdatedScreening.aiResult),
          },
          lesion: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            createMany: jest.fn().mockResolvedValue({ count: 4 }),
          },
          screening: {
            update: jest.fn().mockResolvedValue(mockUpdatedScreening),
          },
        };
        return callback(mockTx as never);
      });

      const response = await request(app)
        .post('/api/screenings/s-123/analyze')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('REVIEW_PENDING');
      expect(response.body.data.aiResult.severity).toBe('MODERATE');
    });
  });
});
