import { Router } from 'express';
import * as ctrl from './notification.controller';
import { authenticate } from '../../middlewares/validate.middleware';

const router = Router();
router.post('/', authenticate, ctrl.createNote); // admin broadcast
router.get('/', authenticate, ctrl.listForUser);
router.post('/:id/read', authenticate, ctrl.markRead);

export default router;
