import nodemailer from 'nodemailer';
import env from '../config/env.js';
import logger from '../config/logger.js';
import { verifyEmail } from '../templates/email/verifyEmail.js';

let transporterPromise;

async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    if (env.smtpHost) {
      return nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpSecure,
        auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
      });
    }

    if (env.nodeEnv === 'development') {
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    throw new Error('SMTP configuration is required outside development.');
  })();

  return transporterPromise;
}

export async function sendVerificationEmail({ firstName, email, url }) {
  const transporter = await getTransporter();
  const content = verifyEmail({
    firstName,
    url,
    ttlHours: env.emailVerifyTtlHours,
  });

  const info = await transporter.sendMail({
    from: env.mailFrom,
    to: email,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) logger.info({ previewUrl }, 'Development email preview');
}