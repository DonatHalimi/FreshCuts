import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import env from '../src/config/env.js';

const state = vi.hoisted(() => ({
  row: null,
  records: new Map(),
  user: { id: 'user-id', role: 'CLIENT', isActive: true },
}));

const prisma = vi.hoisted(() => ({
  refreshToken: {
    findUnique: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
  },
  user: { findUnique: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock('../src/database/prisma.js', () => ({ default: prisma }));

const { buildRefresh, rotateRefreshToken } = await import('../src/auth/token.service.js');

describe('refresh token rotation', () => {
  let originalRefreshToken;

  beforeEach(() => {
    vi.clearAllMocks();
    state.row = null;
    state.records.clear();
    state.user = { id: 'user-id', role: 'CLIENT', isActive: true };

    const initial = buildRefresh('user-id', 'family-id');
    originalRefreshToken = initial.jwt;
    state.row = { id: 'token-id', ...initial.record, revokedAt: null };
    state.records.set(initial.record.tokenHash, state.row);

    prisma.refreshToken.findUnique.mockImplementation(async ({ where }) => {
      if (where.id) return state.row?.id === where.id ? state.row : null;
      return state.records.get(where.tokenHash) ?? null;
    });
    prisma.refreshToken.updateMany.mockImplementation(async ({ where, data }) => {
      if (where.id) {
        if (state.row?.id !== where.id || state.row.revokedAt) return { count: 0 };
        state.row.revokedAt = data.revokedAt;
        return { count: 1 };
      }

      if (where.familyId === state.row?.familyId && !state.row.revokedAt) {
        state.row.revokedAt = data.revokedAt;
        return { count: 1 };
      }
      return { count: 0 };
    });
    prisma.refreshToken.upsert.mockImplementation(async ({ where, create }) => {
      const existing = state.records.get(where.tokenHash);
      if (existing) return existing;
      const record = { id: `token-${state.records.size}`, ...create, revokedAt: null };
      state.records.set(where.tokenHash, record);
      return record;
    });
    prisma.user.findUnique.mockImplementation(async () => state.user);
    prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
  });

  it('returns the same successor when a rotated token is reused during the grace period', async () => {
    const first = await rotateRefreshToken(originalRefreshToken);
    const concurrentRetry = await rotateRefreshToken(originalRefreshToken);

    expect(concurrentRetry.refreshToken).toBe(first.refreshToken);
    expect(state.records.size).toBe(2);
  });

  it('returns a consistent successor when requests race to rotate one token', async () => {
    const [first, second] = await Promise.all([
      rotateRefreshToken(originalRefreshToken),
      rotateRefreshToken(originalRefreshToken),
    ]);

    expect(first.refreshToken).toBe(second.refreshToken);
    expect(state.records.size).toBe(2);
  });

  it('rejects refresh for disabled accounts', async () => {
    state.user = { ...state.user, isActive: false };

    await expect(rotateRefreshToken(originalRefreshToken))
      .rejects.toMatchObject({ code: 'REFRESH_INVALID', status: 401 });
  });

  it('rejects invalid refresh tokens', async () => {
    await expect(rotateRefreshToken('invalid-token'))
      .rejects.toMatchObject({ code: 'REFRESH_INVALID', status: 401 });
  });

  it('rejects expired refresh tokens', async () => {
    const expiredToken = jwt.sign(
      { sub: 'user-id', fam: 'family-id', jti: 'expired-jti', iat: 1, exp: 2 },
      env.jwtRefreshSecret,
      { algorithm: 'HS256' },
    );

    await expect(rotateRefreshToken(expiredToken))
      .rejects.toMatchObject({ code: 'REFRESH_INVALID', status: 401 });
  });
});
