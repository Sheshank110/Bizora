import api from './api';

export const paymentService = {
  getPayments: async (params = {}) => {
    return api.get('/payments', { params });
  },

  processCheckout: async (data) => {
    return api.post('/payments/checkout', data);
  },
};

export default paymentService;
