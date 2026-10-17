import api from './api';

export const subscriptionService = {
  getSubscription: async () => {
    return api.get('/subscription');
  },

  changePlan: async (planSlug) => {
    return api.post('/subscription/change-plan', { planSlug });
  },

  cancelSubscription: async () => {
    return api.post('/subscription/cancel');
  },
};

export default subscriptionService;
