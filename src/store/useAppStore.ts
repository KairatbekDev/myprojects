import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme, ToastNotification, ToastType } from '../types';

interface AppState {
  theme: Theme;
  toasts: ToastNotification[];
  actions: {
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toasts: [],

      actions: {
        setTheme: (theme) => set({ theme }),

        toggleTheme: () =>
          set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

        addToast: (message, type = 'info', duration = 4000) => {
          const id = Math.random().toString(36).substring(2, 9);
          set((s) => ({
            toasts: [...s.toasts, { id, type, message, duration }],
          }));
          setTimeout(() => {
            get().actions.removeToast(id);
          }, duration);
        },

        removeToast: (id) =>
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      },
    }),
    {
      name: 'kairat-app-store',
      partialize: (s) => ({ theme: s.theme }),
    }
  )
);

export const useTheme = () => useAppStore((s) => s.theme);
export const useToasts = () => useAppStore((s) => s.toasts);
export const useAppActions = () => useAppStore((s) => s.actions);
