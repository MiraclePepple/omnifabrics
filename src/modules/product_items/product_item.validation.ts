import Joi from 'joi';

export const createProductItemSchema = Joi.object({
  color: Joi.string().required(),
  quantity: Joi.number().integer().required(),
  is_available: Joi.boolean().required(),
  price: Joi.number().precision(2).required()
});

export const updateProductItemSchema = Joi.object({
  color: Joi.string().optional(),
  quantity: Joi.number().integer().optional(),
  is_available: Joi.boolean().optional(),
  price: Joi.number().precision(2).optional()
});
