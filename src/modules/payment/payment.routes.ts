import { Router } from 'express';
import { payForProduct } from './payment.controller';

const router = Router();

router.post('/pay', payForProduct);

export default router;
