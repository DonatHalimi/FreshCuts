import Joi from 'joi';

const range = Joi.object({ dayOfWeek: Joi.number().integer().min(1).max(7).required(), startMin: Joi.number().integer().min(0).max(1439).required(), endMin: Joi.number().integer().min(1).max(1440).required(), isActive: Joi.boolean().default(true) });
export const rangesSchema = Joi.object({ entries: Joi.array().items(range).max(100).required() });
export const timeOffSchema = Joi.object({ startAt: Joi.date().iso().required(), endAt: Joi.date().iso().required(), reason: Joi.string().trim().max(255).allow('') });
export const idSchema = Joi.object({ id: Joi.string().guid({ version: ['uuidv4', 'uuidv5'] }).required() });
