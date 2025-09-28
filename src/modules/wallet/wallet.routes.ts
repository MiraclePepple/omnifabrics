import { Router } from 'express';
import * as ctrl from './wallet.controller';
import { authenticate } from '../../middlewares/validate.middleware';

const router = Router();
router.get('/:storeId', authenticate, ctrl.getWallet);
router.post('/transaction', authenticate, ctrl.createTx);

export default router;
