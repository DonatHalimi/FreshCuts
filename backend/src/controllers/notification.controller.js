import * as service from '../services/notification.service.js';
import { sendSuccess } from '../../utils/response.js';

export async function list(req, res) {
  return sendSuccess(res, 200, await service.listForUser(req.auth.userId));
}

export async function markRead(req, res) {
  await service.markRead(req.auth.userId, req.params.id);
  return sendSuccess(res, 200, { read: true });
}
