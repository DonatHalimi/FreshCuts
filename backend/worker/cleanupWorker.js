import prisma from '../database/prisma.js';

export async function cleanupExpiredData() {
  const now = new Date();
  await Promise.all([
    prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.emailVerificationToken.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.passwordResetToken.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.emailOutbox.deleteMany({ where: { status: 'SENT', sentAt: { lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } } }),
  ]);
}
sp