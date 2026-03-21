import { useClerk, useUser } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserPanel() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isLoaded || !user) return null;

  const initials = (
    (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")
  ).toUpperCase() || user.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || "OP";

  const displayName = user.fullName || user.primaryEmailAddress?.emailAddress?.split("@")[0] || "Operator";
  const displayEmail = user.primaryEmailAddress?.emailAddress ?? "";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "4px",
          padding: "5px 10px 5px 6px",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #E040FB, #7B2FF7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 600,
            color: "#FFFFFF",
            fontFamily: "Inter, system-ui, sans-serif",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {user.imageUrl ? (
            <img src={user.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            initials
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#E8F4FD",
              fontFamily: "Inter, system-ui",
              lineHeight: 1.2,
            }}
          >
            {displayName.toUpperCase()}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#06D6A0" }} />
            <span style={{ fontSize: "10px", color: "#4A6B8A", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.05em" }}>
              ACTIVE
            </span>
          </div>
        </div>

        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: "2px", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="#4A6B8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "240px",
            background: "#0A1628",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            overflow: "hidden",
            zIndex: 1000,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #E040FB, #7B2FF7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  initials
                )}
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#E8F4FD", fontFamily: "Inter, system-ui" }}>{displayName}</div>
                <div style={{ fontSize: "11px", color: "#4A6B8A", fontFamily: "IBM Plex Mono, monospace", marginTop: "2px" }}>{displayEmail}</div>
              </div>
            </div>
          </div>

          <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255,45,45,0.08)",
                border: "1px solid rgba(255,45,45,0.2)",
                borderRadius: "4px",
                padding: "3px 8px",
              }}
            >
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#FF2D2D" }} />
              <span style={{ fontSize: "10px", color: "#FF6B6B", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.1em" }}>RESTRICTED ACCESS</span>
            </div>
          </div>

          <button
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "transparent",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              transition: "background 0.15s",
              color: "#FF6B6B",
              fontSize: "13px",
              fontFamily: "Inter, system-ui",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,45,45,0.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v7A1.5 1.5 0 0 0 2.5 12H5" stroke="#FF6B6B" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M9.5 10L13 7l-3.5-3" stroke="#FF6B6B" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="13" y1="7" x2="5" y2="7" stroke="#FF6B6B" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
