import axios from 'axios';

/**
 * Centralized Axios instance for all API calls.
 * 
 * Phase 1: Base configuration only.
 * Phase 2 will add: auth token injection, refresh logic, and 401 handling.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ─── Request Interceptor ──────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Phase 2: Inject auth token here
    // const token = authStore.getState().accessToken;
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    const apiError = {
      message,
      status: error.response?.status,
      code: error.response?.data?.code,
      details: error.response?.data?.details,
    };

    // Phase 2: Handle 401 → refresh token flow here

    return Promise.reject(apiError);
  }
);

export default api;
