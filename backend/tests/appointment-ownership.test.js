import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prisma } = vi.hoisted(() => ({
  prisma: {
    appointment: { findFirst: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock('../src/database/prisma.js', () => ({ default: prisma }));

const { cancel, getForCustomer } = await import('../src/services/appointment.service.js');

describe('customer appointment ownership', () => {
  let tx;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma.appointment.findFirst.mockResolvedValue(null);
    tx = {
      appointment: {
        findFirst: vi.fn().mockResolvedValue(null),
        updateMany: vi.fn(),
        findUnique: vi.fn(),
      },
      emailOutbox: { create: vi.fn() },
      notification: { create: vi.fn() },
    };
    prisma.$transaction.mockImplementation((callback) => callback(tx));
  });

  it('scopes appointment lookups to the requesting customer', async () => {
    await expect(getForCustomer('customer-id', 'appointment-id'))
      .rejects.toMatchObject({ code: 'APPOINTMENT_NOT_FOUND' });

    expect(prisma.appointment.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'appointment-id', customerId: 'customer-id' },
    }));
  });

  it('does not allow a different customer to cancel an appointment', async () => {
    await expect(cancel('another-customer-id', 'appointment-id'))
      .rejects.toMatchObject({ code: 'APPOINTMENT_NOT_FOUND' });

    expect(tx.appointment.findFirst).toHaveBeenCalledWith({
      where: { id: 'appointment-id', customerId: 'another-customer-id' },
      include: { provider: true, service: true, customer: true },
    });
    expect(tx.appointment.updateMany).not.toHaveBeenCalled();
  });

  it('cancels a future confirmed appointment and queues its notifications', async () => {
    const scheduledStartAt = new Date(Date.now() + 86_400_000);
    const appointment = {
      id: 'appointment-id',
      customerId: 'customer-id',
      status: 'CONFIRMED',
      scheduledStartAt,
      serviceNameSnapshot: 'Haircut',
      provider: { name: 'Barber' },
      service: {},
      customer: { email: 'client@example.com', firstName: 'Client' },
    };
    tx.appointment.findFirst.mockResolvedValue(appointment);
    tx.appointment.updateMany.mockResolvedValue({ count: 1 });
    tx.appointment.findUnique.mockResolvedValue({ id: appointment.id, status: 'CANCELLED' });

    await expect(cancel('customer-id', appointment.id, 'Schedule conflict'))
      .resolves.toMatchObject({ status: 'CANCELLED' });

    expect(tx.appointment.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        id: appointment.id,
        customerId: 'customer-id',
        status: 'CONFIRMED',
        scheduledStartAt: expect.objectContaining({ gt: expect.any(Date) }),
      }),
      data: { status: 'CANCELLED', cancellationReason: 'Schedule conflict' },
    }));
    expect(tx.emailOutbox.create).toHaveBeenCalledOnce();
    expect(tx.notification.create).toHaveBeenCalledOnce();
  });

  it.each([
    ['completed', { status: 'COMPLETED', scheduledStartAt: new Date(Date.now() + 86_400_000) }],
    ['past', { status: 'CONFIRMED', scheduledStartAt: new Date(Date.now() - 86_400_000) }],
  ])('does not cancel a %s appointment', async (_name, state) => {
    tx.appointment.findFirst.mockResolvedValue({
      id: 'appointment-id',
      customerId: 'customer-id',
      status: state.status,
      scheduledStartAt: state.scheduledStartAt,
    });

    await expect(cancel('customer-id', 'appointment-id'))
      .rejects.toMatchObject({ code: 'APPOINTMENT_NOT_MODIFIABLE' });
    expect(tx.appointment.updateMany).not.toHaveBeenCalled();
    expect(tx.emailOutbox.create).not.toHaveBeenCalled();
  });
});
