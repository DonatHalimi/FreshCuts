import crypto from 'node:crypto';
import prisma from '../../database/prisma.js';
import env from '../../config/env.js';
import { hashPassword } from '../../auth/password.js';
import { sha256 } from '../../shared/utils/hash.js';
import { AppError } from '../../utils/AppError.js';
import { queueEmail } from '../notifications/outbox.service.js';

export async function issue(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, firstName: true },
  });
  if (!user) return;

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
  const raw = crypto.randomBytes(32).toString('base64url');

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(raw),
      expiresAt: new Date(Date.now() + env.passwordResetTtlMs),
    },
  });

  await queueEmail('PASSWORD_RESET', user.email, {
    firstName: user.firstName,
    url: `${env.clientUrl}/reset-password?token=${encodeURIComponent(raw)}`,
    ttlMinutes: Math.round(env.passwordResetTtlMs / 60000),
  });
}

export async function reset(rawToken, newPassword) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: sha256(rawToken) },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });

  if (!record || record.usedAt) {
    throw new AppError(400, 'PASSWORD_RESET_INVALID', 'This password reset link is invalid or already used');
  }
  if (record.expiresAt < new Date()) {
    throw new AppError(410, 'PASSWORD_RESET_EXPIRED', 'This password reset link has expired');
  }

  const passwordHash = await hashPassword(newPassword);
  const now = new Date();

  await prisma.$transaction([
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: now } }),
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: now } }),
  ]);
}
