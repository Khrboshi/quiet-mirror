// telemetry.ts — thin wrapper that routes events to PostHog if loaded,
// or falls back to the server-side log endpoint.
import posthog from "posthog-js";

export function track(event: string, data?: Record<string, unknown>) {
  try {
    // If PostHog is initialised, use it
    if (posthog.__loaded) {
      posthog.capture(event, data);
      return;
    }
  } catch {}

  // Fallback: fire-and-forget to server log
  try {
    fetch("/api/telemetry/upgrade-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data }),
      keepalive: true,
    });
  } catch {}
}

// Identify the logged-in user so PostHog links events to an account.
// Call this once after login — e.g. in SupabaseSessionProvider.
export function identify(userId: string, traits?: Record<string, unknown>) {
  try {
    if (posthog.__loaded) {
      posthog.identify(userId, traits);
    }
  } catch {}
}

// Reset on logout so the next user doesn't inherit the previous session.
export function resetIdentity() {
  try {
    if (posthog.__loaded) posthog.reset();
  } catch {}
}
