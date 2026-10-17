import api from './api';

export const userService = {
  getProfile: async () => {
    return api.get('/users/me');
  },

  updateProfile: async (data) => {
    return api.patch('/users/profile', data);
  },

  changePassword: async (passwords) => {
    return api.put('/users/password', passwords);
  },
};

export default userService;
