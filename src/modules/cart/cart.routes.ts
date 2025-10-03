import { Router } from 'express';
import { CartController } from './cart.controller';
import { authenticate } from '../../middlewares/validate.middleware';
import { PaymentController } from '../payment/payment.controller';

const router = Router();

router.post('/add-to-cart', authenticate, CartController.addItem);
router.get('/get-cart', authenticate, CartController.listCartItems);
router.delete('/remove/:cartItemId', authenticate, CartController.removeItem);
router.post('/checkout', authenticate, PaymentController.payForOrder);
router.put('/:id', authenticate, CartController.updateItem);

export default router;
