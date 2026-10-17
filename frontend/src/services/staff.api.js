import { api } from './apiClient.js';

export async function getStaffMe() {
  const { data } = await api.get('/staff/me');
  return data.data;
}

export async function getRoster(date) {
  const { data } = await api.get('/staff/roster', { params: { date } });
  return data.data;
}

export async function updateAppointmentStatus(id, status) {
  const { data } = await api.patch(`/staff/appointments/${id}/status`, { status });
  return data.data;
}