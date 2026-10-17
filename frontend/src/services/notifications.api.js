import { api } from './apiClient.js';

export async function getNotifications() {
  const { data } = await api.get('/notifications');
  return data.data;
}

export async function markNotificationRead(id) {
  const { data } = await api.post(`/notifications/${id}/read`);
  return data.data;
}