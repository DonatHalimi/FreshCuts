import { api } from './apiClient.js';

export async function getServices() {
  const { data } = await api.get('/services');
  return data.data;
}