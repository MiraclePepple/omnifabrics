import Joi from 'joi';

export const addToCartSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  product_item_id: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required()
});
