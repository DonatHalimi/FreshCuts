import * as service from '../services/appointment.service.js';
import { create as createBooking } from '../services/booking.service.js';
import { sendSuccess } from '../utils/response.js';

export async function create(req, res) {
  const appointment = await createBooking({
    customerId: req.auth.userId,
    providerId: req.body.providerId,
    serviceId: req.body.serviceId,
    startAt: req.body.startAt,
    notes: req.body.notes,
    clientRequestId: req.validatedHeaders['Idempotency-Key'],
  });
  return sendSuccess(res, 201, appointment);
}

export async function list(req, res) {
  return sendSuccess(res, 200, await service.listForCustomer(req.auth.userId, req.validatedQuery.status));
}

export async function get(req, res) {
  return sendSuccess(res, 200, await service.getForCustomer(req.auth.userId, req.params.id));
}

export async function cancel(req, res) {
  return sendSuccess(res, 200, await service.cancel(req.auth.userId, req.params.id, req.body.reason));
}

export async function reschedule(req, res) {
  return sendSuccess(res, 200, await service.reschedule(req.auth.userId, req.params.id, req.body.startAt));
}
