import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticate } from '../../middlewares/validate.middleware';

const router = Router();

router.post('/pay', authenticate, PaymentController.payForOrder); // client triggers payment
router.post('/webhook', PaymentController.webhook); // Squadco calls this

export default router;
