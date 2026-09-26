import { Request, Response } from 'express';
import { reviewService } from '../services/review.service';
import { createReviewSchema } from '../schemas/review.schema';
import { ApiResponse } from '../utils/api-response';
import { HTTP_STATUS } from '../config/constants';
import { AppError } from '../middleware/error.middleware';

export class ReviewController {
  public submitReview = async (req: Request, res: Response) => {
    const { id } = req.params;
    const reviewerId = req.user?.id;

    if (!reviewerId) {
      throw new AppError('Authentication required to submit a specialist review.', HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
    }

    const validatedData = createReviewSchema.parse(req.body);
    const review = await reviewService.submitReview(id, reviewerId, validatedData);

    return ApiResponse.success(res, review, 'Specialist review submitted successfully', HTTP_STATUS.OK);
  };
}

export const reviewController = new ReviewController();
