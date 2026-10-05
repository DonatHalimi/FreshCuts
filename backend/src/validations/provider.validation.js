import Joi from 'joi';

export const providerQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(24).default(12),
  serviceId: Joi.string().guid({ version: 'uuidv4' }).optional(),
  q: Joi.string().trim().max(80).allow('').default(''),
});

export const providerIdSchema = Joi.object({
  id: Joi.string().guid({ version: 'uuidv4' }).required(),
});