import { api } from './apiClient.js';

export async function getMenu(key) {
  const { data } = await api.get(`/menus/${key}`);
  return data.data;
}

export async function getAdminMenus() {
  const { data } = await api.get('/menus/admin');
  return data.data;
}

export async function createAdminMenuItem(menuKey, payload) {
  const { data } = await api.post(`/menus/admin/${menuKey}/items`, payload);
  return data.data;
}

export async function updateAdminMenuItem(menuKey, id, payload) {
  const { data } = await api.patch(`/menus/admin/${menuKey}/items/${id}`, payload);
  return data.data;
}

export async function deleteAdminMenuItem(menuKey, id) {
  const { data } = await api.delete(`/menus/admin/${menuKey}/items/${id}`);
  return data.data;
}

export async function reorderAdminMenuItems(menuKey, items) {
  const { data } = await api.patch(`/menus/admin/${menuKey}/items/reorder`, { items });
  return data.data;
}
