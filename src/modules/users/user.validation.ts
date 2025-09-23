import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  gender: Joi.string().valid('male', 'female').required(),
});
