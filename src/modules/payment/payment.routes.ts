import { Router } from 'express';
import * as ctrl from './payment.controller';
import { auth } from '../auth/auth.middleware';

const router = Router();
router.post('/initiate', auth, ctrl.initiate);
router.post('/confirm', ctrl.confirm); // webhook or client callback

export default router;
