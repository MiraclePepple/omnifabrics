import Joi from 'joi';

export const signupSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address'
  }),
  phone_number: Joi.string().min(11).max(11).required().messages({
    'string.empty': 'Phone number is required',
    'string.min': 'Phone number should have 11 characters',
    'string.max': 'Phone number should not exceed 11 characters'
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password should be at least 6 characters'
  }),
});


//Login Schema

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required'
  }),
});

// password recovery schema
export const passwordRecoverySchema = Joi.object({
  email: Joi.string().email().required(),
});

// password reset schema
export const passwordResetSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  new_password: Joi.string().min(6).required(),
});

