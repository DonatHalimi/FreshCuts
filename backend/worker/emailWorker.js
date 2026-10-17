import prisma from '../src/database/prisma.js';
import logger from '../src/config/logger.js';
import { sendMail, sendTemplateEmail } from '../src/shared/mail/mailer.js';
import { appointmentEmail } from '../src/templates/email/appointmentEmail.js';

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
        const message = appointmentEmail(job.type, job.payload);
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
