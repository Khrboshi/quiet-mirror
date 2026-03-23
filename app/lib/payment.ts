// app/lib/payment.ts
// Payment provider abstraction layer.
// All UI components and API routes reference this file — never the provider directly.
// To switch from Stripe to Lemon Squeezy (or any other provider):
//   1. Update the API routes in app/api/ to call the new provider
//   2. Update the constants below to point to the new endpoints/labels
//   3. Everything in the UI updates automatically — no other files to touch.

export const PAYMENT = {
  /** Display name of the payment provider shown to users */
  providerName: "Stripe",

  /** API route to initiate a checkout session (POST) */
  checkoutApiRoute: "/api/stripe/checkout",

  /** API route to fetch invoice history (GET) */
  invoicesApiRoute: "/api/stripe/invoices",

  /** Returns the URL to the billing portal with a return URL */
  portalUrl: (returnUrl: string) =>
    `/api/stripe/portal?returnUrl=${encodeURIComponent(returnUrl)}`,

  /** Label for the button that opens the billing portal */
  portalLabel: "Open Stripe portal",

  /** Label for the button that manages subscription */
  manageLabel: "Manage subscription",

  /** Short trust line shown near the checkout button */
  checkoutTrustLine: "Secure checkout via Stripe",

  /** Short line shown in billing/transactions pages */
  billingManagedLine: "Billing is managed securely by Stripe.",
} as const;
