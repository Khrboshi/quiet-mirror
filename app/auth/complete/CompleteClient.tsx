/**
 * app/auth/complete/CompleteClient.tsx
 *
 * Post-auth landing page shown after magic link verification completes.
 * Confirms the session is active then redirects to /dashboard.
 * Handles edge cases where the session token takes a moment to propagate.
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/app/components/I18nProvider";

function safeNext(raw: string | null | undefined): string {
  const v = (raw || "/dashboard").trim();
  if (!v.startsWith("/")) return "/dashboard";
  if (v.startsWith("//")) return "/dashboard";
  return v;
}

export default function CompleteClient() {
  const { t } = useTranslation();
  const ac = t.authComplete;

  const [closeBlocked, setCloseBlocked] = useState(false);
  const [destination, setDestination] = useState("/dashboard");

  useEffect(() => {
    // If the callback detected a first-time user, send them to /journal/new
    // so they reach their first reflection without extra navigation steps
    // (PRODUCT_BRIEF §6 — highest-leverage conversion moment).
    const sp = new URLSearchParams(window.location.search);
    const isFirstUser = sp.get("firstUser") === "1";

    let dest = isFirstUser ? "/journal/new" : "/dashboard";
    try {
      const stored = window.localStorage.getItem("havenly:auth_next");
      // Only use localStorage destination if it was explicitly set to something
      // other than the default dashboard, and we're not a first-time user.
      if (!isFirstUser && stored && stored !== "/dashboard") dest = safeNext(stored);
    } catch {}

    setDestination(dest);

    const payload = JSON.stringify({ next: dest, t: Date.now() });
    try { localStorage.setItem("havenly:auth_complete", payload); } catch {}
    try {
      const bc = new BroadcastChannel("havenly_auth");
      bc.postMessage({ type: "AUTH_COMPLETE", next: dest });
      bc.close();
    } catch {}

    setTimeout(() => {
      window.close();
      setTimeout(() => { setCloseBlocked(true); }, 300);
    }, 100);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-qm-bg px-6">
      <div className="max-w-sm text-center">
        <h1 className="font-display text-lg font-semibold text-qm-primary">
          {closeBlocked ? ac.signedIn : ac.signingIn}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-qm-muted">
          {closeBlocked ? ac.closeTab : ""}
        </p>
        {closeBlocked && (
          <Link
            href={destination}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-qm-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-qm-accent-hover"
          >
            {destination === "/upgrade" ? ac.continuePremium : ac.gotoDashboard}
          </Link>
        )}
      </div>
    </div>
  );
}
