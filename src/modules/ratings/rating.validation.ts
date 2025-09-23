import Joi from 'joi';

export const createRatingSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow('', null)
});
