import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className="rounded border border-[var(--border-subtle)] p-2 text-[var(--text-primary)]"
      aria-label="toggle theme"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
