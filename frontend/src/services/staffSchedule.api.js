import { api } from './apiClient.js';

export async function getStaffSchedule() {
  const { data } = await api.get('/staff/schedule');
  return data.data;
}

export async function saveWorkingHours(entries) {
  const { data } = await api.put('/staff/schedule/working-hours', { entries });
  return data.data;
}

export async function saveBreaks(entries) {
  const { data } = await api.put('/staff/schedule/breaks', { entries });
  return data.data;
}

export async function createTimeOff(payload) {
  const { data } = await api.post('/staff/schedule/time-off', payload);
  return data.data;
}

export async function deleteTimeOff(id) {
  await api.delete(`/staff/schedule/time-off/${id}`);
}