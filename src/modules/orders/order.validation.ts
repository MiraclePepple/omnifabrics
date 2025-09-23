import Joi from 'joi';

export const createOrderSchema = Joi.object({
  cart_id: Joi.number().integer().optional(),
  shipping_address: Joi.object().required(),
  payment_method: Joi.string().required()
});
export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'shipped', 'delivered', 'cancelled').required()
});