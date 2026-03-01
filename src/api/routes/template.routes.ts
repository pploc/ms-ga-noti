import { Router } from 'express';
import { container } from '../../config/inversify.config';
import { TYPES } from '../../config/types';
import type { TemplateController } from '../controllers/template.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();
const templateController = container.get<TemplateController>(TYPES.TemplateController);

// Templates are usually managed by admins
router.get('/', requireAuth, requireRole('admin'), asyncHandler(templateController.listTemplates));
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  asyncHandler(templateController.createTemplate),
);
router.get('/:id', requireAuth, requireRole('admin'), asyncHandler(templateController.getTemplate));
router.put(
  '/:id',
  requireAuth,
  requireRole('admin'),
  asyncHandler(templateController.updateTemplate),
);
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  asyncHandler(templateController.deleteTemplate),
);

export default router;
