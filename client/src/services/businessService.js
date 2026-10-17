import api from './api';

export const businessService = {
  getMyBusinesses: async () => {
    return api.get('/businesses');
  },

  createBusiness: async (data) => {
    return api.post('/businesses', data);
  },

  getCurrentBusiness: async () => {
    return api.get('/businesses/current');
  },

  updateCurrentBusiness: async (data) => {
    return api.patch('/businesses/current', data);
  },

  getMembers: async () => {
    return api.get('/businesses/current/members');
  },

  inviteMember: async (data) => {
    return api.post('/businesses/current/members/invite', data);
  },

  updateMemberRole: async (memberId, data) => {
    return api.patch(`/businesses/current/members/${memberId}`, data);
  },

  removeMember: async (memberId) => {
    return api.delete(`/businesses/current/members/${memberId}`);
  },

  acceptInvite: async (token) => {
    return api.post('/businesses/accept-invite', { token });
  },
};

export default businessService;
