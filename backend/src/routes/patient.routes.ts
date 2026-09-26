import { Router } from 'express';
import { patientController } from '../controllers/patient.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// Protect all patient routes with JWT authentication
router.use(requireAuth);

router.post('/', asyncHandler(patientController.create));
router.get('/', asyncHandler(patientController.getAll));
router.get('/:id', asyncHandler(patientController.getById));
router.patch('/:id', asyncHandler(patientController.update));

export default router;
