import api from './api';

export const adminService = {
  getDashboard: async () => {
    return api.get('/admin/dashboard');
  },

  getBusinesses: async (params = {}) => {
    return api.get('/admin/businesses', { params });
  },

  updateBusinessStatus: async (businessId, status) => {
    return api.patch(`/admin/businesses/${businessId}/status`, { status });
  },

  getUsers: async (params = {}) => {
    return api.get('/admin/users', { params });
  },

  getPlans: async () => {
    return api.get('/admin/plans');
  },
};

export default adminService;
