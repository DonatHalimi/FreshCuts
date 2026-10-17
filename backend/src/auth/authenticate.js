import { AppError } from '../utils/AppError.js';
import { verifyAccess } from './token.service.js';

export function authenticate(req, _res, next) {
  const token = req.cookies?.fc_access;
  if (!token) return next(new AppError(401, 'ACCESS_TOKEN_MISSING', 'Access token missing'));

  try {
    const payload = verifyAccess(token);
    if (!payload?.sub) {
      return next(new AppError(401, 'UNAUTHENTICATED', 'Authentication required'));
    }
    req.auth = { userId: payload.sub, role: payload.role };
    return next();
  } catch (error) {
    return next(error);
  }
}