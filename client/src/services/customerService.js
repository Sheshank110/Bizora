import api from './api';

export const customerService = {
  getCustomers: async (params = {}) => {
    return api.get('/customers', { params });
  },

  getCustomerById: async (customerId) => {
    return api.get(`/customers/${customerId}`);
  },

  createCustomer: async (data) => {
    return api.post('/customers', data);
  },

  updateCustomer: async (customerId, data) => {
    return api.patch(`/customers/${customerId}`, data);
  },

  archiveCustomer: async (customerId) => {
    return api.delete(`/customers/${customerId}`);
  },

  getNotes: async (customerId) => {
    return api.get(`/customers/${customerId}/notes`);
  },

  addNote: async (customerId, data) => {
    return api.post(`/customers/${customerId}/notes`, data);
  },

  deleteNote: async (customerId, noteId) => {
    return api.delete(`/customers/${customerId}/notes/${noteId}`);
  },

  getActivityTimeline: async (customerId) => {
    return api.get(`/customers/${customerId}/activity`);
  },
};

export default customerService;
