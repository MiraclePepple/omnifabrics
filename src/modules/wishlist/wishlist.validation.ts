import Joi from 'joi';

export const addWishlistSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  product_item_id: Joi.number().integer().optional()
});
export const removeWishlistSchema = Joi.object({
  wish_id: Joi.number().integer().required()
});