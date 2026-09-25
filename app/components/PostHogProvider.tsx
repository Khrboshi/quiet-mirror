"use client";

/**
 * app/components/PostHogProvider.tsx
 *
 * Initialises PostHog analytics on the client.
 * No-ops silently if NEXT_PUBLIC_POSTHOG_KEY is not set (safe for local dev).
 * Uses localStorage persistence so queued events survive client-side navigation.
 * Autocapture is disabled to respect user privacy — only explicit track() calls fire.
 */
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, Suspense } from "react";

// useLayoutEffect fires before the browser paints, but warns during SSR.
// Fall back to useEffect on the server so Next.js does not log a warning.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Routes where session recording must never run. Kept in sync with the URL
// blocklist in PostHog project settings — this is the in-code equivalent, so
// protection does not depend on remote config loading successfully.
const NO_RECORDING_PREFIXES = [
  "/journal",
  "/dashboard",
  "/insights",
  "/settings",
  "/tools",
];

function isNoRecordingPath(pathname: string): boolean {
  return NO_RECORDING_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

// Stops session recording as soon as the user reaches a protected route.
// Uses a layout effect so the stop call lands before the browser paints the
// protected page, narrowing the window in which the recorder could observe it.
// Deliberately one-way: we never call startSessionRecording() to resume, so a
// session that has touched the journal stays un-recorded for its remainder.
function PostHogRecordingGuard() {
  const pathname = usePathname();
  const ph = usePostHog();

  useIsomorphicLayoutEffect(() => {
    if (!pathname || !ph) return;
    if (isNoRecordingPath(pathname)) {
      ph.stopSessionRecording();
    }
  }, [pathname, ph]);

  return null;
}

// Tracks page views on client-side navigation
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (!pathname || !ph) return;
    let url = window.origin + pathname;
    if (searchParams?.toString()) url += `?${searchParams.toString()}`;
    ph.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, ph]);

  return null;
}

// Initialise PostHog once on the client
function PostHogInit() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return; // silently no-op if key not set (local dev without env var)

    // If the very first page of the session is a protected route, the recorder
    // must never start at all — stopping it after init would be too late.
    const startsOnProtectedRoute = isNoRecordingPath(window.location.pathname);

    posthog.init(key, {
      // Route all events through the Next.js reverse proxy (/ingest/*)
      // so ad blockers and privacy browsers cannot block PostHog calls.
      // See: next.config.mjs rewrites() for the proxy destination.
      api_host: "/ingest",
      // ui_host must point to the real PostHog dashboard so the toolbar works.
      ui_host: "https://eu.posthog.com",
      person_profiles: "always",
      capture_pageview: false,            // we handle pageviews manually above
      capture_pageleave: true,
      autocapture: false,                 // privacy: no automatic click tracking
      persistence: "localStorage",       // survives client-side navigation; stores only anon ID, no PII
      // Never boot the recorder on a protected route (direct load, refresh, or
      // a magic-link that lands straight in the journal).
      disable_session_recording: startsOnProtectedRoute,
      // Session replay masking, enforced in code as well as in PostHog project
      // settings. The project settings already block /journal, /dashboard,
      // /insights, /settings and /tools and set "Total privacy" masking — this
      // block is a second line of defence so entry text can never be captured
      // if that remote config fails to load or is changed by accident.
      session_recording: {
        maskAllInputs:   true,
        maskTextSelector: "*",           // mask every text node, not just inputs
      },
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") ph.debug();
      },
    });
  }, []);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <PostHogInit />
      <Suspense fallback={null}>
        <PostHogRecordingGuard />
      </Suspense>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
