import { Router } from 'express';
import { container } from '../../config/inversify.config';
import { TYPES } from '../../config/types';
import type { PreferenceController } from '../controllers/preference.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();
const getPrefController = (): PreferenceController =>
  container.get<PreferenceController>(TYPES.PreferenceController);

router.get(
  '/me',
  requireAuth,
  asyncHandler((req, res) => getPrefController().getMyPreferences(req, res)),
);
router.put(
  '/me',
  requireAuth,
  asyncHandler((req, res) => getPrefController().updateMyPreferences(req, res)),
);

export default router;
