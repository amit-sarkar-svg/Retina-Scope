import { ScreeningStatus } from '@prisma/client';
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/error.middleware';
import { HTTP_STATUS } from '../config/constants';
import { CreateReviewSchemaInput } from '../schemas/review.schema';

export class ReviewService {
  public async submitReview(
    screeningId: string,
    reviewerId: string,
    input: CreateReviewSchemaInput
  ) {
    const screening = await prisma.screening.findUnique({
      where: { id: screeningId },
    });

    if (!screening) {
      throw new AppError(
        `Screening with ID '${screeningId}' not found.`,
        HTTP_STATUS.NOT_FOUND,
        'SCREENING_NOT_FOUND'
      );
    }

    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId },
    });

    if (!reviewer) {
      throw new AppError(
        `Reviewer with ID '${reviewerId}' not found.`,
        HTTP_STATUS.NOT_FOUND,
        'REVIEWER_NOT_FOUND'
      );
    }

    const review = await prisma.$transaction(async tx => {
      const savedReview = await tx.specialistReview.upsert({
        where: { screeningId },
        create: {
          screeningId,
          reviewerId,
          decision: input.decision,
          notes: input.notes?.trim() || null,
        },
        update: {
          reviewerId,
          decision: input.decision,
          notes: input.notes?.trim() || null,
        },
        include: {
          reviewer: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      await tx.screening.update({
        where: { id: screeningId },
        data: { status: ScreeningStatus.REVIEWED },
      });

      return savedReview;
    });

    return review;
  }
}

export const reviewService = new ReviewService();
