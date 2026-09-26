import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { reviewController } from '../controllers/review.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

router.use(requireAuth);

router.post(
  '/:id',
  requireRole(UserRole.SPECIALIST, UserRole.ADMIN),
  asyncHandler(reviewController.submitReview)
);

export default router;
