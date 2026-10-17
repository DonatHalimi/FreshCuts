import { sendSuccess } from '../utils/response.js';
import * as menuService from '../services/menu.service.js';

export async function getMenu(req, res) {
  const { menu, etag } = await menuService.getMenu(req.params.key, req.auth?.role ?? 'GUEST');
  res.set('ETag', etag);
  res.set('Cache-Control', 'private, max-age=60');
  res.vary('Cookie');
  if (req.get('If-None-Match') === etag) return res.status(304).end();
  return sendSuccess(res, 200, menu);
}

export async function listMenus(_req, res) {
  return sendSuccess(res, 200, await menuService.getMenusForAdmin());
}

export async function createItem(req, res) {
  const item = await menuService.createMenuItem(req.params.key, req.body);
  return sendSuccess(res, 201, item);
}

export async function updateItem(req, res) {
  const item = await menuService.updateMenuItem(req.params.key, req.params.id, req.body);
  return sendSuccess(res, 200, item);
}

export async function deleteItem(req, res) {
  await menuService.deleteMenuItem(req.params.key, req.params.id);
  return sendSuccess(res, 200, { deleted: 1 });
}

export async function reorderItems(req, res) {
  await menuService.reorderMenuItems(req.params.key, req.body.items);
  return sendSuccess(res, 200, { updated: req.body.items.length });
}
