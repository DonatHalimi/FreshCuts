import env from '../../config/env.js';
import { escapeHtml } from '../../utils/escapeHtml.js';

function formatAppointmentDate(value) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: env.shopTimezone,
  }).format(new Date(value));
}

export function appointmentEmail(type, { firstName, providerName, serviceName, startAt }) {
  const safeName = escapeHtml(firstName);
  const safeProvider = escapeHtml(providerName);
  const safeService = escapeHtml(serviceName);
  const date = formatAppointmentDate(startAt);
  const messages = {
    APPOINTMENT_CONFIRMED: {
      subject: 'Your FreshCuts appointment is confirmed',
      text: `Hi ${firstName},\n\nYour ${serviceName} appointment with ${providerName} is confirmed.\n\n${date}\n\nWe look forward to seeing you.\n\nFreshCuts`,
      heading: 'Appointment confirmed',
      description: `Your <strong>${safeService}</strong> appointment with <strong>${safeProvider}</strong> is confirmed.`,
      closing: 'We look forward to seeing you.',
    },
    APPOINTMENT_UPDATED: {
      subject: 'Your FreshCuts appointment was updated',
      text: `Hi ${firstName},\n\nYour ${serviceName} appointment with ${providerName} is now scheduled for ${date}.\n\nFreshCuts`,
      heading: 'Appointment updated',
      description: `Your <strong>${safeService}</strong> appointment with <strong>${safeProvider}</strong> has been rescheduled.`,
      closing: 'We look forward to seeing you.',
    },
    APPOINTMENT_CANCELLED: {
      subject: 'Your FreshCuts appointment was cancelled',
      text: `Hi ${firstName},\n\nYour ${serviceName} appointment with ${providerName} on ${date} was cancelled.\n\nFreshCuts`,
      heading: 'Appointment cancelled',
      description: `Your <strong>${safeService}</strong> appointment with <strong>${safeProvider}</strong> has been cancelled.`,
      closing: '',
    },
  };
  const content = messages[type];
  if (!content) throw new Error(`Unsupported appointment email type: ${type}`);

  return {
    subject: content.subject,
    text: content.text,
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#111211;padding:32px 0;font-family:Arial,sans-serif;color:#F2F1EC">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" role="presentation" style="background:#191B19;border:1px solid #303530;border-radius:14px">
            <tr>
              <td style="padding:32px">
                <div style="font-size:24px;font-weight:700;color:#C1D0A5">FreshCuts</div>
                <h1 style="margin:18px 0 12px;font-size:24px">${content.heading}</h1>
                <p style="margin:0 0 18px;color:#A7AAA2;line-height:1.6">Hi ${safeName},</p>
                <p style="margin:0 0 20px;color:#A7AAA2;line-height:1.6">${content.description}</p>
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#111211;border:1px solid #303530;border-radius:8px">
                  <tr>
                    <td style="padding:16px;color:#F2F1EC;font-size:15px;font-weight:700">${date}</td>
                  </tr>
                </table>
                ${content.closing ? `<p style="margin:20px 0 0;color:#A7AAA2;line-height:1.6">${content.closing}</p>` : ''}
                <p style="margin:24px 0 0;border-top:1px solid #303530;padding-top:16px;font-size:12px;color:#A7AAA2">FreshCuts</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}
