import { Router } from 'express';
import * as ctrl from './rating.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createRatingSchema } from './rating.validation';
import { auth } from '../auth/auth.middleware';

const router = Router();
router.post('/', auth, validate(createRatingSchema), ctrl.createRating);
router.get('/product/:productId', ctrl.listRatings);

export default router;
