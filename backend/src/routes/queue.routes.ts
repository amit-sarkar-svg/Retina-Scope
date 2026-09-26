import { Router } from 'express';
import { queueController } from '../controllers/queue.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(queueController.getQueue));

export default router;
