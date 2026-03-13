import type { PropsWithChildren } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { StatusBar } from './StatusBar'

export const AppShell = ({ children }: PropsWithChildren) => (
  <div className="scanline-overlay relative flex min-h-screen bg-[var(--bg-primary)]">
    <Sidebar />
    <div className="flex min-h-screen flex-1 flex-col">
      <TopBar />
      <main className="flex-1 overflow-auto p-4 pb-10">{children}</main>
      <StatusBar />
    </div>
  </div>
)
