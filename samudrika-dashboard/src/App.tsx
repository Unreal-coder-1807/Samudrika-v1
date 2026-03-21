import type { ReactElement } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import {
  AuthenticateWithRedirectCallback,
  ClerkLoaded,
  ClerkLoading,
  RedirectToSignIn,
  SignedIn,
  SignedOut,
} from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";
import ClickSpark from "./components/common/ClickSpark";
import { AppShell } from "./components/layout/AppShell";
import { useApiHealth } from "./hooks/useApiHealth";
import { ThemeProvider } from "./theme/ThemeContext";
import { AnalyzePage } from "./pages/AnalyzePage";
import { DashboardPage } from "./pages/DashboardPage";
import { HistoryPage } from "./pages/HistoryPage";
import LandingPage from "./pages/LandingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ThreatPage } from "./pages/ThreatPage";
import "leaflet/dist/leaflet.css";

const ProtectedRoute = ({ children }: { children: ReactElement }) => (
  <>
    <SignedIn>{children}</SignedIn>
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>
  </>
);

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
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />
      <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />
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
        <ClerkLoading>
          <div className="min-h-screen bg-[var(--bg-primary)]" />
        </ClerkLoading>
        <ClerkLoaded>
          <RouterContent />
        </ClerkLoaded>
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
