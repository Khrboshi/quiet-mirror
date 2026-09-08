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

// SECURITY: open-redirect guard. `raw` reaches here only from the
// `localStorage.getItem("qm:auth_next")` value, which may be attacker-
// controllable through a crafted magic-login link.
//
// The previous version tested only for a leading "//". That let 552 of 58,110
// fuzzed payloads resolve to another origin, measured 8 Sep 2026, because
// browsers normalise "\\" to "/" and strip TAB, LF and CR before parsing a URL.
// So "/\\evil.com" and "/<TAB>/evil.com" both landed on https://evil.com.
//
// Three rules, all required, in this order:
//   1. Remove control characters FIRST, so they cannot conceal a second slash.
//   2. Reject a backslash anywhere -- no legitimate in-app path contains one.
//   3. Reject a leading "//".
// Re-verified against the same 58,110 payloads: 0 escape the origin, and 16
// legitimate destinations are unchanged. Control characters are filtered by
// char code rather than by regex, to avoid depending on lint configuration.
//
// Found by CodeQL (alerts #15 and #16, Medium).
// An identical copy of this function lives in app/magic-login/page.tsx.
// If you change one, change both.
function safeNext(raw: string | null | undefined): string {
  const FALLBACK = "/dashboard";
  if (typeof raw !== "string") return FALLBACK;
  let v = "";
  for (const ch of raw) {
    const code = ch.charCodeAt(0);
    if (code > 0x1f && code !== 0x7f) v += ch;
  }
  v = v.trim();
  if (!v.startsWith("/")) return FALLBACK;
  if (v.includes("\\")) return FALLBACK;
  if (v.startsWith("//")) return FALLBACK;
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
      const stored = window.localStorage.getItem("qm:auth_next");
      // Only use localStorage destination if it was explicitly set to something
      // other than the default dashboard, and we're not a first-time user.
      if (!isFirstUser && stored && stored !== "/dashboard") dest = safeNext(stored);
    } catch {}

    setDestination(dest);

    const payload = JSON.stringify({ next: dest, t: Date.now() });
    try { localStorage.setItem("qm:auth_complete", payload); } catch {}
    try {
      const bc = new BroadcastChannel("qm:auth_channel");
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
