import { escapeHtml } from '../../utils/escapeHtml.js';

export function verifyEmail({ firstName, url, ttlHours }) {
  const safeName = escapeHtml(firstName);
  const safeUrl = escapeHtml(url);

  return {
    subject: 'Verify your FreshCuts account',
    text: `Hi ${firstName}, confirm your FreshCuts account: ${url}\nThis link expires in ${ttlHours} hours.`,
    html: `
<!doctype html>
<html lang="en">
  <body style="margin:0;background:#111211;padding:32px 0;font-family:Arial,sans-serif;color:#F2F1EC">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" role="presentation" style="background:#191B19;border:1px solid #303530;border-radius:14px">
            <tr>
              <td style="padding:32px">
                <div style="font-size:24px;font-weight:700;color:#C1D0A5">FreshCuts</div>
                <h1 style="margin:18px 0 12px;font-size:24px">Verify your email</h1>
                <p style="margin:0 0 24px;color:#A7AAA2;line-height:1.6">Hi ${safeName}, confirm your email address to activate your FreshCuts account.</p>
                <a href="${safeUrl}" style="display:inline-block;background:#A3B18A;color:#111211;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Verify email</a>
                <p style="margin:24px 0 0;font-size:12px;color:#A7AAA2;line-height:1.6">This link expires in ${ttlHours} hours. If you did not create this account, you can safely ignore this email.</p>
                <p style="margin:12px 0 0;font-size:12px;color:#A7AAA2;word-break:break-all">${safeUrl}</p>
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