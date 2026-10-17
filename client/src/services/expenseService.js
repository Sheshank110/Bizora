import api from './api';

export const expenseService = {
  getExpenses: async (params = {}) => {
    return api.get('/expenses', { params });
  },

  createExpense: async (data) => {
    return api.post('/expenses', data);
  },

  deleteExpense: async (expenseId) => {
    return api.delete(`/expenses/${expenseId}`);
  },
};

export default expenseService;
