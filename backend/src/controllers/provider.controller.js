import * as providerService from '../services/provider.service.js';
import { sendSuccess } from '../utils/response.js';

export async function listProviders(req, res) {
  const { page, limit, serviceId, q } = req.validatedQuery;
  const result = await providerService.listProviders({ page, limit, serviceId, q });
  return sendSuccess(res, 200, result.rows, { page, limit, total: result.total });
}

export async function getProvider(req, res) {
  return sendSuccess(res, 200, await providerService.getProviderById(req.params.id));
}