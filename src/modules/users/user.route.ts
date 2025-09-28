import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate } from '../../middlewares/validate.middleware';

const router=Router();

router.post('/complete-profile', authenticate, UserController.completeProfile);


export default router;
