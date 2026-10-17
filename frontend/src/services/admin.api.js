import { api } from './apiClient.js';

export async function getAdminDashboard() {
  const { data } = await api.get('/admin/dashboard');
  return data.data;
}

export async function getAdminAppointments(params = {}) {
  const { data } = await api.get('/admin/appointments', { params });
  return data.data;
}

export async function updateAdminAppointmentStatus(id, status) {
  const { data } = await api.patch(`/admin/appointments/${id}/status`, { status });
  return data.data;
}

export async function deleteAdminAppointment(id) {
  const { data } = await api.delete(`/admin/appointments/${id}`);
  return data.data;
}

export async function bulkDeleteAdminAppointments(ids) {
  const { data } = await api.delete('/admin/appointments/bulk-delete', { data: { ids } });
  return data.data;
}

export async function getAdminUsers() {
  const { data } = await api.get('/admin/users');
  return data.data;
}

export async function createAdminUser(payload) {
  const { data } = await api.post('/admin/users', payload);
  return data.data;
}

export async function updateAdminUser(id, payload) {
  const { data } = await api.patch(`/admin/users/${id}`, payload);
  return data.data;
}

export async function deleteAdminUser(id) {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data.data;
}

export async function bulkDeleteAdminUsers(ids) {
  const { data } = await api.delete('/admin/users/bulk-delete', { data: { ids } });
  return data.data;
}

export async function getAdminServices() {
  const { data } = await api.get('/admin/services');
  return data.data;
}

export async function createAdminService(payload) {
  const { data } = await api.post('/admin/services', payload);
  return data.data;
}

export async function updateAdminService(id, payload) {
  const { data } = await api.patch(`/admin/services/${id}`, payload);
  return data.data;
}

export async function deleteAdminService(id) {
  const { data } = await api.delete(`/admin/services/${id}`);
  return data.data;
}

export async function bulkDeleteAdminServices(ids) {
  const { data } = await api.delete('/admin/services/bulk-delete', { data: { ids } });
  return data.data;
}

export async function getAdminProviders() {
  const { data } = await api.get('/admin/providers');
  return data.data;
}

export async function createAdminProvider(payload) {
  const { data } = await api.post('/admin/providers', payload);
  return data.data;
}

export async function updateAdminProvider(id, payload) {
  const { data } = await api.patch(`/admin/providers/${id}`, payload);
  return data.data;
}

export async function deleteAdminProvider(id) {
  const { data } = await api.delete(`/admin/providers/${id}`);
  return data.data;
}

export async function bulkDeleteAdminProviders(ids) {
  const { data } = await api.delete('/admin/providers/bulk-delete', { data: { ids } });
  return data.data;
}