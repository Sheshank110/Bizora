import api from './api';

export const projectService = {
  getProjects: async (params = {}) => {
    return api.get('/projects', { params });
  },

  getProjectById: async (projectId) => {
    return api.get(`/projects/${projectId}`);
  },

  createProject: async (data) => {
    return api.post('/projects', data);
  },

  updateProject: async (projectId, data) => {
    return api.patch(`/projects/${projectId}`, data);
  },

  deleteProject: async (projectId) => {
    return api.delete(`/projects/${projectId}`);
  },
};

export default projectService;
