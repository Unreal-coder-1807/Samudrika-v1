"use client";

import { useClerk, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export function UserPanel() {
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

  const initials =
    ((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")).toUpperCase() ||
    user.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ||
    "OP";

  const displayName = user.fullName ?? user.primaryEmailAddress?.emailAddress?.split("@")[0] ?? "Operator";
  const displayEmail = user.primaryEmailAddress?.emailAddress ?? "";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 4,
          padding: "5px 10px 5px 6px",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #00B4D8, #0077B6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 600,
            color: "#FFF",
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

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#E8F4FD", lineHeight: 1.2 }}>
            {displayName.toUpperCase()}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#06D6A0" }} />
            <span style={{ fontSize: 10, color: "#4A6B8A", letterSpacing: "0.05em", fontFamily: "monospace" }}>
              ACTIVE
            </span>
          </div>
        </div>

        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}
        >
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="#4A6B8A"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 240,
            background: "#0A1628",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            overflow: "hidden",
            zIndex: 1000,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00B4D8, #0077B6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 600,
                color: "#FFF",
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
              <div style={{ fontSize: 13, fontWeight: 600, color: "#E8F4FD" }}>{displayName}</div>
              <div style={{ fontSize: 11, color: "#4A6B8A", fontFamily: "monospace", marginTop: 2 }}>
                {displayEmail}
              </div>
            </div>
          </div>

          <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,45,45,0.08)",
                border: "1px solid rgba(255,45,45,0.2)",
                borderRadius: 4,
                padding: "3px 8px",
              }}
            >
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF2D2D" }} />
              <span style={{ fontSize: 10, color: "#FF6B6B", fontFamily: "monospace", letterSpacing: "0.1em" }}>
                RESTRICTED ACCESS
              </span>
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
              gap: 10,
              cursor: "pointer",
              color: "#FF6B6B",
              fontSize: 13,
              fontFamily: "inherit",
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
