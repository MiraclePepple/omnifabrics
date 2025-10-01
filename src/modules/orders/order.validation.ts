import Joi from "joi";

export const createOrderSchema = Joi.object({
  products: Joi.array().items(
    Joi.object({
      product_id: Joi.number().required(),
      product_item_id: Joi.number().optional(),
      quantity: Joi.number().required(),
    })
  ).required(),
  delivery_info: Joi.object().required(),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid("pending", "shipped", "delivered", "cancelled").required(),
});
