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
  const [triedClose, setTriedClose] = useState(false);

  useEffect(() => {
    const payload = JSON.stringify({
      next: target,
      t: Date.now(),
    });

    // Signal the original tab via localStorage (works across same-origin tabs)
    try {
      localStorage.setItem("havenly:auth_complete", payload);
    } catch {}

    // Signal via BroadcastChannel (more reliable on desktop)
    try {
      const bc = new BroadcastChannel("havenly_auth");
      bc.postMessage({ type: "AUTH_COMPLETE", next: target });
      bc.close();
    } catch {}

    // Attempt to close this tab.
    // window.close() only works when the tab was opened by window.open() — it
    // silently fails when the user clicked a link in their email client.
    // We do NOT fall back to navigating here, because that would cause both
    // this tab AND the original tab (which received the broadcast) to land on
    // the dashboard simultaneously.
    setTimeout(() => {
      try {
        window.close();
      } catch {}
      // Always show the fallback UI — if close worked the user won't see it;
      // if it didn't they have a clear path forward.
      setTriedClose(true);
    }, 150);
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
          You&apos;re signed in.
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
          {triedClose
            ? "You can close this tab and return to the original window."
            : "Signing you in\u2026"}
        </div>

        {/* Shown once close attempt has been made — covers mobile and
            single-tab users who don't have an original tab to return to. */}
        {triedClose && (
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
