import { Router } from 'express';
import * as ctrl from './cart.controller';
import { authenticate, validate } from '../../middlewares/validate.middleware';
import { addToCartSchema } from './cart.validation';


const router = Router();
router.post('/add', authenticate, validate(addToCartSchema), ctrl.addToCart);
router.get('/', authenticate, ctrl.getCart);
router.delete('/item/:cartItemId', authenticate, ctrl.removeItem);

export default router;
