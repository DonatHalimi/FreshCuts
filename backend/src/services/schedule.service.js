import prisma from '../../database/prisma.js';
import { AppError } from '../../utils/AppError.js';

async function providerForUser(userId) {
  const provider = await prisma.provider.findUnique({ where: { userId } });
  if (!provider) throw new AppError(404, 'PROVIDER_NOT_FOUND', 'No provider profile is linked to this account');
  return provider;
}

function assertRange(startMin, endMin) {
  if (!Number.isInteger(startMin) || !Number.isInteger(endMin) || startMin < 0 || endMin > 1440 || startMin >= endMin) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Invalid schedule range');
  }
}

export async function getSchedule(userId) {
  const provider = await providerForUser(userId);
  const [workingHours, breaks, timeOff] = await Promise.all([
    prisma.workingHour.findMany({ where: { providerId: provider.id }, orderBy: [{ dayOfWeek: 'asc' }, { startMin: 'asc' }] }),
    prisma.scheduleBreak.findMany({ where: { providerId: provider.id }, orderBy: [{ dayOfWeek: 'asc' }, { startMin: 'asc' }] }),
    prisma.timeOff.findMany({ where: { providerId: provider.id, endAt: { gte: new Date() } }, orderBy: { startAt: 'asc' }, take: 100 }),
  ]);
  return { workingHours, breaks, timeOff };
}

export async function replaceWorkingHours(userId, entries) {
  const provider = await providerForUser(userId);
  for (const entry of entries) { if (entry.dayOfWeek < 1 || entry.dayOfWeek > 7) throw new AppError(422, 'VALIDATION_ERROR', 'dayOfWeek must be 1-7'); assertRange(entry.startMin, entry.endMin); }
  await prisma.$transaction(async (tx) => {
    await tx.workingHour.deleteMany({ where: { providerId: provider.id } });
    if (entries.length) await tx.workingHour.createMany({ data: entries.map((x) => ({ providerId: provider.id, ...x })) });
  });
  return getSchedule(userId);
}

export async function replaceBreaks(userId, entries) {
  const provider = await providerForUser(userId);
  for (const entry of entries) { if (entry.dayOfWeek < 1 || entry.dayOfWeek > 7) throw new AppError(422, 'VALIDATION_ERROR', 'dayOfWeek must be 1-7'); assertRange(entry.startMin, entry.endMin); }
  await prisma.$transaction(async (tx) => {
    await tx.scheduleBreak.deleteMany({ where: { providerId: provider.id } });
    if (entries.length) await tx.scheduleBreak.createMany({ data: entries.map((x) => ({ providerId: provider.id, ...x })) });
  });
  return getSchedule(userId);
}

export async function createTimeOff(userId, input) {
  const provider = await providerForUser(userId);
  const startAt = new Date(input.startAt); const endAt = new Date(input.endAt);
  if (!(startAt < endAt)) throw new AppError(422, 'VALIDATION_ERROR', 'Time-off start must be before end');
  return prisma.timeOff.create({ data: { providerId: provider.id, startAt, endAt, reason: input.reason || null, createdById: userId } });
}

export async function deleteTimeOff(userId, id) {
  const provider = await providerForUser(userId);
  const result = await prisma.timeOff.deleteMany({ where: { id, providerId: provider.id } });
  if (!result.count) throw new AppError(404, 'TIME_OFF_NOT_FOUND', 'Time-off entry not found');
}
