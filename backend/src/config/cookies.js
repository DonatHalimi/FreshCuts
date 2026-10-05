import env from './env.js';

const base = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'lax',
};

export const ACCESS_COOKIE = {
  ...base,
  path: '/',
};

export const REFRESH_COOKIE = {
  ...base,
  path: '/api/v1/auth',
};

export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie('fc_access', accessToken, {
    ...ACCESS_COOKIE,
    maxAge: env.accessTtlMs,
  });
  res.cookie('fc_refresh', refreshToken, {
    ...REFRESH_COOKIE,
    maxAge: env.refreshTtlMs,
  });
}

export function clearAuthCookies(res) {
  res.clearCookie('fc_access', ACCESS_COOKIE);
  res.clearCookie('fc_refresh', REFRESH_COOKIE);
}