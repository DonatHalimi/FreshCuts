import Joi from 'joi';

export const rosterSchema = Joi.object({
  date: Joi.date().iso().required(),
});

export const statusSchema = Joi.object({
  status: Joi.string().valid('CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW').required(),
});
