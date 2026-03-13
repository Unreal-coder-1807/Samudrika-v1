import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppShell } from './components/layout/AppShell'
import { useApiHealth } from './hooks/useApiHealth'
import { ThemeProvider } from './theme/ThemeContext'
import { AnalyzePage } from './pages/AnalyzePage'
import { DashboardPage } from './pages/DashboardPage'
import { HistoryPage } from './pages/HistoryPage'
import { SettingsPage } from './pages/SettingsPage'
import { ThreatPage } from './pages/ThreatPage'
import 'leaflet/dist/leaflet.css'

const RouterContent = () => {
  useApiHealth()
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/threat" element={<ThreatPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
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
