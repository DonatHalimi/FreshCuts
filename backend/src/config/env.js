import 'dotenv/config';
import Joi from 'joi';

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(5000),
  CLIENT_URL: Joi.string().uri({ scheme: ['http', 'https'] }).required(),
  CLIENT_ORIGINS: Joi.string().required(),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  ACCESS_TTL_MS: Joi.number().integer().min(60000).default(900000),
  REFRESH_TTL_MS: Joi.number().integer().min(3600000).default(604800000),
  REFRESH_REUSE_GRACE_MS: Joi.number().integer().min(0).max(60000).default(10000),
  BCRYPT_COST: Joi.number().integer().min(10).max(14).default(12),
  EMAIL_VERIFY_TTL_HOURS: Joi.number().integer().min(1).max(168).default(24),
  SMTP_HOST: Joi.string().allow('').default(''),
  SMTP_PORT: Joi.number().integer().min(1).max(65535).default(587),
  SMTP_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
  SMTP_USER: Joi.string().allow('').default(''),
  SMTP_PASS: Joi.string().allow('').default(''),
  SMTP_FROM: Joi.string().required(),
}).when(Joi.object({ NODE_ENV: Joi.valid('production') }).unknown(), {
  then: Joi.object({
    SMTP_HOST: Joi.string().min(1).required(),
    SMTP_USER: Joi.string().min(1).required(),
    SMTP_PASS: Joi.string().min(1).required(),
  }),
});

const { value, error } = schema.validate(process.env, {
  abortEarly: false,
  convert: true,
  allowUnknown: true,
});

if (error) {
  console.error('Invalid environment configuration:');
  for (const detail of error.details) console.error(`- ${detail.message}`);
  process.exit(1);
}

const env = {
  nodeEnv: value.NODE_ENV,
  isProd: value.NODE_ENV === 'production',
  port: value.PORT,
  clientUrl: value.CLIENT_URL,
  clientOrigins: value.CLIENT_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
  databaseUrl: value.DATABASE_URL,
  jwtAccessSecret: value.JWT_ACCESS_SECRET,
  jwtRefreshSecret: value.JWT_REFRESH_SECRET,
  accessTtlMs: value.ACCESS_TTL_MS,
  refreshTtlMs: value.REFRESH_TTL_MS,
  refreshReuseGraceMs: value.REFRESH_REUSE_GRACE_MS,
  bcryptCost: value.BCRYPT_COST,
  emailVerifyTtlHours: value.EMAIL_VERIFY_TTL_HOURS,
  emailVerifyTtlMs: value.EMAIL_VERIFY_TTL_HOURS * 60 * 60 * 1000,
  smtpHost: value.SMTP_HOST,
  smtpPort: value.SMTP_PORT,
  smtpSecure: value.SMTP_SECURE,
  smtpUser: value.SMTP_USER,
  smtpPass: value.SMTP_PASS,
  smtpFrom: value.SMTP_FROM,
};

export default env;