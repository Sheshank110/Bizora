import api from './api';

export const serviceService = {
  getServices: async (params = {}) => {
    return api.get('/services', { params });
  },

  getServiceById: async (serviceId) => {
    return api.get(`/services/${serviceId}`);
  },

  createService: async (data) => {
    return api.post('/services', data);
  },

  updateService: async (serviceId, data) => {
    return api.patch(`/services/${serviceId}`, data);
  },

  deleteService: async (serviceId) => {
    return api.delete(`/services/${serviceId}`);
  },
};

export default serviceService;
