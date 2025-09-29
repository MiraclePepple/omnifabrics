import { Router } from 'express';
import { StoreController } from './store.controller';
import { authenticate } from '../../middlewares/validate.middleware';

const router = Router();

router.post('/request-otp', StoreController.requestStoreOTP); // unprotected
router.post('/verify-otp', authenticate, StoreController.verifyStoreOTP); // user must be logged in
router.post('/create', authenticate, StoreController.createStore);
router.post('/switch-mode', authenticate, StoreController.switchMode);
//router.post('/login', StoreController.sellerLogin); // seller login


export default router;
