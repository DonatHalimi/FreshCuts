import { api } from './apiClient.js';

export async function getProviders(params = {}) {
  const { data } = await api.get('/providers', { params });
  return data;
}

export async function getProvidersForService(serviceId) {
  const limit = 24;
  const providers = [];
  let page = 1;
  let total = Infinity;

  while (providers.length < total) {
    const result = await getProviders({ page, limit, serviceId });
    providers.push(...result.data);
    total = result.meta?.total ?? providers.length;
    page += 1;
  }

  return providers;
}

export async function getProvider(id) {
  const { data } = await api.get(`/providers/${id}`);
  return data.data;
}