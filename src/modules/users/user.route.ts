import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate } from '../../middlewares/validate.middleware';

const router = Router();

// All routes require authentication
router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, UserController.updateProfile);
router.post('/change-password', authenticate, UserController.changePassword);
router.post('/reset-password', UserController.resetPassword); // optional: OTP route can be unprotected

export default router;
