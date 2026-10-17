import prisma from '../database/prisma.js';
import env from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { resolveSchedule } from '../utils/scheduleResolver.js';
import { generateSlots } from '../utils/slotGenerator.js';
import { ACTIVE_APPOINTMENT_STATUSES } from '../shared/constants/appointmentStatus.js';

export async function getAvailableSlots({ providerId, serviceId, date }) {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const nextDay = new Date(target.getTime() + 24 * 60 * 60 * 1000);
  const localDate = [
    target.getFullYear(),
    String(target.getMonth() + 1).padStart(2, '0'),
    String(target.getDate()).padStart(2, '0'),
  ].join('-');

  const [provider, service, appointments, timeOff] = await Promise.all([
    prisma.provider.findFirst({
      where: { id: providerId, isActive: true },
      include: { workingHours: true, breaks: true },
    }),
    prisma.providerService.findUnique({
      where: { providerId_serviceId: { providerId, serviceId } },
      include: { service: true },
    }),
    prisma.appointment.findMany({
      where: {
        providerId,
        status: { in: ACTIVE_APPOINTMENT_STATUSES },
        blockStartAt: { lt: nextDay },
        blockEndAt: { gt: target },
      },
      select: { blockStartAt: true, blockEndAt: true },
    }),
    prisma.timeOff.findMany({
      where: { providerId, startAt: { lt: nextDay }, endAt: { gt: target } },
      select: { startAt: true, endAt: true },
    }),
  ]);

  if (!provider) throw new AppError(404, 'PROVIDER_NOT_FOUND', 'Provider not found');
  if (!service) throw new AppError(404, 'SERVICE_UNAVAILABLE', 'This provider does not offer the selected service');

  const ranges = resolveSchedule({ date: target, workingHours: provider.workingHours, breaks: provider.breaks, timeOff });
  const slots = generateSlots({
    ranges,
    durationMin: service.service.durationMin,
    bufferBeforeMin: service.service.bufferBeforeMin,
    bufferAfterMin: service.service.bufferAfterMin,
    intervalMin: env.slotIntervalMinutes,
    existing: appointments,
  });

  return {
    providerId,
    serviceId,
    date: localDate,
    timezone: env.shopTimezone,
    durationMin: service.service.durationMin,
    priceCents: service.priceCents ?? service.service.priceCents,
    slots,
  };
}
