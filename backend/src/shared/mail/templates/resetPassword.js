import { escapeHtml } from '../../../utils/escapeHtml.js';

export function resetPasswordEmail({ firstName, url, ttlMinutes }) {
  const safeName = escapeHtml(firstName);
  const safeUrl = escapeHtml(url);
  return {
    subject: 'Reset your FreshCuts password',
    text: `Hi ${firstName}, reset your FreshCuts password: ${url}\nThis link expires in ${ttlMinutes} minutes.`,
    html: `<table width="100%" cellpadding="0" cellspacing="0" style="background:#111211;padding:32px 0"><tr><td align="center"><table width="480" style="background:#191B19;border:1px solid #303530;border-radius:12px;font-family:Arial,sans-serif;color:#F2F1EC"><tr><td style="padding:32px"><h1 style="color:#C1D0A5">Reset your password</h1><p style="color:#A7AAA2">Hi ${safeName}, use the button below to choose a new password.</p><a href="${safeUrl}" style="display:inline-block;background:#A3B18A;color:#111211;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Reset password</a><p style="font-size:12px;color:#A7AAA2">This link expires in ${ttlMinutes} minutes. If you didn't request this, ignore this email.</p></td></tr></table></td></tr></table>`,
  };
}
