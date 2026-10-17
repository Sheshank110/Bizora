import api from './api';

export const fileService = {
  getFiles: async (params = {}) => {
    return api.get('/files', { params });
  },

  uploadFile: async (data) => {
    return api.post('/files', data);
  },

  deleteFile: async (fileId) => {
    return api.delete(`/files/${fileId}`);
  },
};

export default fileService;
