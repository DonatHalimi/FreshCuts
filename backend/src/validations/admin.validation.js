import Joi from 'joi';

export const updateUserSchema = Joi.object({
    firstName: Joi.string().trim().min(1).max(60),
    lastName: Joi.string().trim().min(1).max(60),
    email: Joi.string().trim().lowercase().email().max(254),
    phone: Joi.string().trim().max(30).allow(''),
    role: Joi.string().valid('CLIENT', 'PROVIDER', 'ADMIN'),
    isActive: Joi.boolean(),
}).min(1);

export const createUserSchema = Joi.object({
    firstName: Joi.string().trim().min(1).max(60).required(),
    lastName: Joi.string().trim().min(1).max(60).required(),
    email: Joi.string().trim().lowercase().email().max(254).required(),
    phone: Joi.string().trim().max(30).allow('', null).optional(),
    password: Joi.string().min(8).max(72).required(),
    role: Joi.string().valid('CLIENT', 'ADMIN').default('CLIENT'),
});

export const bulkDeleteSchema = Joi.object({
    ids: Joi.array().items(Joi.string().guid({ version: ['uuidv4', 'uuidv5'] })).min(1).max(100).unique().required(),
});

export const updateServiceSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    description: Joi.string().trim().max(2000).allow(''),
    durationMin: Joi.number().integer().min(5).max(480),
    priceCents: Joi.number().integer().min(0).max(100000),
    bufferBeforeMin: Joi.number().integer().min(0).max(120),
    bufferAfterMin: Joi.number().integer().min(0).max(120),
    isActive: Joi.boolean(),
}).min(1);

export const createServiceSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().trim().max(2000).allow('').default(''),
    durationMin: Joi.number().integer().min(5).max(480).required(),
    priceCents: Joi.number().integer().min(0).max(100000).required(),
    bufferBeforeMin: Joi.number().integer().min(0).max(120).default(0),
    bufferAfterMin: Joi.number().integer().min(0).max(120).default(0),
});

export const adminAppointmentsQuerySchema = Joi.object({
    q: Joi.string().trim().max(80).allow('').default(''),
    status: Joi.string().valid('CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW').optional(),
});

export const updateAppointmentStatusSchema = Joi.object({
    status: Joi.string().valid('CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW').required(),
});

export const updateProviderSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    title: Joi.string().trim().max(100).allow(''),
    bio: Joi.string().trim().max(2000).allow(''),
    isActive: Joi.boolean(),
}).min(1);

export const createProviderSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    title: Joi.string().trim().max(100).allow('').default(''),
    bio: Joi.string().trim().max(2000).allow('').default(''),
    serviceIds: Joi.array().items(Joi.string().guid({ version: ['uuidv4', 'uuidv5'] })).min(1).unique().required(),
    workingDays: Joi.array().items(Joi.number().integer().min(1).max(6)).min(1).unique().required(),
    startMin: Joi.number().integer().min(0).max(1439).required(),
    endMin: Joi.number().integer().min(1).max(1440).greater(Joi.ref('startMin')).required(),
});
