import { create } from 'zustand';

/**
 * UI store — manages sidebar state and other transient UI state.
 */
export const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,

  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) =>
    set({ sidebarCollapsed: collapsed }),

  setSidebarMobileOpen: (open) =>
    set({ sidebarMobileOpen: open }),

  toggleMobileSidebar: () =>
    set((s) => ({ sidebarMobileOpen: !s.sidebarMobileOpen })),
}));
