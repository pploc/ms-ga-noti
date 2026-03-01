import { Router, type Request, type Response } from 'express';
import { container } from '../../config/inversify.config';
import { TYPES } from '../../config/types';
import type { TemplateController } from '../controllers/template.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();
const getTmplController = (): TemplateController =>
  container.get<TemplateController>(TYPES.TemplateController);

// Templates are usually managed by admins
router.get(
  '/',
  requireAuth,
  asyncHandler((req, res) => getTmplController().listTemplates(req, res)),
);
router.post(
  '/',
  requireAuth,
  asyncHandler((req, res) => getTmplController().createTemplate(req, res)),
);
router.get(
  '/:id',
  requireAuth,
  asyncHandler((req, res) => getTmplController().getTemplate(req, res)),
);
router.put(
  '/:id',
  requireAuth,
  asyncHandler((req, res) => getTmplController().updateTemplate(req, res)),
);
router.delete(
  '/:id',
  requireAuth,
  asyncHandler((req: Request, res: Response) => getTmplController().deleteTemplate(req, res)),
);

export default router;
