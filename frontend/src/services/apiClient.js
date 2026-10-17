import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

let refreshPromise = null;
let onSessionExpired = () => { };

export function configureSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}

function normalizeError(error) {
  const response = error?.response;
  return {
    status: response?.status,
    code: response?.data?.code,
    message: response?.data?.message ?? 'Network error. Please try again.',
    errors: response?.data?.errors ?? [],
  };
}

function isRefreshableAccessError(response, config) {
  if (response?.status !== 401 || !config || config._retry) return false;
  if (!['ACCESS_TOKEN_EXPIRED', 'ACCESS_TOKEN_MISSING'].includes(response.data?.code)) return false;

  const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
  return !/\/auth(?:\/|$)/i.test(url);
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const response = error?.response;
    const config = error?.config;

    if (isRefreshableAccessError(response, config)) {
      config._retry = true;
      refreshPromise ??= api.post('/auth/refresh').finally(() => {
        refreshPromise = null;
      });

      try {
        await refreshPromise;
      } catch (refreshError) {
        if (
          refreshError?.status === 401
          && refreshError.code === 'REFRESH_INVALID'
        ) {
          onSessionExpired();
        }
        return Promise.reject(refreshError);
      }
      return api(config);
    }

    return Promise.reject(normalizeError(error));
  },
);