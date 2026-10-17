import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prisma } = vi.hoisted(() => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

vi.mock('../src/database/prisma.js', () => ({ default: prisma }));

const { reschedule } = await import('../src/services/appointment.service.js');

describe('appointment rescheduling', () => {
  let appointment;
  let tx;

  beforeEach(() => {
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 2);
    appointmentDate.setHours(12, 0, 0, 0);

    appointment = {
      id: 'appointment-id',
      customerId: 'customer-id',
      providerId: 'provider-id',
      status: 'CONFIRMED',
      scheduledStartAt: appointmentDate,
      bufferBeforeMinSnapshot: 0,
      durationMinSnapshot: 30,
      bufferAfterMinSnapshot: 0,
      service: { name: 'Haircut' },
      provider: { name: 'Barber' },
      customer: { email: 'client@example.com', firstName: 'Client' },
    };
    tx = {
      appointment: {
        findFirst: vi.fn().mockResolvedValueOnce(appointment).mockResolvedValueOnce(null),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUnique: vi.fn().mockResolvedValue({ id: appointment.id }),
      },
      workingHour: {
        findMany: vi.fn().mockResolvedValue([{
          dayOfWeek: appointmentDate.getDay() || 7,
          startMin: 540,
          endMin: 1020,
          isActive: true,
        }]),
      },
      scheduleBreak: { findMany: vi.fn().mockResolvedValue([]) },
      timeOff: { findMany: vi.fn().mockResolvedValue([]) },
      emailOutbox: { create: vi.fn().mockResolvedValue({}) },
      notification: { create: vi.fn().mockResolvedValue({}) },
    };
    prisma.$transaction.mockImplementation((callback) => callback(tx));
  });

  it('rejects a new time outside the barber schedule', async () => {
    const start = new Date();
    start.setDate(start.getDate() + 2);
    start.setHours(8, 30, 0, 0);

    await expect(reschedule('customer-id', appointment.id, start.toISOString()))
      .rejects.toMatchObject({ code: 'SLOT_UNAVAILABLE' });
    expect(tx.appointment.updateMany).not.toHaveBeenCalled();
  });

  it('updates an appointment moved into an available working-hours slot', async () => {
    const start = new Date();
    start.setDate(start.getDate() + 2);
    start.setHours(14, 0, 0, 0);

    await expect(reschedule('customer-id', appointment.id, start.toISOString()))
      .resolves.toMatchObject({ id: appointment.id });
    expect(tx.appointment.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: appointment.id, customerId: 'customer-id', status: 'CONFIRMED' }),
      data: expect.objectContaining({ scheduledStartAt: start }),
    }));
    expect(tx.emailOutbox.create).toHaveBeenCalledOnce();
    expect(tx.notification.create).toHaveBeenCalledOnce();
    expect(tx.appointment.findUnique).toHaveBeenCalledOnce();
    expect(prisma.$transaction).toHaveBeenCalledWith(
      expect.any(Function),
      { isolationLevel: 'Serializable' },
    );
  });

  it('rejects appointments that are no longer future confirmed bookings', async () => {
    appointment.status = 'COMPLETED';
    const start = new Date();
    start.setDate(start.getDate() + 3);

    await expect(reschedule('customer-id', appointment.id, start.toISOString()))
      .rejects.toMatchObject({ code: 'APPOINTMENT_NOT_MODIFIABLE' });
    expect(tx.appointment.updateMany).not.toHaveBeenCalled();
    expect(tx.emailOutbox.create).not.toHaveBeenCalled();
  });
});
