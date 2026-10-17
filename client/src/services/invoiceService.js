import api from './api';

export const invoiceService = {
  getInvoices: async (params = {}) => {
    return api.get('/invoices', { params });
  },

  getInvoiceById: async (invoiceId) => {
    return api.get(`/invoices/${invoiceId}`);
  },

  createInvoice: async (data) => {
    return api.post('/invoices', data);
  },

  sendInvoice: async (invoiceId) => {
    return api.post(`/invoices/${invoiceId}/send`);
  },

  markPaid: async (invoiceId) => {
    return api.post(`/invoices/${invoiceId}/mark-paid`);
  },

  cancelInvoice: async (invoiceId) => {
    return api.post(`/invoices/${invoiceId}/cancel`);
  },
};

export default invoiceService;
