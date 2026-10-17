import axios from 'axios';
import useAuthStore from '../store/authStore';
import useBusinessStore from '../store/businessStore';

/**
 * Centralized Axios instance for all Bizora API calls.
 * Includes token injection, active workspace header injection,
 * and automatic 401 token refresh queue.
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
    // 1. Inject in-memory access token
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Inject active workspace ID header for tenant resolution
    const activeBusiness = useBusinessStore.getState().activeBusiness;
    if (activeBusiness) {
      config.headers['X-Business-ID'] = activeBusiness.id || activeBusiness._id;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Refresh Token Queue State ────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ─── Response Interceptor ─────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid infinite loop if refresh or login endpoints return 401
      const isAuthUrl =
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register');

      if (isAuthUrl) {
        return Promise.reject({
          message: error.response?.data?.message || 'Authentication error',
          status: error.response?.status,
          code: error.response?.data?.code,
          details: error.response?.data?.details,
        });
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the access token via httpOnly cookie
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (newAccessToken) {
          useAuthStore.getState().setAccessToken(newAccessToken);
          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error('No access token received from refresh');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        useBusinessStore.getState().clearBusiness();
        return Promise.reject({
          message: 'Session expired. Please log in again.',
          status: 401,
          code: 'SESSION_EXPIRED',
        });
      } finally {
        isRefreshing = false;
      }
    }

    let message = error.response?.data?.message;
    if (!message) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message = 'Cannot connect to backend server. Please verify that the API server is running.';
      } else {
        message = error.message || 'An unexpected error occurred';
      }
    }

    const apiError = {
      message,
      status: error.response?.status,
      code: error.response?.data?.code || (error.code === 'ERR_NETWORK' ? 'NETWORK_ERROR' : undefined),
      details: error.response?.data?.details,
    };

    return Promise.reject(apiError);
  }
);

export default api;
