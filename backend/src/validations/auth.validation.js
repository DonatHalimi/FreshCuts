import Joi from 'joi';

export const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(60).required(),
  lastName: Joi.string().trim().min(1).max(60).required(),
  email: Joi.string().trim().lowercase().email().max(254).required(),
  password: Joi.string().min(8).max(72).required(),
  phone: Joi.string().trim().max(30).allow('', null).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(254).required(),
  password: Joi.string().min(1).max(72).required(),
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().trim().min(20).max(200).required(),
});

export const resendVerificationSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(254).required(),
});