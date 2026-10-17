import { AppError } from '../utils/AppError.js';
import env from './env.js';

export const corsOptions = {
  origin(origin, callback) {
    if (!origin || env.clientOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new AppError(403, 'CORS_BLOCKED', 'Origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Requested-With', 'Idempotency-Key', 'X-CSRF-Token'],
  maxAge: 600,
};