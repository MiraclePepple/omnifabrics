// src/modules/auth/auth.routes.ts
import express from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { signupSchema, loginSchema } from './auth.validation';
import { signupController, loginController } from './auth.controller';

const router = express.Router();

router.post('/signup', validate(signupSchema), signupController);
router.post('/login', validate(loginSchema), loginController);

export default router;
