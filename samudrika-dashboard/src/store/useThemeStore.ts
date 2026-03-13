import { create } from 'zustand'

type ThemeMode = 'dark' | 'light'

interface ThemeState {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
}))
