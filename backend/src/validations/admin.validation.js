import Joi from 'joi';

export const updateUserSchema = Joi.object({
    firstName: Joi.string().trim().min(1).max(60),
    lastName: Joi.string().trim().min(1).max(60),
    phone: Joi.string().trim().max(30).allow(''),
    role: Joi.string().valid('CLIENT', 'PROVIDER', 'ADMIN'),
    isActive: Joi.boolean(),
}).min(1);

export const updateServiceSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    description: Joi.string().trim().max(2000).allow(''),
    durationMin: Joi.number().integer().min(5).max(480),
    priceCents: Joi.number().integer().min(0).max(100000),
    bufferBeforeMin: Joi.number().integer().min(0).max(120),
    bufferAfterMin: Joi.number().integer().min(0).max(120),
    isActive: Joi.boolean(),
}).min(1);
