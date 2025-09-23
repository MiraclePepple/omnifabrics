import Joi from 'joi';

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  phone_number: Joi.string().required(),
  password: Joi.string().min(8).required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
