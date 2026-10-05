import pino from 'pino';
import env from './env.js';

const logger = pino({
  level: env.isProd ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.cookie',
      'req.headers.authorization',
      'res.headers[set-cookie]',
    ],
    censor: '[REDACTED]',
  },
  transport: env.isProd
    ? undefined
    : {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard' },
    },
});

export default logger;