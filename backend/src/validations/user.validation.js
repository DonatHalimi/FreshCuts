import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(60).optional(),
  lastName: Joi.string().trim().min(1).max(60).optional(),
  phone: Joi.string().trim().max(30).allow('', null).optional(),
}).min(1);