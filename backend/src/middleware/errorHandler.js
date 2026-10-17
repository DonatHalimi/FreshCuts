import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
const { JsonWebTokenError, TokenExpiredError } = jwt;

function normalizeError(error) {
  if (error instanceof AppError) return error;

  if (error instanceof TokenExpiredError) {
    return new AppError(401, 'ACCESS_TOKEN_EXPIRED', 'Access token expired');
  }

  if (error instanceof JsonWebTokenError) {
    return new AppError(401, 'UNAUTHENTICATED', 'Authentication required');
  }

  if (error?.status && error?.code) {
    return new AppError(error.status, error.code, error.message, error.errors);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return new AppError(409, 'CONFLICT', 'A record with that value already exists');
    }
    if (error.code === 'P2025') {
      return new AppError(404, 'NOT_FOUND', 'The requested record was not found');
    }
  }

  return new AppError(500, 'INTERNAL_ERROR', 'Something went wrong');
}

export function errorHandler(error, req, res, _next) {
  const normalized = normalizeError(error);

  if (normalized.status >= 500) {
    req.log.error({ err: error }, 'Unhandled request error');
  }

  return res.status(normalized.status).json({
    success: false,
    code: normalized.code,
    message: normalized.status >= 500 ? 'Something went wrong' : normalized.message,
    ...(normalized.errors?.length ? { errors: normalized.errors } : {}),
  });
}