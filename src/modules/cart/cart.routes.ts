import { Router } from 'express';
import { CartController } from './cart.controller';
import { authenticate } from '../../middlewares/validate.middleware';

const router = Router();

router.post('/add-to-cart', authenticate, CartController.addToCart);
router.get('/get-cart', authenticate, CartController.getCart);
router.delete('/remove/:cartItemId', authenticate, CartController.removeItem);
router.post('/checkout', authenticate, CartController.checkout);

export default router;
