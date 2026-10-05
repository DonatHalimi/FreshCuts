import { AppError } from '../utils/AppError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function csrfGuard(req, _res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  if (req.get('X-Requested-With') === 'XMLHttpRequest') return next();
  return next(new AppError(403, 'CSRF_BLOCKED', 'Missing required request header'));
}