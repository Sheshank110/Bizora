import { create } from 'zustand';

let toastIdCounter = 0;

/**
 * Toast store — manages notification toasts globally.
 * Usage: useToastStore.getState().addToast({ type: 'success', title: 'Done', message: '...' })
 */
export const useToastStore = create((set) => ({
  toasts: [],

  addToast: ({ type = 'info', title, message, duration = 5000 }) => {
    const id = ++toastIdCounter;

    set((s) => ({
      toasts: [...s.toasts, { id, type, title, message }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({
          toasts: s.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  removeToast: (id) =>
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}));

/** Convenience hook for adding toasts */
export const useToast = () => {
  const addToast = useToastStore((s) => s.addToast);

  return {
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
  };
};
