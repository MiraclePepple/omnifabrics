import { Router } from 'express';
import * as ctrl from './cart.controller';
import { validate } from '../../middlewares/validate.middleware';
import { addToCartSchema } from './cart.validation';
import { auth } from '../auth/auth.middleware';

const router = Router();
router.post('/add', auth, validate(addToCartSchema), ctrl.addToCart);
router.get('/', auth, ctrl.getCart);
router.delete('/item/:cartItemId', auth, ctrl.removeItem);

export default router;
