import Joi from 'joi';

const password = Joi.string().min(8).max(72).required();

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().max(254).required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().min(20).max(512).required(),
  password,
});
