import { Router } from 'express';
import * as ctrl from './notification.controller';
import { auth } from '../auth/auth.middleware';

const router = Router();
router.post('/', auth, ctrl.createNote); // admin broadcast
router.get('/', auth, ctrl.listForUser);
router.post('/:id/read', auth, ctrl.markRead);

export default router;
