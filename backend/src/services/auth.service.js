import { comparePassword, hashPassword } from '../auth/password.js';
import { buildRefresh, revokeRefreshToken, rotateRefreshToken, signAccess } from '../auth/token.service.js';
import env from '../config/env.js';
import prisma from '../database/prisma.js';
import { AppError } from '../utils/AppError.js';
import { issue as issueVerificationToken } from './emailVerification.service.js';
import { sendVerificationEmail } from './mail.service.js';

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

const DUMMY_PASSWORD_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.PHf4wJ6Vn3f4F4k7fH7pI9Y8YQf0n5C';

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function toUser(user) {
  return {
    ...user,
    emailVerified: Boolean(user.emailVerifiedAt),
  };
}

async function sendVerification(user) {
  const raw = await issueVerificationToken(user.id);
  const url = `${env.clientUrl}/verify-email?token=${encodeURIComponent(raw)}`;

  try {
    await sendVerificationEmail({
      firstName: user.firstName,
      email: user.email,
      url,
    });
  } catch (error) {
    console.error('Verification email could not be sent:', error.message);
  }
}

export async function register(input) {
  const email = normalizeEmail(input.email);
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  if (existing) {
    throw new AppError(409, 'EMAIL_TAKEN', 'An account with that email already exists');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone?.trim() || null,
    },
    select: SAFE_USER,
  });

  await sendVerification(user);
  return toUser(user);
}

export async function login(input, meta = {}) {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const passwordMatches = await comparePassword(input.password, passwordHash);

  if (!user || !passwordMatches) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  if (!user.emailVerifiedAt) {
    throw new AppError(403, 'EMAIL_NOT_VERIFIED', 'Please verify your email before signing in');
  }

  const accessToken = signAccess(user);
  const refresh = buildRefresh(user.id);

  await prisma.refreshToken.create({
    data: {
      ...refresh.record,
      ...meta,
    },
  });

  return {
    user: toUser({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }),
    accessToken,
    refreshToken: refresh.jwt,
  };
}

export async function refresh(rawToken, meta = {}) {
  return rotateRefreshToken(rawToken, meta);
}

export async function logout(rawToken) {
  await revokeRefreshToken(rawToken);
}

export async function resendVerification(email) {
  const normalized = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalized } });

  if (user && !user.emailVerifiedAt) {
    await sendVerification(user);
  }
}