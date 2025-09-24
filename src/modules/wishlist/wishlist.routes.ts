import { Router } from 'express';
import * as ctrl from './wishlist.controller';
import { validate } from '../../middlewares/validate.middleware';
import { addWishlistSchema } from './wishlist.validation';
import { auth } from '../auth/auth.middleware';

const router = Router();
router.post('/', auth, validate(addWishlistSchema), ctrl.add);
router.get('/', auth, ctrl.list);
router.delete('/:wishId', auth, ctrl.remove);

export default router;
