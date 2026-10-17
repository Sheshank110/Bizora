import api from './api';

export const clientPortalService = {
  getDashboard: async () => {
    return api.get('/client/dashboard');
  },

  getProjects: async () => {
    return api.get('/client/projects');
  },

  getProjectDetails: async (projectId) => {
    return api.get(`/client/projects/${projectId}`);
  },

  getInvoices: async () => {
    return api.get('/client/invoices');
  },

  getFiles: async () => {
    return api.get('/client/files');
  },
};

export default clientPortalService;
