import Joi from 'joi';

export const signupSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address'
  }),
  phone_number: Joi.string().min(11).max(11).required().messages({
    'string.empty': 'Phone number is required',
    'string.min': 'Phone number should have at least 11 characters',
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

//Reset Password Schema after OTP verification
export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address'
  }),
  new_password: Joi.string().min(8).required().messages({
    'string.empty': 'New password is required',
    'string.min': 'New password should be at least 8 characters'
  }),
});

export const changePasswordSchema = Joi.object({
  old_password: Joi.string().required().messages({
    'string.empty': 'Old password is required'
  }),
  new_password: Joi.string().min(8).required().messages({
    'string.empty': 'New password is required',
    'string.min': 'New password should be at least 8 characters'
  }),
});

//Send OTP Schema (optional)

export const sendOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address'
  }),
});
