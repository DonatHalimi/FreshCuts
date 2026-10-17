import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prisma } = vi.hoisted(() => ({
  prisma: { $transaction: vi.fn() },
}));

vi.mock('../src/database/prisma.js', () => ({ default: prisma }));

const { create } = await import('../src/services/booking.service.js');

describe('booking idempotency', () => {
  let tx;
  let startAt;
  let existingAppointment;

  beforeEach(() => {
    vi.clearAllMocks();
    startAt = new Date(Date.now() + 86_400_000);
    existingAppointment = {
      id: 'appointment-id',
      customerId: 'customer-id',
      providerId: 'provider-id',
      serviceId: 'service-id',
      scheduledStartAt: startAt,
      notes: '',
    };
    tx = { appointment: { findFirst: vi.fn().mockResolvedValue(existingAppointment) } };
    prisma.$transaction.mockImplementation((callback) => callback(tx));
  });

  it('returns the existing appointment when a matching request is retried', async () => {
    await expect(create({
      customerId: 'customer-id',
      providerId: 'provider-id',
      serviceId: 'service-id',
      startAt: startAt.toISOString(),
      clientRequestId: 'request-key',
    })).resolves.toBe(existingAppointment);
    expect(tx.appointment.findFirst).toHaveBeenCalledWith({
      where: { customerId: 'customer-id', clientRequestId: 'request-key' },
    });
  });

  it('rejects reusing a key for different booking details', async () => {
    await expect(create({
      customerId: 'customer-id',
      providerId: 'another-provider-id',
      serviceId: 'service-id',
      startAt: startAt.toISOString(),
      clientRequestId: 'request-key',
    })).rejects.toMatchObject({ code: 'IDEMPOTENCY_KEY_REUSED' });
  });

  it('rejects an idempotency key that exceeds the storage limit', async () => {
    await expect(create({
      customerId: 'customer-id',
      providerId: 'provider-id',
      serviceId: 'service-id',
      startAt: startAt.toISOString(),
      clientRequestId: 'k'.repeat(101),
    })).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
