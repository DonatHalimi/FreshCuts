import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  currentUser: null,
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: { updateMany: vi.fn() },
    emailVerificationToken: { deleteMany: vi.fn() },
    $transaction: vi.fn(),
  },
  issueVerificationToken: vi.fn(),
  sendVerificationEmail: vi.fn(),
}));

vi.mock('../src/database/prisma.js', () => ({ default: mocks.prisma }));
vi.mock('../src/auth/password.js', () => ({
  comparePassword: vi.fn(),
  hashPassword: vi.fn(),
}));
vi.mock('../src/auth/token.service.js', () => ({
  buildRefresh: vi.fn(),
  revokeRefreshToken: vi.fn(),
  rotateRefreshToken: vi.fn(),
  signAccess: vi.fn(),
}));
vi.mock('../src/services/emailVerification.service.js', () => ({
  issue: mocks.issueVerificationToken,
}));
vi.mock('../src/services/mail.service.js', () => ({
  sendVerificationEmail: mocks.sendVerificationEmail,
}));

const { updateAdminUser } = await import('../src/services/auth.service.js');

describe('admin user profile updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.currentUser = {
      id: 'user-id',
      email: 'old@example.com',
      firstName: 'Taylor',
      lastName: 'Client',
      phone: null,
      role: 'CLIENT',
      isActive: true,
      emailVerifiedAt: new Date('2026-01-01T00:00:00.000Z'),
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));
    mocks.prisma.user.findUnique.mockImplementation(async ({ where }) => {
      if (where.email) return null;
      return mocks.currentUser;
    });
    mocks.prisma.user.update.mockImplementation(async ({ data }) => ({
      ...mocks.currentUser,
      ...data,
    }));
    mocks.prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });
    mocks.prisma.emailVerificationToken.deleteMany.mockResolvedValue({ count: 1 });
    mocks.issueVerificationToken.mockResolvedValue('verification-token');
    mocks.sendVerificationEmail.mockResolvedValue(undefined);
  });

  it('updates profile details and re-verifies changed email addresses', async () => {
    const user = await updateAdminUser('user-id', {
      firstName: 'Jordan',
      email: 'NEW@example.com',
      phone: '555-0100',
    });

    expect(mocks.prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        firstName: 'Jordan',
        email: 'new@example.com',
        phone: '555-0100',
        emailVerifiedAt: null,
      }),
    }));
    expect(mocks.prisma.emailVerificationToken.deleteMany).toHaveBeenCalledOnce();
    expect(mocks.prisma.refreshToken.updateMany).toHaveBeenCalledOnce();
    expect(mocks.issueVerificationToken).toHaveBeenCalledWith('user-id');
    expect(mocks.sendVerificationEmail).toHaveBeenCalledWith(expect.objectContaining({
      email: 'new@example.com',
      url: expect.stringContaining('verification-token'),
    }));
    expect(user).toMatchObject({ email: 'new@example.com', emailVerified: false });
  });

  it('rejects an email already owned by another account', async () => {
    mocks.prisma.user.findUnique
      .mockResolvedValueOnce(mocks.currentUser)
      .mockResolvedValueOnce({ id: 'another-user' });

    await expect(updateAdminUser('user-id', { email: 'taken@example.com' }))
      .rejects.toMatchObject({ code: 'EMAIL_TAKEN', status: 409 });
    expect(mocks.prisma.user.update).not.toHaveBeenCalled();
  });
});
