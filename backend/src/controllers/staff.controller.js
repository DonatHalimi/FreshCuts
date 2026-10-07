import prisma from '../../database/prisma.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError } from '../../utils/AppError.js';

async function getProviderForUser(userId) {
  const provider = await prisma.provider.findUnique({ where: { userId } });
  if (!provider) throw new AppError(404, 'PROVIDER_NOT_FOUND', 'No provider profile is linked to this staff account');
  return provider;
}

export async function me(req, res) {
  const provider = await getProviderForUser(req.auth.userId);
  return sendSuccess(res, 200, provider);
}

export async function roster(req, res) {
  const provider = await getProviderForUser(req.auth.userId);
  const date = new Date(req.query.date);
  if (Number.isNaN(date.getTime())) throw new AppError(422, 'VALIDATION_ERROR', 'Invalid roster date');
  const next = new Date(date.getTime() + 24 * 60 * 60 * 1000);

  const rows = await prisma.appointment.findMany({
    where: { providerId: provider.id, scheduledStartAt: { gte: date, lt: next } },
    select: {
      id: true,
      scheduledStartAt: true,
      scheduledEndAt: true,
      status: true,
      serviceNameSnapshot: true,
      priceCentsSnapshot: true,
      customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
    },
    orderBy: { scheduledStartAt: 'asc' },
  });

  return sendSuccess(res, 200, rows);
}

export async function updateStatus(req, res) {
  const provider = await getProviderForUser(req.auth.userId);
  const allowed = ['CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
  if (!allowed.includes(req.body.status)) throw new AppError(422, 'VALIDATION_ERROR', 'Invalid appointment status');
  const updated = await prisma.appointment.updateMany({
    where: { id: req.params.id, providerId: provider.id },
    data: { status: req.body.status },
  });
  if (!updated.count) throw new AppError(404, 'APPOINTMENT_NOT_FOUND', 'Appointment not found');
  return sendSuccess(res, 200, { updated: true });
}
