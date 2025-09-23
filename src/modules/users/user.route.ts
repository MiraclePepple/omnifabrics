import express from 'express';
import { signUpAuth, auth } from '../../middlewares/userAuth';
import { allUsers, completeProfile, forgotPassword, getProfile, login, resetPassword, signUp, updateAddress, verifyOTP} from './user.controller';
import { payForCart } from '../../controllers/paymentController';
import { addToWishlist, moveToCart, removeFromWishlist, viewWishlist } from '../../controllers/wishlistController';
import { addToCart, removeFromCart, viewCart } from '../../controllers/cartController';
import { getOrderHistory, rebuyProduct } from '../orders/order.controller';


const router = express.Router();

router.get('/allUsers', allUsers);

router.post('/auth/signUp', signUpAuth, signUp);

router.post('/user/completeProfile', auth, completeProfile);

router.post('/auth/login', login);

router.put('/user/updateAddress', auth, updateAddress);

router.get('/user/profile', auth, getProfile);

router.post('/auth/forgotPassword', forgotPassword);

router.post('/auth/verifyOTP', verifyOTP);

router.post('/auth/resetPassword', resetPassword);

router.post('/user/pay', auth, payForCart)

router.post('/user/addToWishlist', auth, addToWishlist);

router.delete('/user/removeFromWishlist/:wish_id', auth, removeFromWishlist);

router.get('/user/viewWishlist/:user_id', auth, viewWishlist);

router.post('/user/moveToCart', auth, moveToCart);

router.delete('/user/removeFromCart/:cart_item_id', auth, removeFromCart);

router.get('/user/viewCart/:user_id', auth, viewCart);

router.post('/user/addToCart', auth, addToCart);

router.get('/user/getOrderHistory/:user_id', auth, getOrderHistory);

router.post('/user/rebuyProduct', auth, rebuyProduct);













export default router;
