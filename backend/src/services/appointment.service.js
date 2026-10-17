import prisma from '../database/prisma.js';
import { AppError } from '../utils/AppError.js';
import { addMinutes } from '../shared/utils/dates.js';
import { withSerializableRetry } from '../database/transaction.js';
import { resolveSchedule } from '../utils/scheduleResolver.js';
import { ACTIVE_APPOINTMENT_STATUSES } from '../shared/constants/appointmentStatus.js';

const listSelect = {
  id: true, serviceId: true, scheduledStartAt: true, scheduledEndAt: true, priceCentsSnapshot: true,
  serviceNameSnapshot: true, durationMinSnapshot: true, status: true, notes: true, createdAt: true,
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
  return withSerializableRetry(() => prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findFirst({
      where: { id, customerId },
      include: { provider: true, service: true, customer: true },
    });
    if (!appointment) throw new AppError(404, 'APPOINTMENT_NOT_FOUND', 'Appointment not found');

    const now = new Date();
    if (appointment.status !== 'CONFIRMED' || appointment.scheduledStartAt <= now) {
      throw new AppError(409, 'APPOINTMENT_NOT_MODIFIABLE', 'Only future confirmed appointments can be cancelled');
    }

    const changed = await tx.appointment.updateMany({
      where: {
        id,
        customerId,
        status: 'CONFIRMED',
        scheduledStartAt: { gt: now },
      },
      data: { status: 'CANCELLED', cancellationReason: reason || null },
    });
    if (!changed.count) {
      throw new AppError(409, 'APPOINTMENT_NOT_MODIFIABLE', 'This appointment can no longer be cancelled');
    }

    await tx.emailOutbox.create({
      data: {
        type: 'APPOINTMENT_CANCELLED',
        toEmail: appointment.customer.email,
        payload: {
          firstName: appointment.customer.firstName,
          providerName: appointment.provider.name,
          serviceName: appointment.serviceNameSnapshot,
          startAt: appointment.scheduledStartAt.toISOString(),
        },
      },
    });
    await tx.notification.create({
      data: {
        userId: customerId,
        type: 'APPOINTMENT_CANCELLED',
        title: 'Appointment cancelled',
        message: `${appointment.serviceNameSnapshot} with ${appointment.provider.name} was cancelled.`,
        link: `/account/appointments/${id}`,
        metadata: { appointmentId: id },
      },
    });
    return tx.appointment.findUnique({ where: { id }, select: listSelect });
  }, { isolationLevel: 'Serializable' }));
}

export async function reschedule(customerId, id, startAt) {
  const start = new Date(startAt);
  if (start <= new Date()) throw new AppError(422, 'PAST_APPOINTMENT', 'Appointments must be in the future');

  return withSerializableRetry(() => prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findFirst({ where: { id, customerId }, include: { service: true, provider: true, customer: true } });
    if (!appointment) throw new AppError(404, 'APPOINTMENT_NOT_FOUND', 'Appointment not found');
    const now = new Date();
    if (appointment.status !== 'CONFIRMED' || appointment.scheduledStartAt <= now) {
      throw new AppError(409, 'APPOINTMENT_NOT_MODIFIABLE', 'Only future confirmed appointments can be rescheduled');
    }

    const blockStart = addMinutes(start, -appointment.bufferBeforeMinSnapshot);
    const serviceEnd = addMinutes(start, appointment.durationMinSnapshot);
    const blockEnd = addMinutes(serviceEnd, appointment.bufferAfterMinSnapshot);

    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const [workingHours, breaks, timeOff] = await Promise.all([
      tx.workingHour.findMany({ where: { providerId: appointment.providerId } }),
      tx.scheduleBreak.findMany({ where: { providerId: appointment.providerId } }),
      tx.timeOff.findMany({
        where: {
          providerId: appointment.providerId,
          startAt: { lt: dayEnd },
          endAt: { gt: dayStart },
        },
      }),
    ]);
    const ranges = resolveSchedule({ date: dayStart, workingHours, breaks, timeOff });
    if (!ranges.some((range) => blockStart >= range.start && blockEnd <= range.end)) {
      throw new AppError(409, 'SLOT_UNAVAILABLE', 'The selected appointment time is outside the provider availability');
    }

    const conflict = await tx.appointment.findFirst({
      where: {
        providerId: appointment.providerId,
        id: { not: id },
        status: { in: ACTIVE_APPOINTMENT_STATUSES },
        blockStartAt: { lt: blockEnd },
        blockEndAt: { gt: blockStart },
      },
      select: { id: true },
    });
    if (conflict) throw new AppError(409, 'SLOT_UNAVAILABLE', 'The selected appointment time is no longer available');

    const changed = await tx.appointment.updateMany({
      where: {
        id,
        customerId,
        status: 'CONFIRMED',
        scheduledStartAt: { gt: now },
      },
      data: { scheduledStartAt: start, scheduledEndAt: serviceEnd, blockStartAt: blockStart, blockEndAt: blockEnd },
    });
    if (!changed.count) {
      throw new AppError(409, 'APPOINTMENT_NOT_MODIFIABLE', 'This appointment can no longer be rescheduled');
    }

    await tx.emailOutbox.create({
      data: {
        type: 'APPOINTMENT_UPDATED',
        toEmail: appointment.customer.email,
        payload: {
          firstName: appointment.customer.firstName,
          providerName: appointment.provider.name,
          serviceName: appointment.serviceNameSnapshot,
          startAt: start.toISOString(),
          endAt: serviceEnd.toISOString(),
        },
      },
    });

    await tx.notification.create({
      data: {
        userId: customerId,
        type: 'APPOINTMENT_UPDATED',
        title: 'Appointment rescheduled',
        message: `${appointment.serviceNameSnapshot} with ${appointment.provider.name} was rescheduled.`,
        link: `/account/appointments/${id}`,
        metadata: { appointmentId: id },
      },
    });

    return tx.appointment.findUnique({ where: { id }, select: listSelect });
  }, { isolationLevel: 'Serializable' }));
}
