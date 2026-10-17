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

export function buildRefresh(userId, familyId = crypto.randomUUID(), options = {}) {
  const jti = options.jti ?? crypto.randomUUID();
  const createdAt = options.issuedAt ?? new Date();
  const token = jwt.sign(
    {
      sub: userId,
      fam: familyId,
      jti,
      ...(options.issuedAt ? { iat: Math.floor(createdAt.getTime() / 1000) } : {}),
    },
    env.jwtRefreshSecret,
    { algorithm: 'HS256', expiresIn: seconds(env.refreshTtlMs) },
  );

  return {
    jwt: token,
    record: {
      userId,
      familyId,
      tokenHash: sha256(jti),
      expiresAt: new Date(createdAt.getTime() + env.refreshTtlMs),
      createdAt,
    },
  };
}

export function verifyAccess(token) {
  return jwt.verify(token, env.jwtAccessSecret, { algorithms: ['HS256'] });
}

export function verifyRefresh(token) {
  return jwt.verify(token, env.jwtRefreshSecret, { algorithms: ['HS256'] });
}

function invalidRefreshError(message = 'Session expired') {
  return new AppError(401, 'REFRESH_INVALID', message);
}

function successorJti(familyId, parentJti) {
  return crypto
    .createHmac('sha256', env.jwtRefreshSecret)
    .update(`refresh-rotation:${familyId}:${parentJti}`)
    .digest('base64url');
}

async function rotateWithinTransaction(tx, payload, meta) {
  let row = await tx.refreshToken.findUnique({
    where: { tokenHash: sha256(payload.jti) },
  });
  if (!row || row.familyId !== payload.fam || row.userId !== payload.sub || row.expiresAt < new Date()) {
    return null;
  }

  let rotatedAt;
  if (row.revokedAt) {
    if (Date.now() - row.revokedAt.getTime() > env.refreshReuseGraceMs) {
      await tx.refreshToken.updateMany({
        where: { familyId: row.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return null;
    }
    rotatedAt = row.revokedAt;
  } else {
    rotatedAt = new Date();
    const updated = await tx.refreshToken.updateMany({
      where: { id: row.id, revokedAt: null },
      data: { revokedAt: rotatedAt },
    });

    if (updated.count === 0) {
      row = await tx.refreshToken.findUnique({ where: { id: row.id } });
      if (!row?.revokedAt || Date.now() - row.revokedAt.getTime() > env.refreshReuseGraceMs) {
        if (row) {
          await tx.refreshToken.updateMany({
            where: { familyId: row.familyId, revokedAt: null },
            data: { revokedAt: new Date() },
          });
        }
        return null;
      }
      rotatedAt = row.revokedAt;
    }
  }

  const user = await tx.user.findUnique({
    where: { id: row.userId },
    select: { id: true, role: true, isActive: true },
  });
  if (!user?.isActive) {
    await tx.refreshToken.updateMany({
      where: { familyId: row.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return null;
  }

  const next = buildRefresh(user.id, row.familyId, {
    jti: successorJti(row.familyId, payload.jti),
    issuedAt: rotatedAt,
  });
  await tx.refreshToken.upsert({
    where: { tokenHash: next.record.tokenHash },
    update: {},
    create: { ...next.record, ...meta },
  });

  return {
    accessToken: signAccess(user),
    refreshToken: next.jwt,
  };
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

  const result = await prisma.$transaction((tx) => rotateWithinTransaction(tx, payload, meta));
  if (!result) throw invalidRefreshError();
  return result;
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
    return;
  }
}