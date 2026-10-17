import { create } from 'zustand';

const SAVED_BUSINESS_KEY = 'bizora_active_business_id';

export const useBusinessStore = create((set, get) => ({
  businesses: [],
  activeBusiness: null,
  activeRole: null,

  setBusinesses: (businesses = []) => {
    const savedId = localStorage.getItem(SAVED_BUSINESS_KEY);
    let selected = null;

    if (savedId) {
      selected = businesses.find((b) => (b.id || b._id) === savedId);
    }

    if (!selected && businesses.length > 0) {
      selected = businesses[0];
    }

    if (selected) {
      localStorage.setItem(SAVED_BUSINESS_KEY, selected.id || selected._id);
    }

    set({
      businesses,
      activeBusiness: selected || null,
      activeRole: selected?.role || null,
    });
  },

  setActiveBusiness: (business) => {
    if (business) {
      localStorage.setItem(SAVED_BUSINESS_KEY, business.id || business._id);
      set({
        activeBusiness: business,
        activeRole: business.role || null,
      });
    } else {
      localStorage.removeItem(SAVED_BUSINESS_KEY);
      set({
        activeBusiness: null,
        activeRole: null,
      });
    }
  },

  updateActiveBusiness: (updates) => {
    set((state) => {
      if (!state.activeBusiness) return state;
      const updated = { ...state.activeBusiness, ...updates };
      const updatedList = state.businesses.map((b) =>
        (b.id || b._id) === (updated.id || updated._id) ? { ...b, ...updates } : b
      );
      return {
        activeBusiness: updated,
        businesses: updatedList,
      };
    });
  },

  clearBusiness: () => {
    localStorage.removeItem(SAVED_BUSINESS_KEY);
    set({
      businesses: [],
      activeBusiness: null,
      activeRole: null,
    });
  },
}));

export default useBusinessStore;
