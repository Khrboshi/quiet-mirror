// app/lib/payment.ts
// Payment provider abstraction layer.
// All UI components and API routes reference this file — never the provider directly.
//
// ── MIGRATION STATE ─────────────────────────────────────────────────────────
// NEW subscribers  → Dodo Payments  (app/api/dodo/*)
// OLD subscribers  → Stripe webhook only (app/api/stripe/webhook — NEVER TOUCH)
//
// stripe/checkout, stripe/invoices, and stripe/portal were retired — confirmed
// zero callers; all UI routes through PAYMENT.* → /api/dodo/*.
//
// Remaining Stripe surface:
//   app/api/stripe/webhook/route.ts — keep until all legacy Stripe
//   subscriptions have expired and are confirmed inactive.
//   Env vars still needed: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.
//   Env vars now unused:   STRIPE_PRICE_ID, STRIPE_PORTAL_RETURN_URL
//   (safe to remove from Vercel once confirmed no rollback is needed).
// ────────────────────────────────────────────────────────────────────────────
//
// To switch to another provider in the future:
//   1. Update the API routes in app/api/
//   2. Update the constants below
//   3. Everything in the UI updates automatically — no other files to touch.

export const PAYMENT = {
  /** Display name of the payment provider shown to users */
  providerName: "Dodo Payments",

  /** API route to initiate a checkout session (POST) — returns { checkoutUrl } */
  checkoutApiRoute: "/api/dodo/checkout",

  /** API route to fetch payment history (GET) */
  invoicesApiRoute: "/api/dodo/transactions",

  /** Returns the URL to the billing portal (GET redirect) */
  portalUrl: (_returnUrl?: string) => `/api/dodo/portal`,

  /** Label for the button that opens the billing portal */
  portalLabel: "Open billing portal",

  /** Label for the button that manages subscription */
  manageLabel: "Manage subscription",

  /** Short trust line shown near the checkout button */
  checkoutTrustLine: "Secure checkout via Dodo Payments",

  /** Short line shown in billing/transactions pages */
  billingManagedLine: "Billing is managed securely by Dodo Payments.",
} as const;
