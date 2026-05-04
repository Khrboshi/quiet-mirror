/**
 * app/components/telemetry.ts
 *
 * Thin analytics wrapper — routes events to PostHog when initialised,
 * or falls back to the server-side /api/telemetry endpoint.
 * All call sites use track() so the underlying provider is swappable.
 */
import posthog from "posthog-js";

export function track(event: string, data?: Record<string, unknown>) {
  try {
    // If PostHog is initialised, use it
    if (posthog.__loaded) {
      posthog.capture(event, data);
      return;
    }
  } catch {}

  // Fallback: fire-and-forget to server log.
  // Sends the event name + full payload so no signal is lost when PostHog
  // hasn't initialised yet (e.g. first paint before hydration completes).
  try {
    fetch("/api/telemetry", {
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
