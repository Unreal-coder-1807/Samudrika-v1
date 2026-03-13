import { AlertTriangle, Clock, LayoutDashboard, Scan, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useConnectionStore } from '../../store/useConnectionStore'
import { ClassificationBadge } from '../common/ClassificationBadge'
import { useEffect, useState } from 'react'

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/analyze', label: 'Analyze', icon: Scan },
  { to: '/threat', label: 'Threat Score', icon: AlertTriangle },
  { to: '/history', label: 'History', icon: Clock },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export const Sidebar = () => {
  const isOnline = useConnectionStore((s) => s.isOnline)
  const [utc, setUtc] = useState(new Date().toUTCString())

  useEffect(() => {
    const t = setInterval(() => setUtc(new Date().toUTCString()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full border border-cyan-400/70" />
          <div>
            <div className="text-xl font-bold tracking-wider text-cyan-300">SAMUDRIKA</div>
            <div className="text-[10px] ui-label text-[var(--text-secondary)]">
              Threat Intelligence System
            </div>
          </div>
        </div>
        <div className="mt-2">
          <ClassificationBadge />
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded px-3 py-2 text-sm ${
                isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-[var(--text-secondary)]'
              }`
            }
          >
            <Icon size={16} />
            <span className="ui-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[var(--border-subtle)] pt-3 text-xs">
        <div className="mb-1 flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`}
          />
          <span>TRACK B API v0.1.0</span>
        </div>
        <div className="font-mono text-[10px] text-[var(--text-muted)]">{utc}</div>
      </div>
    </aside>
  )
}
