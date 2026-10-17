import api from './api';

export const employeeService = {
  getEmployees: async (params = {}) => {
    return api.get('/employees', { params });
  },

  getEmployeeById: async (employeeId) => {
    return api.get(`/employees/${employeeId}`);
  },

  updateEmployee: async (employeeId, data) => {
    return api.patch(`/employees/${employeeId}`, data);
  },
};

export default employeeService;
