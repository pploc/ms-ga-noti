import { Router } from 'express';
import notificationRoutes from './notification.routes';
import templateRoutes from './template.routes';
import preferenceRoutes from './preference.routes';

const router = Router();

router.use('/notifications', notificationRoutes);
router.use('/templates', templateRoutes);
router.use('/preferences', preferenceRoutes);

export default router;
