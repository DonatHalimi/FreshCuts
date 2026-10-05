import { api } from './apiClient.js';

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data.data;
}

export async function verifyEmail(token) {
  const { data } = await api.post('/auth/verify-email', { token });
  return data.data;
}

export async function resendVerification(email) {
  const { data } = await api.post('/auth/resend-verification', { email });
  return data.data;
}

export async function login(payload) {
  const { data } = await api.post('/auth/login', payload);
  return data.data;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function getMe() {
  const { data } = await api.get('/users/me');
  return data.data;
}

export async function updateProfile(payload) {
  const { data } = await api.patch('/users/me', payload);
  return data.data;
}