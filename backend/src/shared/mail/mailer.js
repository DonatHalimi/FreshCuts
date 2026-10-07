import nodemailer from 'nodemailer';
import env from '../../config/env.js';
import logger from '../../config/logger.js';
import { verifyEmail } from '../../templates/email/verifyEmail.js';
import { resetPasswordEmail } from './templates/resetPassword.js';

let transporterPromise;

async function getTransporter() {
  if (transporterPromise) return transporterPromise;
  transporterPromise = (async () => {
    if (!env.smtpHost) {
      if (env.nodeEnv === 'development') {
        const account = await nodemailer.createTestAccount();
        return nodemailer.createTransport({ host: account.smtp.host, port: account.smtp.port, secure: account.smtp.secure, auth: { user: account.user, pass: account.pass } });
      }
      throw new Error('SMTP configuration is required outside development');
    }

    return nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
    });
  })();
  return transporterPromise;
}

export async function sendMail(message) {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({ from: env.mailFrom, ...message });
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) logger.info({ previewUrl }, 'Development email preview');
  return info;
}

export async function sendTemplateEmail(type, to, payload) {
  const templates = {
    EMAIL_VERIFICATION: verifyEmail,
    PASSWORD_RESET: resetPasswordEmail,
  };
  const template = templates[type];
  if (!template) throw new Error(`Unsupported email template: ${type}`);
  const content = template(payload);
  return sendMail({ to, subject: content.subject, text: content.text, html: content.html });
}
