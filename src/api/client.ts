import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// VITE_API_URL may be the bare origin or already include /api/v1; accept both.
const API_ORIGIN = (import.meta.env.VITE_API_URL || 'https://api.sitesreports.com').replace(/\/+$/, '');
const BASE_URL = API_ORIGIN.endsWith('/api/v1') ? API_ORIGIN : `${API_ORIGIN}/api/v1`;

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const AUTH_PATHS = ['/auth/admin/login', '/auth/refresh', '/auth/logout'];

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// ─── Request: attach the access token ───────────────────────────────────────

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response: refresh once, share the result across concurrent requests ───

let refreshPromise: Promise<string> | null = null;

function clearSessionAndRedirect() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

function refreshAccessToken(): Promise<string> {
  // Only one refresh is in flight. Later 401s wait for it instead of
  // spending the same refresh token twice (which would look like theft).
  if (!refreshPromise) {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return Promise.reject(new Error('No refresh token'));
    }

    refreshPromise = axios
      .post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken })
      .then(({ data }) => {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        return data.access_token as string;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const url = original?.url ?? '';
    const isAuthCall = AUTH_PATHS.some((path) => url.endsWith(path));

    if (error.response?.status !== 401 || !original || original._retry || isAuthCall) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const token = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${token}`;
      return client(original);
    } catch (refreshError) {
      clearSessionAndRedirect();
      return Promise.reject(refreshError);
    }
  }
);

export default client;
