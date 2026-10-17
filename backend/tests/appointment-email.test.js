import { describe, expect, it } from 'vitest';
import { appointmentEmail } from '../src/templates/email/appointmentEmail.js';

describe('appointment email template', () => {
  it('renders a confirmed appointment in the FreshCuts email layout', () => {
    const message = appointmentEmail('APPOINTMENT_CONFIRMED', {
      firstName: 'Donat',
      providerName: 'Ardit Krasniqi',
      serviceName: 'Beard Trim',
      startAt: '2026-10-19T09:30:00.000Z',
    });

    expect(message.subject).toBe('Your FreshCuts appointment is confirmed');
    expect(message.text).toContain('Your Beard Trim appointment with Ardit Krasniqi is confirmed.');
    expect(message.html).toContain('background:#111211');
    expect(message.html).toContain('Appointment confirmed');
    expect(message.html).toContain('<strong>Beard Trim</strong>');
    expect(message.html).toContain('<strong>Ardit Krasniqi</strong>');
    expect(message.html).toContain('FreshCuts');
  });

  it('escapes names and service data before inserting it into HTML', () => {
    const message = appointmentEmail('APPOINTMENT_CONFIRMED', {
      firstName: '<script>alert(1)</script>',
      providerName: 'Ardit <Barber>',
      serviceName: '<b>Beard Trim</b>',
      startAt: '2026-10-19T09:30:00.000Z',
    });

    expect(message.html).not.toContain('<script>');
    expect(message.html).not.toContain('<b>Beard Trim</b>');
    expect(message.html).toContain('&lt;script&gt;');
    expect(message.html).toContain('&lt;b&gt;Beard Trim&lt;/b&gt;');
  });
});
