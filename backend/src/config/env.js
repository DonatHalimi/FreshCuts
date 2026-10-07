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
  PASSWORD_RESET_TTL_MINUTES: Joi.number().integer().min(10).max(1440).default(60),
  BOOKING_TRANSACTION_RETRIES: Joi.number().integer().min(1).max(10).default(3),
  SHOP_TIMEZONE: Joi.string().default('Europe/Belgrade'),
  SLOT_INTERVAL_MINUTES: Joi.number().integer().valid(5, 10, 15, 20, 30, 60).default(15),
  SMTP_HOST: Joi.string().allow('').default(''),
  SMTP_PORT: Joi.number().integer().min(1).max(65535).default(587),
  SMTP_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
  SMTP_USER: Joi.string().allow('').default(''),
  SMTP_PASS: Joi.string().allow('').default(''),
  SMTP_FROM: Joi.string().required(),
  LOG_LEVEL: Joi.string().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent').default('info'),
}).unknown(true);

const { value, error } = schema.validate(process.env, { abortEarly: false, convert: true });

if (error) {
  console.error('Invalid environment configuration:');
  for (const detail of error.details) console.error(`- ${detail.message}`);
  process.exit(1);
}

process.env.TZ = value.SHOP_TIMEZONE;

export default {
  nodeEnv: value.NODE_ENV,
  isProd: value.NODE_ENV === 'production',
  port: value.PORT,
  clientUrl: value.CLIENT_URL,
  clientOrigins: value.CLIENT_ORIGINS.split(',').map((x) => x.trim()).filter(Boolean),
  databaseUrl: value.DATABASE_URL,
  jwtAccessSecret: value.JWT_ACCESS_SECRET,
  jwtRefreshSecret: value.JWT_REFRESH_SECRET,
  accessTtlMs: value.ACCESS_TTL_MS,
  refreshTtlMs: value.REFRESH_TTL_MS,
  refreshReuseGraceMs: value.REFRESH_REUSE_GRACE_MS,
  bcryptCost: value.BCRYPT_COST,
  emailVerifyTtlHours: value.EMAIL_VERIFY_TTL_HOURS,
  emailVerifyTtlMs: value.EMAIL_VERIFY_TTL_HOURS * 60 * 60 * 1000,
  passwordResetTtlMs: value.PASSWORD_RESET_TTL_MINUTES * 60 * 1000,
  bookingTransactionRetries: value.BOOKING_TRANSACTION_RETRIES,
  shopTimezone: value.SHOP_TIMEZONE,
  slotIntervalMinutes: value.SLOT_INTERVAL_MINUTES,
  smtpHost: value.SMTP_HOST,
  smtpPort: value.SMTP_PORT,
  smtpSecure: value.SMTP_SECURE,
  smtpUser: value.SMTP_USER,
  smtpPass: value.SMTP_PASS,
  smtpFrom: value.SMTP_FROM,
  logLevel: value.LOG_LEVEL,
};
