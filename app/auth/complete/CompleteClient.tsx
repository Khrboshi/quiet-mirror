// app/auth/complete/CompleteClient.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Ensures the redirect path is a valid internal route.
 */
function safeNext(raw: string | null | undefined): string {
  const v = (raw || "/dashboard").trim();
  if (!v.startsWith("/")) return "/dashboard";
  if (v.startsWith("//")) return "/dashboard";
  return v;
}

export default function CompleteClient() {
  const [closeBlocked, setCloseBlocked] = useState(false);
  const [destination, setDestination] = useState("/dashboard");

  useEffect(() => {
    // 1. Determine the final destination
    let dest = "/dashboard";
    try {
      const stored = window.localStorage.getItem("havenly:auth_next");
      if (stored) {
        dest = safeNext(stored);
      }
    } catch {
      // ignore storage errors
    }
    
    setDestination(dest);

    // 2. Signal the original tab (magic-login page) via both channels.
    // We include the 'next' destination so the original tab knows where to go.
    const payload = JSON.stringify({ next: dest, t: Date.now() });
    
    try { 
      localStorage.setItem("havenly:auth_complete", payload); 
    } catch {}

    try {
      const bc = new BroadcastChannel("havenly_auth");
      bc.postMessage({ type: "AUTH_COMPLETE", next: dest });
      bc.close();
    } catch {}

    // 3. Attempt to close this tab.
    // window.close() only works when opened via window.open().
    // For email-client links it will be blocked silently.
    setTimeout(() => {
      window.close();
      setTimeout(() => {
        // If still running after 400ms, the tab is still open. Show fallback UI.
        setCloseBlocked(true);
      }, 300);
    }, 100);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-qm-bg px-6">
      <div className="max-w-sm text-center">
        <h1 className="font-display text-lg font-semibold text-qm-primary">
          {closeBlocked ? "You're signed in." : "Signing you in\u2026"}
        </h1>
        
        <p className="mt-2 text-sm leading-relaxed text-qm-muted">
          {closeBlocked
            ? "Your original tab is ready. You can close this one."
            : ""}
        </p>

        {closeBlocked && (
          <Link
            href={destination}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-qm-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-qm-accent-hover"
          >
            {destination === "/upgrade" ? "Continue to Premium →" : "Go to dashboard →"}
          </Link>
        )}
      </div>
    </div>
  );
}
