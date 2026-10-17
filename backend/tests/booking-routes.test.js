import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { signAccess } from '../src/auth/token.service.js';
import app from '../src/app.js';

describe('protected booking and operations routes', () => {
  it.each([
    '/api/v1/appointments',
    '/api/v1/staff/me',
    '/api/v1/admin/dashboard',
    '/api/v1/admin/appointments',
    '/api/v1/admin/providers',
    '/api/v1/admin/services',
    '/api/v1/admin/users',
    '/api/v1/notifications',
  ])('requires authentication for %s', async (path) => {
    const response = await request(app).get(path);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      code: 'ACCESS_TOKEN_MISSING',
    });
  });

  it('allows the idempotency header in cross-origin booking preflight requests', async () => {
    const response = await request(app)
      .options('/api/v1/appointments')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type,idempotency-key,x-requested-with');

    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(response.headers['access-control-allow-headers']).toContain('Idempotency-Key');
  });

  it.each([
    '/api/v1/staff/me',
    '/api/v1/admin/dashboard',
    '/api/v1/admin/appointments',
    '/api/v1/admin/providers',
    '/api/v1/admin/services',
  ])(
    'rejects a client account from %s',
    async (path) => {
      const token = signAccess({ id: 'client-id', role: 'CLIENT' });
      const response = await request(app)
        .get(path)
        .set('Cookie', `fc_access=${token}`);

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        success: false,
        code: 'FORBIDDEN',
      });
    },
  );

  it.each([
    ['/api/v1/admin/services', { name: 'New Service' }],
    ['/api/v1/admin/providers', { name: 'New Barber' }],
    ['/api/v1/admin/users', { email: 'invalid' }],
  ])('validates admin creation payloads for %s', async (path, body) => {
    const token = signAccess({ id: 'admin-id', role: 'ADMIN' });
    const response = await request(app)
      .post(path)
      .set('Cookie', `fc_access=${token}`)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send(body);

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({
      success: false,
      code: 'VALIDATION_ERROR',
    });
  });

  it.each([
    ['/api/v1/admin/appointments/bulk-delete', 'appointments'],
    ['/api/v1/admin/users/bulk-delete', 'users'],
    ['/api/v1/admin/services/bulk-delete', 'services'],
    ['/api/v1/admin/providers/bulk-delete', 'providers'],
  ])('validates bulk delete payloads for %s', async (path) => {
    const token = signAccess({ id: 'admin-id', role: 'ADMIN' });
    const response = await request(app)
      .delete(path)
      .set('Cookie', `fc_access=${token}`)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ ids: [] });

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({
      success: false,
      code: 'VALIDATION_ERROR',
    });
  });

  it('validates appointment ids before deleting an appointment', async () => {
    const token = signAccess({ id: 'admin-id', role: 'ADMIN' });
    const response = await request(app)
      .delete('/api/v1/admin/appointments/not-a-uuid')
      .set('Cookie', `fc_access=${token}`)
      .set('X-Requested-With', 'XMLHttpRequest');

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({
      success: false,
      code: 'VALIDATION_ERROR',
    });
  });
});
