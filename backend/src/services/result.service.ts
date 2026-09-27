import { prisma } from '../prisma/client';
import { AppError } from '../middleware/error.middleware';
import { HTTP_STATUS } from '../config/constants';

export class ResultService {
  public async getScreeningResult(screeningId: string) {
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

    // Format response structure tailored for the Screening Result UI view
    return {
      screening: {
        id: screening.id,
        patientId: screening.patientId,
        imagePath: screening.imagePath,
        status: screening.status,
        qualityStatus: screening.qualityStatus,
        qualityScore: screening.qualityScore,
        qualityReason: screening.qualityReason,
        qualityCheckedAt: screening.qualityCheckedAt,
        createdAt: screening.createdAt,
        updatedAt: screening.updatedAt,
      },
      patient: screening.patient,
      quality: {
        status: screening.qualityStatus,
        score: screening.qualityScore,
        percentage: screening.qualityScore !== null && screening.qualityScore !== undefined ? Math.round(screening.qualityScore * 100) : null,
        reason: screening.qualityReason,
        checkedAt: screening.qualityCheckedAt,
      },
      aiResult: screening.aiResult
        ? {
            id: screening.aiResult.id,
            dr: {
              grade: screening.aiResult.drGrade,
              severity: screening.aiResult.severity,
              confidence: screening.aiResult.drConfidence,
            },
            dme: {
              risk: screening.aiResult.dmeRisk,
              confidence: screening.aiResult.dmeConfidence,
            },
            imageQuality: {
              status: screening.aiResult.imageQualityStatus,
              score: screening.aiResult.imageQualityScore,
            },
            uncertainty: {
              level: screening.aiResult.uncertaintyLevel,
              abstain: screening.aiResult.abstain,
            },
            action: {
              priority: screening.aiResult.referralPriority,
              recommendation: screening.aiResult.referralRecommendation,
            },
            visualizations: {
              segmentationMaskPath: screening.aiResult.segmentationMaskPath,
              gradcamPath: screening.aiResult.gradcamPath,
            },
            createdAt: screening.aiResult.createdAt,
            updatedAt: screening.aiResult.updatedAt,
          }
        : null,
      lesions: screening.lesions.map(l => ({
        id: l.id,
        type: l.type,
        count: l.count,
        createdAt: l.createdAt,
      })),
      specialistReview: screening.specialistReview
        ? {
            id: screening.specialistReview.id,
            decision: screening.specialistReview.decision,
            notes: screening.specialistReview.notes,
            reviewer: screening.specialistReview.reviewer,
            createdAt: screening.specialistReview.createdAt,
            updatedAt: screening.specialistReview.updatedAt,
          }
        : null,
    };
  }
}

export const resultService = new ResultService();
