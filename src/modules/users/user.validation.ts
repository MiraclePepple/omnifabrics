import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  gender: Joi.string().valid('male', 'female').required(),
});

export const completeProfileSchema = Joi.object({
  first_name: Joi.string().required().messages({
      'string.empty': 'First name is required'}),

  last_name: Joi.string().required().messages({
      'string.empty': 'Last name is required',
    }),

  gender: Joi.string().valid('male', 'female', 'other').required().messages({
      'any.only': 'Gender must be male, female, or other',
      'string.empty': 'Gender is required'
    }),

  // optional for now but can be required later
  state: Joi.string().allow('', null).optional(),
  city: Joi.string().allow('', null).optional(),
  country: Joi.string().allow('', null).optional(),
  address: Joi.string().allow('', null).optional()
});
