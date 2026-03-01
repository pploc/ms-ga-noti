import { Router } from 'express';
import { container } from '../../config/inversify.config';
import { TYPES } from '../../config/types';
import type { NotificationController } from '../controllers/notification.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();
const getNotiController = () => container.get<NotificationController>(TYPES.NotificationController);

// Depending on architecture, internal microservices might post notifications without user auth
// but we'll secure it generally. Maybe internal service token pattern applies.
router.post('/', requireAuth, asyncHandler((req, res) => getNotiController().sendNotification(req, res)));

router.get('/', requireAuth, asyncHandler((req, res) => getNotiController().listNotifications(req, res)));
router.post(
    '/:notificationId/read',
    requireAuth,
    asyncHandler((req, res) => getNotiController().markAsRead(req, res)),
);

export default router;
