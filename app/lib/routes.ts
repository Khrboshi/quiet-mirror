// app/lib/routes.ts
//
// ════════════════════════════════════════════════════════
// SINGLE SOURCE OF TRUTH FOR INTERNAL CTA DESTINATIONS
// ════════════════════════════════════════════════════════
//
// WHY THIS EXISTS
// ───────────────
// Before this file, every call-to-action hard-coded its own href as a string
// literal. That is a centralization hole: `CONFIG`, `PRICING`, `PAYMENT` and
// `MARKETING` centralise what the words *say*, but nothing centralised where
// the buttons *go*.
//
// The cost was real. The footer link labelled "Start free" pointed at
// `/upgrade` — a page titled "Quiet Mirror Premium · $25/month" — so a visitor
// who clicked the word "free" landed on a price. There was no single file that
// could have caught it, because the destination lived only inside the component.
//
// RULE
// ────
// No component should contain an internal href as a string literal. Import
// from here instead. If a route moves, it moves once.
//
// Note: `pricing` and `startFree` intentionally differ. "Pricing" is a
// navigation destination (show me the plans). "Start free" is a conversion
// action (let me begin). They must never be collapsed into one value.

export const ROUTES = {
  /** Passwordless sign-in / sign-up. The only real conversion endpoint. */
  signIn: "/magic-login",

  /**
   * Where any CTA using the word "free", "start", or "begin" must land.
   * Same target as signIn today; kept separate so the conversion path can
   * change (e.g. a dedicated onboarding route) without touching sign-in.
   */
  startFree: "/magic-login",

  /** Plans and pricing. A navigation destination, never a "start free" target. */
  pricing: "/upgrade",

  /** Public, logged-out proof surface. Linked from the homepage hero. */
  proofExample: "/insights/preview",

  /** Post-authentication landing. */
  dashboard: "/dashboard",
} as const;

/**
 * Attribution helper — appends a `from` parameter for PostHog funnel
 * attribution without forcing call sites to build query strings by hand.
 * See docs/POSTHOG_FUNNEL.md for the upgrade-path funnel this feeds.
 */
export function withSource(route: string, source: string): string {
  return `${route}?from=${encodeURIComponent(source)}`;
}
