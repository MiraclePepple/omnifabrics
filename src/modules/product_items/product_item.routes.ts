import { Router } from 'express';
import * as ctrl from './product_item.controller';
import { validate, authenticate } from '../../middlewares/validate.middleware';
import { createProductItemSchema, updateProductItemSchema } from './product_item.validation';

const router = Router();

router.post('/', authenticate, validate(createProductItemSchema), ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.put('/:id', authenticate, validate(updateProductItemSchema), ctrl.update);
router.delete('/:id', authenticate, ctrl.remove);

export default router;
