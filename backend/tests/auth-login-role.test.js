import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prisma, comparePassword, signAccess, buildRefresh } = vi.hoisted(() => ({
  prisma: {
    user: { findUnique: vi.fn() },
    refreshToken: { create: vi.fn() },
  },
  comparePassword: vi.fn(),
  signAccess: vi.fn(),
  buildRefresh: vi.fn(),
}));

vi.mock('../src/database/prisma.js', () => ({ default: prisma }));
vi.mock('../src/auth/password.js', () => ({
  comparePassword,
  hashPassword: vi.fn(),
}));
vi.mock('../src/auth/token.service.js', () => ({
  buildRefresh,
  revokeRefreshToken: vi.fn(),
  rotateRefreshToken: vi.fn(),
  signAccess,
}));

const { login } = await import('../src/services/auth.service.js');

describe('role-restricted login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      email: 'client@example.com',
      passwordHash: 'password-hash',
      firstName: 'Test',
      lastName: 'Client',
      phone: null,
      role: 'CLIENT',
      emailVerifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    comparePassword.mockResolvedValue(true);
    signAccess.mockReturnValue('access-token');
    buildRefresh.mockReturnValue({ jwt: 'refresh-token', record: {} });
    prisma.refreshToken.create.mockResolvedValue({});
  });

  it('rejects customer accounts from the staff login flow', async () => {
    await expect(login(
      { email: 'client@example.com', password: 'password' },
      {},
      ['PROVIDER', 'ADMIN'],
    )).rejects.toMatchObject({ code: 'FORBIDDEN' });

    expect(prisma.refreshToken.create).not.toHaveBeenCalled();
  });

  it('allows an eligible staff account', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'provider-id',
      email: 'barber@example.com',
      passwordHash: 'password-hash',
      firstName: 'Test',
      lastName: 'Barber',
      phone: null,
      role: 'PROVIDER',
      emailVerifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(login(
      { email: 'barber@example.com', password: 'password' },
      {},
      ['PROVIDER', 'ADMIN'],
    )).resolves.toMatchObject({
      user: { id: 'provider-id', role: 'PROVIDER' },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(prisma.refreshToken.create).toHaveBeenCalledOnce();
  });
});
