import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticate } from '../../middlewares/validate.middleware';

const router = Router();

router.post('/pay', authenticate, PaymentController.payForOrder);
router.post('/webhook', PaymentController.webhook); // flutterwave calls this (no auth)
router.get('/verify', PaymentController.verifyRedirect); // optional redirect verify

export default router;
