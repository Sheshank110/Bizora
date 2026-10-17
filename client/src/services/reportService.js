import api from './api';

export const reportService = {
  getSummary: async () => {
    return api.get('/reports/summary');
  },

  exportCsvUrl: (type = 'invoices') => {
    const base = import.meta.env.VITE_API_URL || '/api';
    return `${base}/reports/export?type=${type}`;
  },
};

export default reportService;
