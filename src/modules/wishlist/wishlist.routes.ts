import { Router } from 'express';
import { WishlistController } from './wishlist.controller';
import { authenticate } from '../../middlewares/validate.middleware';

const router = Router();

router.post('/add-to-wishlist', authenticate, WishlistController.add);
router.get('/my-wishlist', authenticate, WishlistController.list);
router.delete('/remove/:wishId', authenticate, WishlistController.remove);
router.post('/:wishId/move-to-cart', authenticate, WishlistController.moveToCart);

export default router;
