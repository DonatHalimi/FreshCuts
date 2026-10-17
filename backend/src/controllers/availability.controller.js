import { getAvailableSlots } from '../services/availability.service.js';
import { sendSuccess } from '../utils/response.js';

export async function list(req, res) {
  const result = await getAvailableSlots(req.validatedQuery);
  return sendSuccess(res, 200, result);
}
