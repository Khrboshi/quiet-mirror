// app/lib/payment.ts — updated for Paddle migration
// Payment provider abstraction layer.
// All UI components and API routes reference this file — never the provider directly.
//
// ── MIGRATION STATE ─────────────────────────────────────────────────────────
// NEW subscribers  → Paddle  (app/api/paddle/*)
// OLD subscribers  → Stripe  (app/api/stripe/webhook kept running — NEVER TOUCH)
//
// Once all existing Stripe subscriptions have expired, the stripe routes and
// STRIPE_* env vars can be removed. The webhook route must stay forever or
// until confirmed no active Stripe subscriptions remain.
// ────────────────────────────────────────────────────────────────────────────
//
// To switch to another provider in the future:
//   1. Update the API routes in app/api/
//   2. Update the constants below
//   3. Everything in the UI updates automatically — no other files to touch.

export const PAYMENT = {
  /** Display name of the payment provider shown to users */
  providerName: "Paddle",

  /** API route to initiate a checkout session (POST) */
  checkoutApiRoute: "/api/paddle/checkout",

  /** API route to fetch transaction history (GET) */
  invoicesApiRoute: "/api/paddle/transactions",

  /** Returns the URL to the billing portal with a return URL */
  portalUrl: (_returnUrl?: string) => `/api/paddle/portal`,

  /** Label for the button that opens the billing portal */
  portalLabel: "Open billing portal",

  /** Label for the button that manages subscription */
  manageLabel: "Manage subscription",

  /** Short trust line shown near the checkout button */
  checkoutTrustLine: "Secure checkout via Paddle",

  /** Short line shown in billing/transactions pages */
  billingManagedLine: "Billing is managed securely by Paddle.",
} as const;
