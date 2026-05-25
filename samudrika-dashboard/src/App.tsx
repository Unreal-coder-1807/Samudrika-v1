import type { ReactElement } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ClickSpark from "./components/common/ClickSpark";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";
import { useApiHealth } from "./hooks/useApiHealth";
import { ThemeProvider } from "./theme/ThemeContext";
import { AnalyzePage } from "./pages/AnalyzePage";
import { DashboardPage } from "./pages/DashboardPage";
import { HistoryPage } from "./pages/HistoryPage";
import LandingPage from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SSOCallbackPage } from "./pages/SSOCallbackPage";
import { ThreatPage } from "./pages/ThreatPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import "leaflet/dist/leaflet.css";

const RouterContent = () => {
  useApiHealth();

  const withShell = (page: ReactElement) => (
    <ProtectedRoute>
      <AppShell>{page}</AppShell>
    </ProtectedRoute>
  );

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/sso-callback" element={<SSOCallbackPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/dashboard" element={withShell(<DashboardPage />)} />
      <Route path="/analyze" element={withShell(<AnalyzePage />)} />
      <Route path="/threat" element={withShell(<ThreatPage />)} />
      <Route path="/history" element={withShell(<HistoryPage />)} />
      <Route path="/settings" element={withShell(<SettingsPage />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <ThemeProvider>
    <BrowserRouter>
      <ClickSpark sparkColor="#00b4d8" sparkSize={10} sparkRadius={18} sparkCount={10} duration={450}>
        <RouterContent />
      </ClickSpark>
    </BrowserRouter>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--bg-surface)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-subtle)",
        },
      }}
    />
  </ThemeProvider>
);

export default App;
