import * as passwordReset from './passwordReset.service.js';
import { sendSuccess } from '../../utils/response.js';

export async function forgotPassword(req, res) {
  await passwordReset.issue(req.body.email.trim().toLowerCase());
  return sendSuccess(res, 202, {
    message: 'If an account exists for that email, a reset link has been sent.',
  });
}

export async function resetPassword(req, res) {
  await passwordReset.reset(req.body.token, req.body.password);
  return sendSuccess(res, 200, { reset: true });
}
