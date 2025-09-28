import { Router } from 'express';
import * as ctrl from './admin.controller';
import { authenticate } from '../../middlewares/validate.middleware';

const router = Router();
router.post('/create-admin', authenticate, ctrl.createAdmin); // superadmin only
router.post('/assign-permission', authenticate, ctrl.assignPermission); // superadmin only

export default router;
