import { Router } from 'express';
import * as ctrl from './admin.controller';
import { auth } from '../auth/auth.middleware';

const router = Router();
router.post('/', auth, ctrl.createAdmin); // superadmin only
router.post('/assign-permission', auth, ctrl.assignPermission);

export default router;
