import type { ReactElement } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppShell } from './components/layout/AppShell'
import { useApiHealth } from './hooks/useApiHealth'
import { ThemeProvider } from './theme/ThemeContext'
import { AnalyzePage } from './pages/AnalyzePage'
import { DashboardPage } from './pages/DashboardPage'
import { HistoryPage } from './pages/HistoryPage'
import LandingPage from './pages/LandingPage'
import { SettingsPage } from './pages/SettingsPage'
import { ThreatPage } from './pages/ThreatPage'
import 'leaflet/dist/leaflet.css'

const RouterContent = () => {
  useApiHealth()

  const withShell = (page: ReactElement) => <AppShell>{page}</AppShell>

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={withShell(<DashboardPage />)} />
      <Route path="/analyze" element={withShell(<AnalyzePage />)} />
      <Route path="/threat" element={withShell(<ThreatPage />)} />
      <Route path="/history" element={withShell(<HistoryPage />)} />
      <Route path="/settings" element={withShell(<SettingsPage />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

const App = () => (
  <ThemeProvider>
    <BrowserRouter>
      <RouterContent />
    </BrowserRouter>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-subtle)',
        },
      }}
    />
  </ThemeProvider>
)

export default App
