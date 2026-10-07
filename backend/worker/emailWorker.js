import prisma from '../database/prisma.js';
import logger from '../config/logger.js';
import { sendMail, sendTemplateEmail } from '../shared/mail/mailer.js';

const APPOINTMENT_TEMPLATES = {
  APPOINTMENT_CONFIRMED: ({ firstName, providerName, serviceName, startAt }) => ({
    subject: 'Your FreshCuts appointment is confirmed',
    text: `Hi ${firstName}, your ${serviceName} appointment with ${providerName} is confirmed for ${new Date(startAt).toLocaleString()}.`,
    html: `<p>Hi ${firstName},</p><p>Your <strong>${serviceName}</strong> appointment with <strong>${providerName}</strong> is confirmed.</p><p>${new Date(startAt).toLocaleString()}</p>`,
  }),
  APPOINTMENT_UPDATED: ({ firstName, providerName, serviceName, startAt }) => ({
    subject: 'Your FreshCuts appointment was updated',
    text: `Hi ${firstName}, your ${serviceName} appointment with ${providerName} is now scheduled for ${new Date(startAt).toLocaleString()}.`,
    html: `<p>Hi ${firstName},</p><p>Your appointment was updated to <strong>${new Date(startAt).toLocaleString()}</strong>.</p>`,
  }),
  APPOINTMENT_CANCELLED: ({ firstName, providerName, serviceName, startAt }) => ({
    subject: 'Your FreshCuts appointment was cancelled',
    text: `Hi ${firstName}, your ${serviceName} appointment with ${providerName} on ${new Date(startAt).toLocaleString()} was cancelled.`,
    html: `<p>Hi ${firstName},</p><p>Your appointment was cancelled.</p>`,
  }),
};

function buildAppointmentMail(type, payload) {
  const builder = APPOINTMENT_TEMPLATES[type];
  if (!builder) throw new Error(`Unsupported outbox type: ${type}`);
  return builder(payload);
}

export async function processEmails(limit = 20) {
  const jobs = await prisma.emailOutbox.findMany({
    where: { status: { in: ['PENDING', 'FAILED'] }, nextAttemptAt: { lte: new Date() } },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });

  for (const job of jobs) {
    try {
      await prisma.emailOutbox.update({ where: { id: job.id }, data: { status: 'PROCESSING', lockedAt: new Date(), attempts: { increment: 1 } } });
      if (job.type === 'EMAIL_VERIFICATION' || job.type === 'PASSWORD_RESET') {
        await sendTemplateEmail(job.type, job.toEmail, job.payload);
      } else {
        const message = buildAppointmentMail(job.type, job.payload);
        await sendMail({ to: job.toEmail, ...message });
      }
      await prisma.emailOutbox.update({ where: { id: job.id }, data: { status: 'SENT', sentAt: new Date(), lockedAt: null } });
    } catch (error) {
      const nextAttemptAt = new Date(Date.now() + Math.min(60 * 60_000, 2 ** job.attempts * 30_000));
      await prisma.emailOutbox.update({ where: { id: job.id }, data: { status: 'FAILED', nextAttemptAt, lastError: String(error.message).slice(0, 2000), lockedAt: null } });
      logger.error({ err: error, outboxId: job.id }, 'Email delivery failed');
    }
  }
}
