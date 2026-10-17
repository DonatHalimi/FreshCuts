import { verifyAccess } from './token.service.js';

export function optionalAuthenticate(req, _res, next) {
  const token = req.cookies?.fc_access;
  if (!token) return next();

  try {
    const payload = verifyAccess(token);
    if (payload?.sub) req.auth = { userId: payload.sub, role: payload.role };
  } catch {
    req.auth = undefined;
  }
  return next();
}
