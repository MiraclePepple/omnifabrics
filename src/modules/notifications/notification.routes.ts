import { Router } from 'express';
import NotificationController from './notification.controller';
import { authenticate } from '../../middlewares/validate.middleware';

const router = Router();

router.get('/', authenticate, NotificationController.getMyNotifications);
router.put('/:id/read', authenticate, NotificationController.markAsRead);

export default router;
