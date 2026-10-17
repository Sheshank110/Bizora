import api from './api';

export const authService = {
  login: async (credentials) => {
    return api.post('/auth/login', credentials);
  },

  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  logout: async () => {
    return api.post('/auth/logout');
  },

  getMe: async () => {
    return api.get('/auth/me');
  },

  refreshToken: async () => {
    return api.post('/auth/refresh');
  },

  verifyEmail: async (token) => {
    return api.post('/auth/verify-email', { token });
  },

  resendVerification: async (email) => {
    return api.post('/auth/resend-verification', { email });
  },

  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: async ({ token, password }) => {
    return api.post('/auth/reset-password', { token, password });
  },
};

export default authService;
