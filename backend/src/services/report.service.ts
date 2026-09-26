import { prisma } from '../prisma/client';
import { AppError } from '../middleware/error.middleware';
import { HTTP_STATUS } from '../config/constants';

export class ReportService {
  public async getReportData(screeningId: string) {
    const screening = await prisma.screening.findUnique({
      where: { id: screeningId },
      include: {
        patient: true,
        aiResult: true,
        lesions: true,
        specialistReview: {
          include: {
            reviewer: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    });

    if (!screening) {
      throw new AppError(
        `Screening with ID '${screeningId}' not found.`,
        HTTP_STATUS.NOT_FOUND,
        'SCREENING_NOT_FOUND'
      );
    }

    return {
      reportId: `REP-${screening.id.substring(0, 8).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      platform: 'RetinaScope Explainable AI Screening Platform',
      screening: {
        id: screening.id,
        status: screening.status,
        imagePath: screening.imagePath,
        createdAt: screening.createdAt,
      },
      patient: screening.patient,
      aiAnalysis: screening.aiResult
        ? {
            drGrade: screening.aiResult.drGrade,
            drSeverity: screening.aiResult.severity,
            drConfidence: screening.aiResult.drConfidence,
            dmeRisk: screening.aiResult.dmeRisk,
            dmeConfidence: screening.aiResult.dmeConfidence,
            imageQuality: {
              status: screening.aiResult.imageQualityStatus,
              score: screening.aiResult.imageQualityScore,
            },
            uncertainty: {
              level: screening.aiResult.uncertaintyLevel,
              abstain: screening.aiResult.abstain,
            },
            referralPriority: screening.aiResult.referralPriority,
            recommendation: screening.aiResult.referralRecommendation,
            visualizations: {
              segmentationMaskPath: screening.aiResult.segmentationMaskPath,
              gradcamPath: screening.aiResult.gradcamPath,
            },
          }
        : null,
      lesions: screening.lesions.map(l => ({
        type: l.type,
        count: l.count,
      })),
      specialistReview: screening.specialistReview
        ? {
            decision: screening.specialistReview.decision,
            notes: screening.specialistReview.notes,
            reviewer: screening.specialistReview.reviewer,
            reviewedAt: screening.specialistReview.createdAt,
          }
        : null,
    };
  }
}

export const reportService = new ReportService();
