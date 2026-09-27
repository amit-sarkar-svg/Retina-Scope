import { ScreeningStatus, QualityStatus } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { AppError } from '../../middleware/error.middleware';
import { HTTP_STATUS } from '../../config/constants';
import { fileExists, getUploadAbsolutePath } from '../../utils/file.utils';
import { QualityGateAdapter, QualityGateOptions } from './quality.adapter';
import { MockQualityGate, QUALITY_ACCEPTANCE_THRESHOLD } from './mock-quality-gate';

export class QualityService {
  private adapter: QualityGateAdapter;

  constructor(adapter?: QualityGateAdapter) {
    this.adapter = adapter || new MockQualityGate();
  }

  public setAdapter(adapter: QualityGateAdapter): void {
    this.adapter = adapter;
  }

  public getThreshold(): number {
    return QUALITY_ACCEPTANCE_THRESHOLD;
  }

  public async checkScreeningQuality(
    screeningId: string,
    options?: QualityGateOptions
  ) {
    const screening = await prisma.screening.findUnique({
      where: { id: screeningId },
      include: { patient: true },
    });

    if (!screening) {
      throw new AppError(
        `Screening with ID '${screeningId}' not found.`,
        HTTP_STATUS.NOT_FOUND,
        'SCREENING_NOT_FOUND'
      );
    }

    const absoluteImagePath = getUploadAbsolutePath(screening.imagePath);
    if (!fileExists(absoluteImagePath)) {
      throw new AppError(
        `Uploaded retinal scan file not found on disk at '${screening.imagePath}'.`,
        HTTP_STATUS.BAD_REQUEST,
        'IMAGE_FILE_NOT_FOUND'
      );
    }

    // 1. Transition screening status to QUALITY_CHECKING
    await prisma.screening.update({
      where: { id: screeningId },
      data: { status: ScreeningStatus.QUALITY_CHECKING },
    });

    try {
      // 2. Execute assessment via decoupled QualityGateAdapter
      const assessment = await this.adapter.assess(screening.imagePath, options);

      const isPassed = assessment.score >= QUALITY_ACCEPTANCE_THRESHOLD;
      const dbQualityStatus: QualityStatus = isPassed
        ? QualityStatus.PASSED
        : QualityStatus.FAILED;
      const dbScreeningStatus: ScreeningStatus = isPassed
        ? ScreeningStatus.QUALITY_PASSED
        : ScreeningStatus.QUALITY_REJECTED;

      const checkedAt = new Date();

      // 3. Persist quality results in database
      const updatedScreening = await prisma.screening.update({
        where: { id: screeningId },
        data: {
          qualityStatus: dbQualityStatus,
          qualityScore: assessment.score,
          qualityReason: assessment.reason,
          qualityCheckedAt: checkedAt,
          status: dbScreeningStatus,
        },
        include: {
          patient: true,
          aiResult: true,
        },
      });

      return {
        screeningId: updatedScreening.id,
        qualityScore: assessment.score,
        qualityPercentage: assessment.percentage,
        status: assessment.status,
        canProceed: isPassed,
        reason: assessment.reason,
        checkedAt: checkedAt.toISOString(),
        screeningStatus: updatedScreening.status,
        patient: updatedScreening.patient,
        metadata: assessment.metadata,
      };
    } catch (error) {
      // On unexpected failure, mark screening status as FAILED
      await prisma.screening.update({
        where: { id: screeningId },
        data: {
          status: ScreeningStatus.FAILED,
          qualityStatus: QualityStatus.FAILED,
        },
      });
      throw error;
    }
  }
}

export const qualityService = new QualityService();
