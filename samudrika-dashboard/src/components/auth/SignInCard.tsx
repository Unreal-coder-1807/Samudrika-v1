import { useSignIn } from "@clerk/clerk-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type OAuthProvider = "oauth_google" | "oauth_apple" | "oauth_microsoft";

const parseClerkError = (err: unknown) => {
  if (typeof err === "object" && err !== null && "errors" in err) {
    const errors = (err as { errors?: Array<{ message?: string }> }).errors;
    return errors?.[0]?.message ?? "Sign in failed. Please try again.";
  }
  return "Sign in failed. Please try again.";
};

export default function SignInCard() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleOAuth = async (provider: OAuthProvider) => {
    if (!isLoaded) return;
    await signIn.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/dashboard",
    });
  };

  const handleSubmit = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/dashboard");
      }
    } catch (err) {
      setError(parseClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "360px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0",
        zIndex: 1,
        position: "relative",
      }}
    >
      <h1
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "40px",
          fontWeight: 700,
          color: "#FFFFFF",
          letterSpacing: "-0.025em",
          margin: "0 0 28px",
          textAlign: "center",
        }}
      >
        Sign In.
      </h1>

      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <button className="auth-social-btn" onClick={() => void handleOAuth("oauth_google")}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <button className="auth-social-btn" onClick={() => void handleOAuth("oauth_apple")}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="white" aria-hidden="true">
            <path d="M14.4 9.55c-.02-2.37 1.93-3.51 2.02-3.57-1.1-1.61-2.81-1.83-3.42-1.86-1.46-.15-2.84.86-3.58.86-.74 0-1.88-.84-3.09-.82C4.65 4.18 3 5.12 2.1 6.62.28 9.67 1.6 14.2 3.35 16.7c.88 1.27 1.93 2.7 3.3 2.65 1.33-.05 1.83-.86 3.44-.86 1.6 0 2.06.86 3.46.83 1.43-.02 2.32-1.29 3.19-2.57.99-1.46 1.4-2.87 1.42-2.95-.03-.01-2.73-1.05-2.76-4.25zM11.92 2.87c.73-.9 1.23-2.14 1.09-3.39-1.05.04-2.34.7-3.1 1.58-.68.78-1.28 2.03-1.12 3.22 1.17.09 2.37-.6 3.13-1.41z" />
          </svg>
          Continue with Apple
        </button>

        <button className="auth-social-btn" onClick={() => void handleOAuth("oauth_microsoft")}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <rect x="0" y="0" width="8.5" height="8.5" fill="#F25022" />
            <rect x="9.5" y="0" width="8.5" height="8.5" fill="#7FBA00" />
            <rect x="0" y="9.5" width="8.5" height="8.5" fill="#00A4EF" />
            <rect x="9.5" y="9.5" width="8.5" height="8.5" fill="#FFB900" />
          </svg>
          Continue with Microsoft
        </button>
      </div>

      <div style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", fontFamily: "Inter, system-ui, sans-serif" }}>
          or
        </span>
        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
      </div>

      <input
        className="auth-input"
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: "10px" }}
      />

      <input
        className="auth-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && void handleSubmit()}
        style={{ marginBottom: "18px" }}
      />

      {error && (
        <p
          style={{
            fontSize: "12px",
            color: "#FF6B6B",
            fontFamily: "IBM Plex Mono, monospace",
            marginBottom: "12px",
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}

      <button className="auth-btn-primary" onClick={() => void handleSubmit()} disabled={loading} style={{ marginBottom: "20px" }}>
        {loading ? "Signing in..." : "Sign In."}
      </button>

      <p
        style={{
          fontSize: "13px",
          color: "rgba(255,255,255,0.45)",
          fontFamily: "Inter, system-ui, sans-serif",
          marginBottom: "8px",
        }}
      >
        don't have an account?{" "}
        <Link to="/sign-up" style={{ color: "#FFFFFF", fontWeight: 600, textDecoration: "none" }}>
          Create account
        </Link>
      </p>

      <Link
        to="/sign-in"
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: "#FFFFFF",
          fontFamily: "Inter, system-ui, sans-serif",
          textDecoration: "none",
        }}
      >
        Forgot password?
      </Link>
    </div>
  );
}
