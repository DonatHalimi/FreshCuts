import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import env from '../config/env.js';
import prisma from '../database/prisma.js';
import { AppError } from '../utils/AppError.js';
import { sha256 } from '../utils/hash.js';

function seconds(ms) {
  return Math.floor(ms / 1000);
}

export function signAccess(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    env.jwtAccessSecret,
    { algorithm: 'HS256', expiresIn: seconds(env.accessTtlMs) },
  );
}

export function buildRefresh(userId, familyId = crypto.randomUUID()) {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    { sub: userId, fam: familyId, jti },
    env.jwtRefreshSecret,
    { algorithm: 'HS256', expiresIn: seconds(env.refreshTtlMs) },
  );

  return {
    jwt: token,
    record: {
      userId,
      familyId,
      tokenHash: sha256(jti),
      expiresAt: new Date(Date.now() + env.refreshTtlMs),
      createdAt: new Date(),
    },
  };
}

export function verifyAccess(token) {
  return jwt.verify(token, env.jwtAccessSecret, { algorithms: ['HS256'] });
}

export function verifyRefresh(token) {
  return jwt.verify(token, env.jwtRefreshSecret, { algorithms: ['HS256'] });
}

async function revokeFamily(familyId) {
  await prisma.refreshToken.updateMany({
    where: { familyId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function createRefreshSession(userId, meta = {}) {
  const next = buildRefresh(userId);
  await prisma.refreshToken.create({ data: { ...next.record, ...meta } });
  return next.jwt;
}

export async function rotateRefreshToken(rawToken, meta = {}) {
  if (!rawToken) throw new AppError(401, 'REFRESH_INVALID', 'Refresh token missing');

  let payload;
  try {
    payload = verifyRefresh(rawToken);
  } catch (error) {
    if (error?.name === 'TokenExpiredError') {
      throw new AppError(401, 'REFRESH_INVALID', 'Refresh token expired');
    }
    throw new AppError(401, 'REFRESH_INVALID', 'Refresh token invalid');
  }

  if (!payload?.jti || !payload?.sub || !payload?.fam) {
    throw new AppError(401, 'REFRESH_INVALID', 'Refresh token invalid');
  }

  const row = await prisma.refreshToken.findUnique({
    where: { tokenHash: sha256(payload.jti) },
  });

  if (!row || row.expiresAt < new Date()) {
    throw new AppError(401, 'REFRESH_INVALID', 'Session expired');
  }

  if (row.revokedAt) {
    const graceAge = Date.now() - row.revokedAt.getTime();
    if (graceAge > env.refreshReuseGraceMs) {
      await revokeFamily(row.familyId);
      throw new AppError(401, 'REFRESH_INVALID', 'Session expired');
    }

    const user = await prisma.user.findUnique({
      where: { id: row.userId },
      select: { id: true, role: true },
    });
    if (!user) throw new AppError(401, 'REFRESH_INVALID', 'Session expired');

    const next = buildRefresh(user.id, row.familyId);
    await prisma.refreshToken.create({ data: { ...next.record, ...meta } });
    return { accessToken: signAccess(user), refreshToken: next.jwt };
  }

  const user = await prisma.user.findUnique({
    where: { id: row.userId },
    select: { id: true, role: true },
  });
  if (!user) throw new AppError(401, 'REFRESH_INVALID', 'Session expired');

  const next = buildRefresh(user.id, row.familyId);
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: row.id },
      data: { revokedAt: new Date() },
    }),
    prisma.refreshToken.create({ data: { ...next.record, ...meta } }),
  ]);

  return {
    accessToken: signAccess(user),
    refreshToken: next.jwt,
  };
}

export async function revokeRefreshToken(rawToken) {
  if (!rawToken) return;

  try {
    const payload = verifyRefresh(rawToken);
    if (!payload?.jti) return;
    await prisma.refreshToken.updateMany({
      where: { tokenHash: sha256(payload.jti), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  } catch {
  }
}