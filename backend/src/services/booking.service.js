import crypto from 'node:crypto';
import prisma from '../database/prisma.js';
import { AppError } from '../utils/AppError.js';
import { addMinutes } from '../shared/utils/dates.js';
import { withSerializableRetry } from '../database/transaction.js';
import { ACTIVE_APPOINTMENT_STATUSES } from '../shared/constants/appointmentStatus.js';
import { resolveSchedule } from '../utils/scheduleResolver.js';
import { overlaps } from '../utils/timeRange.js';

function getBlock(startAt, service) {
  const blockStart = addMinutes(startAt, -service.bufferBeforeMin);
  const serviceEnd = addMinutes(startAt, service.durationMin);
  const blockEnd = addMinutes(serviceEnd, service.bufferAfterMin);
  return { serviceEnd, blockStart, blockEnd };
}

async function loadBookingData(tx, customerId, providerId, serviceId) {
  const [provider, relation] = await Promise.all([
    tx.provider.findFirst({ where: { id: providerId, isActive: true }, select: { id: true, name: true } }),
    tx.providerService.findUnique({
      where: { providerId_serviceId: { providerId, serviceId } },
      include: { service: true },
    }),
  ]);
  if (!provider) throw new AppError(404, 'PROVIDER_NOT_FOUND', 'Provider not found');
  if (!relation) throw new AppError(404, 'SERVICE_UNAVAILABLE', 'This provider does not offer the selected service');

  const customer = await tx.user.findUnique({ where: { id: customerId }, select: { id: true, email: true, firstName: true } });
  if (!customer) throw new AppError(401, 'UNAUTHENTICATED', 'Authentication required');

  return { provider, customer, service: relation.service, priceCents: relation.priceCents ?? relation.service.priceCents };
}

export async function create({ customerId, providerId, serviceId, startAt, notes = '', clientRequestId }) {
  const normalizedStart = new Date(startAt);
  if (!Number.isFinite(normalizedStart.getTime())) {
    throw new AppError(422, 'VALIDATION_ERROR', 'A valid appointment start time is required');
  }
  if (normalizedStart <= new Date()) throw new AppError(422, 'PAST_APPOINTMENT', 'Appointments must be in the future');

  const requestId = clientRequestId?.trim() || crypto.randomUUID();
  if (requestId.length > 100) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Idempotency key must be 100 characters or fewer');
  }

  return withSerializableRetry(() => prisma.$transaction(async (tx) => {
    const idempotentAppointment = await tx.appointment.findFirst({ where: { customerId, clientRequestId: requestId } });
    if (idempotentAppointment) {
      const sameRequest =
        idempotentAppointment.providerId === providerId &&
        idempotentAppointment.serviceId === serviceId &&
        idempotentAppointment.scheduledStartAt.getTime() === normalizedStart.getTime() &&
        idempotentAppointment.notes === notes;
      if (!sameRequest) {
        throw new AppError(409, 'IDEMPOTENCY_KEY_REUSED', 'This booking request key was already used for different booking details');
      }
      return idempotentAppointment;
    }

    const { provider, customer, service, priceCents } = await loadBookingData(tx, customerId, providerId, serviceId);
    const { serviceEnd, blockStart, blockEnd } = getBlock(normalizedStart, service);

    const dayStart = new Date(normalizedStart); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const [timeOff, conflictingAppointments] = await Promise.all([
      tx.timeOff.findMany({ where: { providerId, startAt: { lt: dayEnd }, endAt: { gt: dayStart } }, select: { startAt: true, endAt: true } }),
      tx.appointment.findMany({ where: { providerId, status: { in: ACTIVE_APPOINTMENT_STATUSES }, blockStartAt: { lt: blockEnd }, blockEndAt: { gt: blockStart } }, select: { blockStartAt: true, blockEndAt: true } }),
    ]);
    const ranges = resolveSchedule({ date: dayStart, workingHours: await tx.workingHour.findMany({ where: { providerId } }), breaks: await tx.scheduleBreak.findMany({ where: { providerId } }), timeOff });
    if (!ranges.some((range) => blockStart >= range.start && blockEnd <= range.end)) {
      throw new AppError(409, 'SLOT_UNAVAILABLE', 'The selected appointment time is outside the provider availability');
    }
    if (conflictingAppointments.some((item) => overlaps(blockStart, blockEnd, item.blockStartAt, item.blockEndAt))) {
      throw new AppError(409, 'SLOT_UNAVAILABLE', 'The selected appointment time is no longer available');
    }
    const appointment = await tx.appointment.create({
      data: {
        customerId,
        providerId,
        serviceId,
        scheduledStartAt: normalizedStart,
        scheduledEndAt: serviceEnd,
        blockStartAt: blockStart,
        blockEndAt: blockEnd,
        serviceNameSnapshot: service.name,
        durationMinSnapshot: service.durationMin,
        priceCentsSnapshot: priceCents,
        bufferBeforeMinSnapshot: service.bufferBeforeMin,
        bufferAfterMinSnapshot: service.bufferAfterMin,
        notes,
        clientRequestId: requestId,
      },
      include: { provider: { select: { name: true } } },
    });

    await tx.emailOutbox.create({
      data: {
        type: 'APPOINTMENT_CONFIRMED',
        toEmail: customer.email,
        payload: {
          firstName: customer.firstName,
          providerName: provider.name,
          serviceName: service.name,
          startAt: appointment.scheduledStartAt.toISOString(),
          endAt: appointment.scheduledEndAt.toISOString(),
          priceCents,
        },
      },
    });

    await tx.notification.create({
      data: {
        userId: customer.id,
        type: 'APPOINTMENT_CONFIRMED',
        title: 'Appointment confirmed',
        message: `${service.name} with ${provider.name} is confirmed.`,
        link: `/account/appointments/${appointment.id}`,
        metadata: { appointmentId: appointment.id },
      },
    });

    return appointment;
  }, { isolationLevel: 'Serializable' }));
}
