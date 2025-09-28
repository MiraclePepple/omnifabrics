import { Router } from 'express';
import * as ctrl from './rating.controller';
import { authenticate, validate } from '../../middlewares/validate.middleware';
import { createRatingSchema } from './rating.validation';


const router = Router();
router.post('/', authenticate, validate(createRatingSchema), ctrl.createRating);
router.get('/product/:productId', ctrl.listRatings);

export default router;
