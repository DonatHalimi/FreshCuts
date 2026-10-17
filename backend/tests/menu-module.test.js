import { beforeEach, describe, expect, it, vi } from 'vitest';

const prisma = vi.hoisted(() => ({
  menu: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  menuItem: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock('../src/database/prisma.js', () => ({ default: prisma }));

const { createMenuItem, getMenu, reorderMenuItems } = await import('../src/services/menu.service.js');
const { updateMenuItemSchema, createMenuItemSchema } = await import('../src/validations/menu.validation.js');

describe('menu module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a nested menu filtered by role, including guest-only links for guests', async () => {
    prisma.menu.findUnique.mockResolvedValue({
      key: 'global_header',
      label: 'Main navigation',
      version: 4,
      isActive: true,
      items: [
        { id: 'home', key: 'home', label: 'Home', href: '/', iconKey: 'home', parentId: null, position: 0, isActive: true, requiredPermissions: [] },
        { id: 'login', key: 'login', label: 'Log in', href: '/login', iconKey: null, parentId: null, position: 1, isActive: true, requiredPermissions: ['guest.read'] },
        { id: 'appointments', key: 'appointments', label: 'Appointments', href: '/account/appointments', iconKey: null, parentId: null, position: 2, isActive: true, requiredPermissions: ['appointments.read'] },
      ],
    });

    const { menu, etag } = await getMenu('global_header', 'GUEST');

    expect(menu.items.map((item) => item.key)).toEqual(['home', 'login']);
    expect(etag).toMatch(/^".+"$/);
  });

  it('prevents moving menu items into a hierarchy deeper than three levels', async () => {
    prisma.menu.findUnique.mockResolvedValue({ id: 'menu-id' });
    prisma.menuItem.findMany.mockResolvedValue([
      { id: 'level-one', parentId: null },
      { id: 'level-two', parentId: 'level-one' },
      { id: 'level-three', parentId: 'level-two' },
    ]);

    await expect(createMenuItem('global_header', {
      key: 'level-four',
      parentId: 'level-three',
    })).rejects.toMatchObject({ code: 'MENU_DEPTH_EXCEEDED', status: 422 });
    expect(prisma.menuItem.create).not.toHaveBeenCalled();
  });

  it('rejects cyclic menu ordering', async () => {
    prisma.menu.findUnique.mockResolvedValue({ id: 'menu-id' });
    prisma.menuItem.findMany.mockResolvedValue([
      { id: 'first', parentId: null, position: 0 },
      { id: 'second', parentId: 'first', position: 0 },
    ]);

    await expect(reorderMenuItems('global_header', [
      { id: 'first', parentId: 'second', position: 0 },
      { id: 'second', parentId: 'first', position: 0 },
    ])).rejects.toMatchObject({ code: 'INVALID_MENU_TREE', status: 422 });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('does not apply create defaults to partial menu item updates', () => {
    const { error, value } = updateMenuItemSchema.validate({ label: 'Updated label' });

    expect(error).toBeUndefined();
    expect(value).toEqual({ label: 'Updated label' });
  });

  it('accepts internal paths but rejects unsafe navigation URLs', () => {
    expect(createMenuItemSchema.validate({
      key: 'valid',
      label: 'Valid',
      href: '/account',
    }).error).toBeUndefined();
    expect(createMenuItemSchema.validate({
      key: 'unsafe',
      label: 'Unsafe',
      href: 'javascript:alert(1)',
    }).error).toBeDefined();
    expect(createMenuItemSchema.validate({
      key: 'insecure',
      label: 'Insecure',
      href: 'http://example.com',
    }).error).toBeDefined();
  });
});
