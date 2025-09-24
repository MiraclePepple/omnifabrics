import { Router } from 'express';
import * as ctrl from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { signupSchema, loginSchema } from './auth.validation';

const router = Router();
router.post('/signup', validate(signupSchema), ctrl.signup);
router.post('/login', validate(loginSchema), ctrl.login);
router.post('/send-otp', ctrl.sendOtp);

export default router;



