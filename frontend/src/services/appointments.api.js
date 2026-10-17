import { api } from './apiClient.js';

export async function getAppointments(params = {}) {
  const { data } = await api.get('/appointments', { params });
  return data.data;
}

export async function getAppointment(id) {
  const { data } = await api.get(`/appointments/${id}`);
  return data.data;
}

export async function createAppointment(payload, idempotencyKey) {
  const { data } = await api.post('/appointments', payload, { headers: { 'Idempotency-Key': idempotencyKey } });
  return data.data;
}

export async function cancelAppointment(id, reason = '') {
  const { data } = await api.post(`/appointments/${id}/cancel`, { reason });
  return data.data;
}

export async function rescheduleAppointment(id, startAt) {
  const { data } = await api.post(`/appointments/${id}/reschedule`, { startAt });
  return data.data;
}