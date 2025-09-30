import { Router } from 'express';
import productItemRoutes from '../modules/product_items/product_item.routes';
import cartRoutes from '../modules/cart/cart.routes';
import ratingRoutes from '../modules/ratings/rating.routes';
import wishlistRoutes from '../modules/wishlist/wishlist.routes';
import walletRoutes from '../modules/wallet/wallet.routes';
import transactionRoutes from '../modules/wallet/wallet.routes'; // transactions handled in wallet routes or separate file
import paymentRoutes from '../modules/payment/payment.routes';
import notificationRoutes from '../modules/notifications/notification.routes';
import adminRoutes from '../modules/admin/admin.routes';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/users/user.route';
import productRoutes from '../modules/products/product.route';
import storeRoutes from '../modules/store/store.routes';
import orderRoutes from '../modules/orders/order.route'
// import other module route files similarly

const router = Router();
router.use('/auth', authRoutes);
router.use('/product-items', productItemRoutes);
router.use('/cart', cartRoutes);
router.use('/ratings', ratingRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/wallets', walletRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admins', adminRoutes);
router.use('/user', userRoutes);
router.use('/product', productRoutes);
router.use('/store', storeRoutes)
router.use('/order', orderRoutes)



// add more: /products, /stores, /categories, /orders, /users/auth, etc.

export default router;
