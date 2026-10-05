import prisma from '../database/prisma.js';
import { AppError } from '../utils/AppError.js';

const SAFE_USER = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
};

export async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: SAFE_USER });
  if (!user) throw new AppError(401, 'UNAUTHENTICATED', 'Authentication required');
  return { ...user, emailVerified: Boolean(user.emailVerifiedAt) };
}

export async function updateCurrentUser(userId, input) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.firstName !== undefined ? { firstName: input.firstName.trim() } : {}),
      ...(input.lastName !== undefined ? { lastName: input.lastName.trim() } : {}),
      ...(input.phone !== undefined ? { phone: input.phone?.trim() || null } : {}),
    },
    select: SAFE_USER,
  });

  return { ...user, emailVerified: Boolean(user.emailVerifiedAt) };
}