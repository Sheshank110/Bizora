import api from './api';

export const taskService = {
  getTasks: async (params = {}) => {
    return api.get('/tasks', { params });
  },

  getTaskById: async (taskId) => {
    return api.get(`/tasks/${taskId}`);
  },

  createTask: async (data) => {
    return api.post('/tasks', data);
  },

  updateTask: async (taskId, data) => {
    return api.patch(`/tasks/${taskId}`, data);
  },

  deleteTask: async (taskId) => {
    return api.delete(`/tasks/${taskId}`);
  },
};

export default taskService;
