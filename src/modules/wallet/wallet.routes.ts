import { Router } from 'express';
import * as ctrl from './wallet.controller';
import { auth } from '../auth/auth.middleware';

const router = Router();
router.get('/:storeId', auth, ctrl.getWallet);
router.post('/transaction', auth, ctrl.createTx);

export default router;
