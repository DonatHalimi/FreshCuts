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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const response = error?.response;
    const config = error?.config;

    if (
      response?.status === 401 &&
      response.data?.code === 'TOKEN_EXPIRED' &&
      config &&
      !config._retry
    ) {
      config._retry = true;
      refreshPromise ??= api.post('/auth/refresh').finally(() => {
        refreshPromise = null;
      });

      try {
        await refreshPromise;
        return api(config);
      } catch {
        onSessionExpired();
      }
    }

    return Promise.reject(normalizeError(error));
  },
);