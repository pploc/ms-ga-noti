import { Router } from 'express';
import { container } from '../../config/inversify.config';
import { TYPES } from '../../config/types';
import type { NotificationController } from '../controllers/notification.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();
const notiController = container.get<NotificationController>(TYPES.NotificationController);

// Depending on architecture, internal microservices might post notifications without user auth
// but we'll secure it generally. Maybe internal service token pattern applies.
router.post('/', requireAuth, asyncHandler(notiController.sendNotification));

router.get('/', requireAuth, asyncHandler(notiController.listNotifications));
router.post('/:notificationId/read', requireAuth, asyncHandler(notiController.markAsRead));

export default router;
