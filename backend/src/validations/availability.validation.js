import Joi from 'joi';

export const availabilityQuerySchema = Joi.object({
  providerId: Joi.string().guid({ version: ['uuidv4', 'uuidv5'] }).required(),
  serviceId: Joi.string().guid({ version: ['uuidv4', 'uuidv5'] }).required(),
  date: Joi.date().iso().required(),
});
