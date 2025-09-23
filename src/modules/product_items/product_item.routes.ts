import { Router } from 'express';
import * as controller from './product_item.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createProductItemSchema } from './product_Item.validation';

const router = Router();

router.post('/', validate(createProductItemSchema), controller.create);
router.get('/', controller.list);

export default router;
