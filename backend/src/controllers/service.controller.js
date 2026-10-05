import * as serviceService from '../services/service.service.js';
import { sendSuccess } from '../utils/response.js';

export async function listServices(_req, res) {
  return sendSuccess(res, 200, await serviceService.listServices());
}