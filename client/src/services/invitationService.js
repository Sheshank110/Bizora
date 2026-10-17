import api from './api';

export const invitationService = {
  getInvitations: async () => {
    return api.get('/invitations');
  },

  inviteEmployee: async (data) => {
    return api.post('/invitations', data);
  },

  resendInvitation: async (invitationId) => {
    return api.post(`/invitations/${invitationId}/resend`);
  },

  revokeInvitation: async (invitationId) => {
    return api.delete(`/invitations/${invitationId}`);
  },

  acceptInvitation: async (data) => {
    return api.post('/invitations/accept', data);
  },
};

export default invitationService;
