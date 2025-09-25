import { Router } from 'express';
import { UserController } from './user.controller';

const router=Router();

router.post('/complete-profile', UserController.completeProfile);


export default router;
