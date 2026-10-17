import api from './api';

export const inventoryService = {
  getInventory: async (params = {}) => {
    return api.get('/inventory', { params });
  },

  getInventoryItemById: async (itemId) => {
    return api.get(`/inventory/${itemId}`);
  },

  createInventoryItem: async (data) => {
    return api.post('/inventory', data);
  },

  adjustStock: async (itemId, data) => {
    return api.post(`/inventory/${itemId}/adjust`, data);
  },
};

export default inventoryService;
