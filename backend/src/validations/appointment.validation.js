import Joi from 'joi';

const uuid = Joi.string().guid({ version: ['uuidv4', 'uuidv5'] });

export const createAppointmentSchema = Joi.object({
  providerId: uuid.required(),
  serviceId: uuid.required(),
  startAt: Joi.date().iso().required(),
  notes: Joi.string().trim().max(1000).allow('').default(''),
});

export const idSchema = Joi.object({ id: uuid.required() });

export const rescheduleSchema = Joi.object({
  startAt: Joi.date().iso().required(),
});

export const cancelSchema = Joi.object({
  reason: Joi.string().trim().max(255).allow('').default(''),
});
