import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Theme store — manages light/dark/system theme preference.
 * Persists to localStorage and applies the correct class to <html>.
 */
export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system', // 'light' | 'dark' | 'system'

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      initTheme: () => {
        applyTheme(get().theme);
      },
    }),
    {
      name: 'bizora-theme',
    }
  )
);

function applyTheme(theme) {
  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (theme === 'dark' || (theme === 'system' && systemDark)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme } = useThemeStore.getState();
    if (theme === 'system') {
      applyTheme('system');
    }
  });
}
