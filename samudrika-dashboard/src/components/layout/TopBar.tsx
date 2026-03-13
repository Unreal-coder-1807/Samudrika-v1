import { Bell } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { ThemeToggle } from '../common/ThemeToggle'

const titleMap: Record<string, string> = {
  '/': 'Operational Overview',
  '/analyze': 'Frame Analysis',
  '/threat': 'Single Detection Scorer',
  '/history': 'Session History',
  '/settings': 'System Settings',
}

export const TopBar = () => {
  const { pathname } = useLocation()
  const title = titleMap[pathname] ?? 'Samudrika'

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 px-4 py-3 backdrop-blur">
      <div className="grid grid-cols-3 items-center">
        <div>
          <h1 className="text-xl">{title}</h1>
          <div className="text-xs text-[var(--text-muted)]">SAMUDRIKA / {pathname}</div>
        </div>
        <div className="text-center text-xs ui-label text-red-400">
          RESTRICTED - AUTHORIZED USE ONLY
        </div>
        <div className="flex items-center justify-end gap-3">
          <ThemeToggle />
          <div className="relative rounded border border-[var(--border-subtle)] p-2">
            <Bell size={16} />
            <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[9px]">
              2
            </span>
          </div>
          <div className="flex items-center gap-2 rounded border border-[var(--border-subtle)] px-2 py-1 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>OP-001 | ACTIVE</span>
          </div>
        </div>
      </div>
    </header>
  )
}
