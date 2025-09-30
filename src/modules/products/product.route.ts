import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticate } from '../../middlewares/validate.middleware';

const router = Router();

// Seller-only actions
router.post('/create-product', authenticate, ProductController.createProduct);
router.put('/update-product/:id', authenticate, ProductController.updateProduct);
router.patch('/disable-product/:id', authenticate, ProductController.disableProduct);
router.delete('/delete-product/:id', authenticate, ProductController.deleteProduct);
router.get('/my-products', authenticate, ProductController.listSellerProducts);

// Buyer actions
router.get('/search', ProductController.searchProducts);

export default router;
