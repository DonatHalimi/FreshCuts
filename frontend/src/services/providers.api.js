import { api } from './apiClient.js';

export async function getProviders(params = {}) {
  const { data } = await api.get('/providers', { params });
  return data;
}

export async function getProvider(id) {
  const { data } = await api.get(`/providers/${id}`);
  return data.data;
}