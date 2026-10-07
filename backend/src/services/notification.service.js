import prisma from '../../database/prisma.js';
import { queueNotification } from './outbox.service.js';

export async function notifyAppointmentConfirmed({ userId, appointmentId, serviceName, providerName }) {
  return queueNotification(userId, {
    type: 'APPOINTMENT_CONFIRMED',
    title: 'Appointment confirmed',
    message: `${serviceName} with ${providerName} is confirmed.`,
    link: `/account/appointments/${appointmentId}`,
    metadata: { appointmentId },
  });
}

export function listForUser(userId) {
  return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
}

export function markRead(userId, id) {
  return prisma.notification.updateMany({ where: { id, userId }, data: { readAt: new Date() } });
}
