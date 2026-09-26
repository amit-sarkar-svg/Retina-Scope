import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { screeningController } from '../controllers/screening.controller';
import { resultController } from '../controllers/result.controller';
import { reviewController } from '../controllers/review.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { retinalScanUpload } from '../middleware/upload.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Protect all screening routes with JWT authentication
router.use(requireAuth);

router.post('/', retinalScanUpload.single('image'), asyncHandler(screeningController.create));
router.get('/', asyncHandler(screeningController.getAll));
router.get('/:id', asyncHandler(screeningController.getById));
router.post('/:id/analyze', asyncHandler(screeningController.analyze));
router.get('/:id/result', asyncHandler(resultController.getResult));
router.post(
  '/:id/review',
  requireRole(UserRole.SPECIALIST, UserRole.ADMIN),
  asyncHandler(reviewController.submitReview)
);

export default router;
