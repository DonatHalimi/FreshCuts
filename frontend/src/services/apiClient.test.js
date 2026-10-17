import { afterEach, describe, expect, it, vi } from 'vitest';
import { setTimeout as delay } from 'node:timers/promises';
import { api, configureSessionExpiredHandler } from './apiClient.js';

function response(config, status = 200, data = { success: true }) {
  return { config, data, headers: {}, status, statusText: 'OK' };
}

function unauthorized(config, code) {
  return Object.assign(new Error('Unauthorized'), {
    config,
    response: { config, status: 401, data: { code, message: code } },
  });
}

describe('API session refresh interceptor', () => {
  let originalAdapter;

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
    configureSessionExpiredHandler(() => {});
  });

  it.each(['ACCESS_TOKEN_MISSING', 'ACCESS_TOKEN_EXPIRED'])(
    'refreshes when access credentials are %s and retries once',
    async (code) => {
      originalAdapter = api.defaults.adapter;
      const attempts = new Map();
      let refreshCalls = 0;

      api.defaults.adapter = async (config) => {
        if (config.url === '/auth/refresh') {
          refreshCalls += 1;
          return response(config);
        }
        const count = (attempts.get(config.url) ?? 0) + 1;
        attempts.set(config.url, count);
        if (count === 1) throw unauthorized(config, code);
        return response(config);
      };

      await expect(api.get('/appointments')).resolves.toMatchObject({ status: 200 });
      expect(refreshCalls).toBe(1);
      expect(attempts.get('/appointments')).toBe(2);
    },
  );

  it('shares one refresh request across simultaneous API failures', async () => {
    originalAdapter = api.defaults.adapter;
    const attempts = new Map();
    let refreshCalls = 0;
    api.defaults.adapter = async (config) => {
      if (config.url === '/auth/refresh') {
        refreshCalls += 1;
        await delay(10);
        return response(config);
      }
      const count = (attempts.get(config.url) ?? 0) + 1;
      attempts.set(config.url, count);
      if (count === 1) throw unauthorized(config, 'ACCESS_TOKEN_EXPIRED');
      return response(config);
    };

    await expect(Promise.all([
      api.get('/appointments'),
      api.get('/profile'),
    ])).resolves.toHaveLength(2);
    expect(refreshCalls).toBe(1);
  });

  it('expires the session only when the refresh token is definitively invalid', async () => {
    originalAdapter = api.defaults.adapter;
    const onExpired = vi.fn();
    configureSessionExpiredHandler(onExpired);
    api.defaults.adapter = async (config) => {
      if (config.url === '/auth/refresh') {
        throw Object.assign(new Error('Refresh rejected'), {
          config,
          response: { config, status: 401, data: { code: 'REFRESH_INVALID' } },
        });
      }
      throw unauthorized(config, 'ACCESS_TOKEN_EXPIRED');
    };

    await expect(api.get('/appointments')).rejects.toMatchObject({ code: 'REFRESH_INVALID' });
    expect(onExpired).toHaveBeenCalledOnce();
  });

  it('preserves session state when refresh fails because of a server error', async () => {
    originalAdapter = api.defaults.adapter;
    const onExpired = vi.fn();
    configureSessionExpiredHandler(onExpired);
    api.defaults.adapter = async (config) => {
      if (config.url === '/auth/refresh') {
        throw Object.assign(new Error('Server unavailable'), {
          config,
          response: { config, status: 503, data: { code: 'INTERNAL_ERROR' } },
        });
      }
      throw unauthorized(config, 'ACCESS_TOKEN_EXPIRED');
    };

    await expect(api.get('/appointments')).rejects.toMatchObject({ status: 503 });
    expect(onExpired).not.toHaveBeenCalled();
  });
});
