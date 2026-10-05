import { sendSuccess } from '../utils/response.js';

export function health(_req, res) {
  return sendSuccess(res, 200, { status: 'ok', service: 'freshcuts-api' });
}