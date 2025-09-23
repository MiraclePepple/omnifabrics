import { Router } from 'express';
import * as controller from './cart.controller';
import { validate } from '../../middlewares/validate.middleware';
import { addToCartSchema } from './cart.validation';
import { auth } from '../auth/auth.middleware';

const router = Router();

router.post('/add', auth, validate(addToCartSchema), controller.addToCart);
router.get('/', auth, controller.getCart);

export default router;
