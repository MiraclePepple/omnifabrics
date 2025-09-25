import { Router } from 'express';
import * as ctrl from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { signupSchema, loginSchema, sendOtpSchema, resetPasswordSchema } from './auth.validation';

const router = Router();
router.post('/signup', validate(signupSchema), ctrl.signup);
router.post('/login', validate(loginSchema), ctrl.login);
router.post('/password/forgot', validate(sendOtpSchema), ctrl.sendOtp),
router.post('/password/verify-otp', ctrl.verifyOtp),
router.post('/password/reset', validate(resetPasswordSchema), ctrl.resetPassword)

export default router;



