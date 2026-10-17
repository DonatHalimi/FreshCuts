import crypto from 'node:crypto';
import prisma from '../database/prisma.js';
import { AppError } from '../utils/AppError.js';

const ROLE_PERMISSIONS = {
  GUEST: new Set(['guest.read']),
  CLIENT: new Set(['account.read', 'appointments.read']),
  PROVIDER: new Set(['account.read', 'appointments.read', 'staff.read']),
  ADMIN: new Set(['*']),
};

function canView(item, role) {
  if (!item.requiredPermissions.length) return true;
  if (item.requiredPermissions.includes('guest.read')) {
    return role === 'GUEST' && item.requiredPermissions.every((permission) => permission === 'guest.read');
  }
  const permissions = ROLE_PERMISSIONS[role] ?? new Set();
  return permissions.has('*') || item.requiredPermissions.every((permission) => permissions.has(permission));
}

function buildTree(items, role, parentId = null, depth = 1) {
  if (depth > 3) return [];
  return items
    .filter((item) => item.parentId === parentId && item.isActive && canView(item, role))
    .sort((a, b) => a.position - b.position)
    .map((item) => ({
      id: item.id,
      key: item.key,
      label: item.label,
      href: item.href,
      iconKey: item.iconKey,
      openInNewTab: item.openInNewTab,
      children: buildTree(items, role, item.id, depth + 1),
    }));
}

function validateHierarchy(items) {
  const itemById = new Map(items.map((item) => [item.id, item]));
  if (itemById.size !== items.length) {
    throw new AppError(422, 'INVALID_MENU_TREE', 'Menu item ids must be unique');
  }

  for (const item of items) {
    if (item.parentId && !itemById.has(item.parentId)) {
      throw new AppError(422, 'INVALID_MENU_TREE', 'Menu items must have a parent in the same menu');
    }
  }

  const depths = new Map();
  const getDepth = (item, path = new Set()) => {
    if (depths.has(item.id)) return depths.get(item.id);
    if (path.has(item.id)) throw new AppError(422, 'INVALID_MENU_TREE', 'Menu items cannot contain a cycle');
    if (!item.parentId) {
      depths.set(item.id, 1);
      return 1;
    }
    path.add(item.id);
    const depth = getDepth(itemById.get(item.parentId), path) + 1;
    path.delete(item.id);
    if (depth > 3) throw new AppError(422, 'MENU_DEPTH_EXCEEDED', 'Menus can have no more than three levels');
    depths.set(item.id, depth);
    return depth;
  };

  for (const item of items) getDepth(item);
}

async function getRawMenu(key) {
  const menu = await prisma.menu.findUnique({
    where: { key },
    include: { items: { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] } },
  });
  if (!menu || !menu.isActive) throw new AppError(404, 'MENU_NOT_FOUND', 'Menu not found');
  return menu;
}

export async function getMenu(key, role) {
  const menu = await getRawMenu(key);
  const audience = role ?? 'GUEST';
  const version = `${menu.version}-${audience}`;
  const etag = `"${crypto.createHash('sha256').update(version).digest('hex')}"`;
  return {
    menu: { key: menu.key, label: menu.label, version: menu.version, items: buildTree(menu.items, audience) },
    etag,
  };
}

export async function getMenusForAdmin() {
  const menus = await prisma.menu.findMany({
    orderBy: { key: 'asc' },
    include: { items: { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] } },
  });
  return menus.map((menu) => ({
    id: menu.id,
    key: menu.key,
    label: menu.label,
    isActive: menu.isActive,
    version: menu.version,
    updatedAt: menu.updatedAt,
    items: menu.items.map((item) => ({
      id: item.id,
      key: item.key,
      parentId: item.parentId,
      label: item.label,
      href: item.href,
      iconKey: item.iconKey,
      requiredPermissions: item.requiredPermissions,
      position: item.position,
      isActive: item.isActive,
      openInNewTab: item.openInNewTab,
    })),
  }));
}

export async function createMenuItem(menuKey, data) {
  const menu = await prisma.menu.findUnique({ where: { key: menuKey } });
  if (!menu) throw new AppError(404, 'MENU_NOT_FOUND', 'Menu not found');
  const items = await prisma.menuItem.findMany({ where: { menuId: menu.id } });
  validateHierarchy([...items, { id: 'new-item', parentId: data.parentId }]);

  try {
    const item = await prisma.$transaction(async (tx) => {
      const created = await tx.menuItem.create({ data: { ...data, menuId: menu.id } });
      await tx.menu.update({ where: { id: menu.id }, data: { version: { increment: 1 } } });
      return created;
    });
    return item;
  } catch (error) {
    if (error.code === 'P2002') throw new AppError(409, 'MENU_ITEM_KEY_EXISTS', 'That item key already exists in this menu');
    throw error;
  }
}

export async function updateMenuItem(menuKey, itemId, data) {
  const menu = await prisma.menu.findUnique({ where: { key: menuKey } });
  if (!menu) throw new AppError(404, 'MENU_NOT_FOUND', 'Menu not found');
  const items = await prisma.menuItem.findMany({ where: { menuId: menu.id } });
  const current = items.find((item) => item.id === itemId);
  if (!current) throw new AppError(404, 'MENU_ITEM_NOT_FOUND', 'Menu item not found');

  const updatedItems = items.map((item) => item.id === itemId
    ? { ...item, ...data }
    : item);
  validateHierarchy(updatedItems);

  try {
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.menuItem.update({ where: { id: itemId }, data });
      await tx.menu.update({ where: { id: menu.id }, data: { version: { increment: 1 } } });
      return updated;
    });
  } catch (error) {
    if (error.code === 'P2002') throw new AppError(409, 'MENU_ITEM_KEY_EXISTS', 'That item key already exists in this menu');
    throw error;
  }
}

export async function deleteMenuItem(menuKey, itemId) {
  const menu = await prisma.menu.findUnique({ where: { key: menuKey } });
  if (!menu) throw new AppError(404, 'MENU_NOT_FOUND', 'Menu not found');
  const item = await prisma.menuItem.findFirst({ where: { id: itemId, menuId: menu.id } });
  if (!item) throw new AppError(404, 'MENU_ITEM_NOT_FOUND', 'Menu item not found');
  await prisma.$transaction([
    prisma.menuItem.delete({ where: { id: itemId } }),
    prisma.menu.update({ where: { id: menu.id }, data: { version: { increment: 1 } } }),
  ]);
}

export async function reorderMenuItems(menuKey, updates) {
  const menu = await prisma.menu.findUnique({ where: { key: menuKey } });
  if (!menu) throw new AppError(404, 'MENU_NOT_FOUND', 'Menu not found');
  const items = await prisma.menuItem.findMany({ where: { menuId: menu.id } });
  if (updates.length !== items.length || new Set(updates.map((item) => item.id)).size !== items.length) {
    throw new AppError(422, 'INVALID_MENU_ORDER', 'Reordering must include every menu item exactly once');
  }

  const currentIds = new Set(items.map((item) => item.id));
  if (updates.some((item) => !currentIds.has(item.id))) {
    throw new AppError(422, 'INVALID_MENU_ORDER', 'All reordered items must belong to this menu');
  }
  const updateById = new Map(updates.map((item) => [item.id, item]));
  validateHierarchy(items.map((item) => ({
    ...item,
    parentId: updateById.get(item.id).parentId,
  })));

  await prisma.$transaction(async (tx) => {
    for (const update of updates) {
      await tx.menuItem.update({
        where: { id: update.id },
        data: { parentId: update.parentId, position: update.position },
      });
    }
    await tx.menu.update({ where: { id: menu.id }, data: { version: { increment: 1 } } });
  });
}
