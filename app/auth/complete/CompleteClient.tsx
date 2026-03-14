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
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    const payload = JSON.stringify({
      next: target,
      t: Date.now(),
    });

    // Signal the original tab (works on desktop browsers)
    try {
      localStorage.setItem("havenly:auth_complete", payload);
    } catch {}

    try {
      const bc = new BroadcastChannel("havenly_auth");
      bc.postMessage({ type: "AUTH_COMPLETE", next: target });
      bc.close();
    } catch {}

    // Try to close this tab (only works if browser allows it)
    // If it fails, user will see fallback UI.
    setTimeout(() => {
      try {
        // If we can close, do it; otherwise show fallback.
        window.close();
        setCanClose(true);
      } catch {
        setCanClose(false);
      }
    }, 150);

    // As a backup, if it didn't close, navigate to the target here too.
    const navTimer = setTimeout(() => {
      try {
        window.location.replace(target);
      } catch {}
    }, 700);

    return () => clearTimeout(navTimer);
  }, [target]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{ fontSize: 18, marginBottom: 8 }}>Signing you in…</div>
        <div style={{ opacity: 0.7, fontSize: 14, marginBottom: 16 }}>
          Returning you to your dashboard.
        </div>

        {/* Fallback (in case tab-close is blocked) */}
        {!canClose ? (
          <Link
            href={target}
            style={{
              display: "inline-block",
              padding: "10px 14px",
              borderRadius: 10,
              background: "#34d399",
              color: "#0f172a",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Continue
          </Link>
        ) : null}
      </div>
    </div>
  );
}
