// app/auth/complete/CompleteClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function safeNext(pathname: string) {
  const v = (pathname || "/dashboard").trim();
  if (!v.startsWith("/")) return "/dashboard";
  if (v.startsWith("//")) return "/dashboard";
  return v;
}

export default function CompleteClient({ next }: { next: string }) {
  const target = useMemo(() => safeNext(next), [next]);

  // true  = window.close() was blocked, tab is still open → show fallback UI
  // false = still waiting to know
  const [closeBlocked, setCloseBlocked] = useState(false);

  useEffect(() => {
    const payload = JSON.stringify({ next: target, t: Date.now() });

    // Signal the original tab via localStorage (fires storage event on other tabs)
    try { localStorage.setItem("havenly:auth_complete", payload); } catch {}

    // Signal via BroadcastChannel (more reliable, same-origin tabs)
    try {
      const bc = new BroadcastChannel("havenly_auth");
      bc.postMessage({ type: "AUTH_COMPLETE", next: target });
      bc.close();
    } catch {}

    // Attempt to close this tab.
    // window.close() only works when the tab was opened by window.open().
    // When a user clicks a link in their email client, Chrome blocks it.
    // We detect whether it worked by checking if this code is still running
    // 300ms later — if the tab closed, this callback never fires.
    setTimeout(() => {
      window.close();

      // If we reach this point, the tab is still open (close was blocked).
      // Show the fallback UI so the user has a clear path forward.
      // We do NOT navigate Tab B to the dashboard — that would cause a
      // duplicate-tab situation since Tab A already received the broadcast.
      setTimeout(() => {
        setCloseBlocked(true);
      }, 200);
    }, 100);
  }, [target]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#020617",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#f8fafc",
            marginBottom: 8,
          }}
        >
          {closeBlocked ? "You're signed in." : "Signing you in\u2026"}
        </div>
        <div
          style={{
            opacity: 0.6,
            fontSize: 14,
            color: "#cbd5e1",
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          {closeBlocked
            ? "Your original tab is ready. You can close this one."
            : ""}
        </div>

        {/* Shown when close is blocked — covers mobile and single-tab users */}
        {closeBlocked && (
          <Link
            href={target}
            style={{
              display: "inline-block",
              padding: "10px 20px",
              borderRadius: 9999,
              background: "#3ee7b0",
              color: "#020617",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            Continue to Havenly &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}
