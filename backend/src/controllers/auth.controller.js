import { clearAuthCookies, setAuthCookies } from '../config/cookies.js';
import * as authService from '../services/auth.service.js';
import * as emailVerificationService from '../services/emailVerification.service.js';
import { sendSuccess } from '../utils/response.js';

function requestMeta(req) {
  return {
    userAgent: req.get('user-agent')?.slice(0, 500),
    ip: req.ip,
  };
}

export async function register(req, res) {
  const user = await authService.register(req.body);
  return sendSuccess(res, 201, user);
}

export async function verifyEmail(req, res) {
  const result = await emailVerificationService.verify(req.body.token);
  return sendSuccess(res, 200, {
    verified: true,
    alreadyVerified: Boolean(result?.alreadyVerified),
  });
}

export async function resendVerification(req, res) {
  await authService.resendVerification(req.body.email);
  return res.status(202).json({
    success: true,
    data: { message: 'If the account exists and needs verification, a new email has been sent.' },
  });
}

export async function login(req, res) {
  const result = await authService.login(req.body, requestMeta(req));
  setAuthCookies(res, result);

  return sendSuccess(res, 200, {
    user: result.user,
  });
}

export async function refresh(req, res) {
  const result = await authService.refresh(req.cookies?.fc_refresh, requestMeta(req));
  setAuthCookies(res, result);
  return sendSuccess(res, 200, { refreshed: true });
}

export async function staffLogin(req, res) {
  const result = await authService.login(req.body, requestMeta(req), ['PROVIDER', 'ADMIN']);
  setAuthCookies(res, result);
  return sendSuccess(res, 200, { user: result.user });
}

export async function forgotPassword(req, res) {
  await authService.forgotPassword(req.body.email);
  return sendSuccess(res, 202, { message: 'If an account exists for that email, a reset link has been sent.' });
}

export async function resetPassword(req, res) {
  await authService.resetPassword(req.body.token, req.body.password);
  return sendSuccess(res, 200, { reset: true });
}

export async function logout(req, res) {
  await authService.logout(req.cookies?.fc_refresh);
  clearAuthCookies(res);
  return res.status(204).send();
}