import { createContext, useEffect, useMemo } from 'react'
import type { PropsWithChildren } from 'react'
import { useThemeStore } from '../store/useThemeStore'

type ThemeMode = 'dark' | 'light'

interface ThemeContextValue {
  theme: ThemeMode
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => undefined,
})

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const { theme, toggleTheme, setTheme } = useThemeStore()

  useEffect(() => {
    const saved = localStorage.getItem('samudrika-theme')
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved)
    }
  }, [setTheme])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('samudrika-theme', theme)
  }, [theme])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
