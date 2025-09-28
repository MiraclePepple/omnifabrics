import { Router } from 'express';
import * as ctrl from './wishlist.controller';
import { authenticate, validate } from '../../middlewares/validate.middleware';
import { addWishlistSchema } from './wishlist.validation';


const router = Router();
router.post('/', authenticate, validate(addWishlistSchema), ctrl.add);
router.get('/', authenticate, ctrl.list);
router.delete('/:wishId', authenticate, ctrl.remove);

export default router;
