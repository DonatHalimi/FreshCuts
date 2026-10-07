import prisma from '../../database/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { addMinutes } from '../../shared/utils/dates.js';
import { withSerializableRetry } from '../../database/transaction.js';

const listSelect = {
  id: true, scheduledStartAt: true, scheduledEndAt: true, priceCentsSnapshot: true,
  serviceNameSnapshot: true, status: true, notes: true,
  provider: { select: { id: true, name: true } },
};

export function listForCustomer(customerId, status) {
  return prisma.appointment.findMany({
    where: { customerId, ...(status ? { status } : {}) },
    select: listSelect,
    orderBy: { scheduledStartAt: 'asc' },
  });
}

export async function getForCustomer(customerId, id) {
  const appointment = await prisma.appointment.findFirst({ where: { id, customerId }, select: listSelect });
  if (!appointment) throw new AppError(404, 'APPOINTMENT_NOT_FOUND', 'Appointment not found');
  return appointment;
}

export async function cancel(customerId, id, reason = '') {
  const appointment = await prisma.appointment.findFirst({ where: { id, customerId } });
  if (!appointment) throw new AppError(404, 'APPOINTMENT_NOT_FOUND', 'Appointment not found');
  if (appointment.status !== 'CONFIRMED') throw new AppError(409, 'APPOINTMENT_NOT_MODIFIABLE', 'This appointment can no longer be cancelled');

  return prisma.$transaction(async (tx) => {
    const updated = await tx.appointment.update({
      where: { id },
      data: { status: 'CANCELLED', cancellationReason: reason || null },
      include: { provider: true, service: true, customer: true },
    });

    await tx.emailOutbox.create({
      data: {
        type: 'APPOINTMENT_CANCELLED',
        toEmail: updated.customer.email,
        payload: { firstName: updated.customer.firstName, providerName: updated.provider.name, serviceName: updated.service.name, startAt: updated.scheduledStartAt.toISOString() },
      },
    });
    await tx.notification.create({
      data: { userId: customerId, type: 'APPOINTMENT_CANCELLED', title: 'Appointment cancelled', message: `${updated.service.name} with ${updated.provider.name} was cancelled.`, metadata: { appointmentId: id } },
    });
    return updated;
  });
}

export async function reschedule(customerId, id, startAt) {
  const start = new Date(startAt);
  if (start <= new Date()) throw new AppError(422, 'PAST_APPOINTMENT', 'Appointments must be in the future');

  return withSerializableRetry(() => prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findFirst({ where: { id, customerId }, include: { service: true, provider: true, customer: true } });
    if (!appointment) throw new AppError(404, 'APPOINTMENT_NOT_FOUND', 'Appointment not found');
    if (appointment.status !== 'CONFIRMED') throw new AppError(409, 'APPOINTMENT_NOT_MODIFIABLE', 'This appointment can no longer be rescheduled');

    const blockStart = addMinutes(start, -appointment.bufferBeforeMinSnapshot);
    const serviceEnd = addMinutes(start, appointment.durationMinSnapshot);
    const blockEnd = addMinutes(serviceEnd, appointment.bufferAfterMinSnapshot);

    const conflict = await tx.appointment.findFirst({
      where: {
        providerId: appointment.providerId,
        id: { not: id },
        status: { in: ['CONFIRMED', 'COMPLETED', 'NO_SHOW'] },
        blockStartAt: { lt: blockEnd },
        blockEndAt: { gt: blockStart },
      },
      select: { id: true },
    });
    if (conflict) throw new AppError(409, 'SLOT_UNAVAILABLE', 'The selected appointment time is no longer available');

    const updated = await tx.appointment.update({
      where: { id },
      data: { scheduledStartAt: start, scheduledEndAt: serviceEnd, blockStartAt: blockStart, blockEndAt: blockEnd },
    });

    await tx.emailOutbox.create({
      data: { type: 'APPOINTMENT_UPDATED', toEmail: appointment.customer.email, payload: { firstName: appointment.customer.firstName, providerName: appointment.provider.name, serviceName: appointment.service.name, startAt: start.toISOString(), endAt: serviceEnd.toISOString() } },
    });

    return updated;
  }, { isolationLevel: 'Serializable' }));
}
