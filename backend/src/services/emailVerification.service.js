import { randomToken, sha256 } from '../utils/hash.js';
import { AppError } from '../utils/AppError.js';
import prisma from '../database/prisma.js';
import env from '../config/env.js';

export async function issue(userId) {
  await prisma.emailVerificationToken.deleteMany({
    where: { userId, usedAt: null },
  });

  const raw = randomToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash: sha256(raw),
      expiresAt: new Date(Date.now() + env.emailVerifyTtlMs),
    },
  });

  return raw;
}

export async function verify(rawToken) {
  if (!rawToken) throw new AppError(400, 'TOKEN_INVALID', 'Verification token is invalid');

  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: sha256(rawToken) },
    include: { user: { select: { id: true, emailVerifiedAt: true } } },
  });

  if (!record) throw new AppError(400, 'TOKEN_INVALID', 'This verification link is invalid');

  if (record.usedAt) {
    if (record.user?.emailVerifiedAt) return { alreadyVerified: true };

    throw new AppError(400, 'TOKEN_INVALID', 'This verification link is invalid or already used');
  }

  if (record.expiresAt < new Date()) {
    throw new AppError(410, 'TOKEN_EXPIRED', 'This verification link has expired');
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),

    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
  ]);

  return { alreadyVerified: false };
}