import { Router } from 'express';
import { resultController } from '../controllers/result.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

router.use(requireAuth);

router.get('/:id', asyncHandler(resultController.getResult));

export default router;
