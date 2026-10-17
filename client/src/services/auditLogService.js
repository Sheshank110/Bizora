import api from './api';

export const auditLogService = {
  getAuditLogs: async (params = {}) => {
    return api.get('/activity', { params });
  },
};

export default auditLogService;
