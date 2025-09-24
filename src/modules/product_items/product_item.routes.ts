import { Router } from 'express';
import * as ctrl from './product_item.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createProductItemSchema, updateProductItemSchema } from './product_item.validation';
import { auth } from '../auth/auth.middleware';

const router = Router();

router.post('/', auth, validate(createProductItemSchema), ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.put('/:id', auth, validate(updateProductItemSchema), ctrl.update);
router.delete('/:id', auth, ctrl.remove);

export default router;
