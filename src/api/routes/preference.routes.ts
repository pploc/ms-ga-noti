import { Router } from 'express';
import { container } from '../../config/inversify.config';
import { TYPES } from '../../config/types';
import type { PreferenceController } from '../controllers/preference.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();
const preferenceController = container.get<PreferenceController>(TYPES.PreferenceController);

router.get('/me', requireAuth, asyncHandler(preferenceController.getMyPreferences));
router.put('/me', requireAuth, asyncHandler(preferenceController.updateMyPreferences));

export default router;
