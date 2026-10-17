import { api } from './apiClient.js';

export async function getAvailability(params) {
  const { data } = await api.get('/availability', { params });
  return data.data;
}