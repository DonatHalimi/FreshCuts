import * as userService from '../services/user.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getMe(req, res) {
  return sendSuccess(res, 200, await userService.getCurrentUser(req.auth.userId));
}

export async function updateMe(req, res) {
  return sendSuccess(res, 200, await userService.updateCurrentUser(req.auth.userId, req.body));
}