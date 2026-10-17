import prisma from '../database/prisma.js';

export function queueEmail(type, toEmail, payload) {
  return prisma.emailOutbox.create({ data: { type, toEmail, payload } });
}

export function queueNotification(userId, { type, title, message, link = null, metadata = null }) {
  return prisma.notification.create({
    data: { userId, type, title, message, link, metadata },
  });
}
