// app/auth/complete/CompleteClient.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const DESTINATION = "/dashboard";

export default function CompleteClient() {
  const [closeBlocked, setCloseBlocked] = useState(false);

  useEffect(() => {
    // Signal the original tab (magic-login page) via both channels.
    // Always send /dashboard — never rely on URL params which email
    // clients like Yahoo and Gmail routinely strip or mangle.
    const payload = JSON.stringify({ next: DESTINATION, t: Date.now() });
    try { localStorage.setItem("havenly:auth_complete", payload); } catch {}
    try {
      const bc = new BroadcastChannel("havenly_auth");
      bc.postMessage({ type: "AUTH_COMPLETE", next: DESTINATION });
      bc.close();
    } catch {}

    // Attempt to close this tab.
    // window.close() only works when opened via window.open().
    // For email-client links it will be blocked silently.
    // We detect whether it worked by checking if JS is still running 400ms later.
    setTimeout(() => {
      window.close();
      setTimeout(() => {
        // Still running — tab is still open. Show fallback UI.
        setCloseBlocked(true);
      }, 300);
    }, 100);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="text-center max-w-sm">
        <h1 className="font-display text-lg font-semibold text-white">
          {closeBlocked ? "You're signed in." : "Signing you in\u2026"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          {closeBlocked
            ? "Your original tab is ready. You can close this one."
            : ""}
        </p>

        {closeBlocked && (
          <Link
            href={DESTINATION}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
          >
            Go to dashboard &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}
