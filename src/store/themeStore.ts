import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  mode: 'dark' | 'light';
  accent: string;
  toggleMode: () => void;
  setAccent: (color: string) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'dark',
      accent: '#7c3aed',
      toggleMode: () => set((s) => ({ mode: s.mode === 'dark' ? 'light' : 'dark' })),
      setAccent: (color) => set({ accent: color }),
    }),
    { name: 'taskflow-theme', version: 1 }
  )
);
