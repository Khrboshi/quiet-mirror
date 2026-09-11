// app/lib/offer.ts
//
// ════════════════════════════════════════════════════════
// SINGLE SOURCE OF TRUTH FOR THE FREE-VS-PAID PRESENTATION
// ════════════════════════════════════════════════════════
//
// WHY THIS EXISTS
// ───────────────
// `PRICING.earlyAccess` is the correct switch, but before this file every
// component re-derived its own consequences from it. That meant the switch was
// only as complete as the number of places someone remembered to check it —
// and the audit of 2026-09-11 found it wired into 9 files and missing from the
// ones that mattered most:
//
//   app/upgrade/page.tsx                        10 checks — but the FAQ array
//                                               sat outside every one of them,
//                                               so the buttons said "sign up
//                                               free" while the FAQ below said
//                                               "Every new subscription starts
//                                               with a 3-day free trial"
//   app/(protected)/insights/preview/page.tsx    0 checks — the homepage's main
//                                               proof destination showed five
//                                               "$25/month" CTAs and a refund
//                                               line while checkout was blocked
//
// This file closes that hole. `PRICING.earlyAccess` remains the one value to
// edit; `OFFER` names every consequence of it exactly once, so a component
// asks a question ("should I show paid FAQs?") instead of re-deriving an answer.
//
// HOW TO USE
// ──────────
//   import { OFFER } from "@/app/lib/offer";
//   {OFFER.showPaidFaqs && <Faq … />}
//   <Link href={OFFER.conversionCta}>…</Link>
//
// Do NOT write `PRICING.earlyAccess ? … : …` in a component. If you need a
// consequence that is not listed below, add it here and use it everywhere.
//
// TO GO LIVE WITH PAYMENTS
// ────────────────────────
// Set `PRICING.earlyAccess = false` in app/lib/pricing.ts. Nothing else needs
// to change: every flag below inverts and the full paid funnel returns.

import { PRICING } from "./pricing";
import { ROUTES, withSource } from "./routes";

const EARLY_ACCESS: boolean = PRICING.earlyAccess;

export const OFFER = {
  /** Raw state. Prefer a named flag below where one exists. */
  isEarlyAccess: EARLY_ACCESS,

  // ── What may be shown ────────────────────────────────────────────────────

  /**
   * FAQs that describe billing: refund policy, auto-renewal, and the monthly
   * free-reflection cap. All three describe charges that cannot occur while
   * checkout is blocked. README: "The 3-day trial is a future billing
   * configuration, not the current early-access offer; do not present it as
   * active while earlyAccess is true."
   */
  showPaidFaqs: !EARLY_ACCESS,

  /** Trial length, "no charge until day N", and trial badges. */
  showTrialCopy: !EARLY_ACCESS,

  /**
   * Price and refund copy on public proof surfaces (homepage hero,
   * /insights/preview). The price stays visible on /upgrade, where the
   * early-access subline already discloses it honestly as a future cost.
   */
  showPriceOnProofSurfaces: !EARLY_ACCESS,

  /**
   * "Premium" as an upsell label. During early access every feature is
   * unlocked, so badging a card "Premium" describes a gate that is not there.
   */
  showPremiumUpsell: !EARLY_ACCESS,

  /**
   * The monthly free-reflection cap. Not enforced during early access, so
   * quoting the number contradicts the "unlimited" promise elsewhere.
   */
  showFreeCreditCap: !EARLY_ACCESS,

  // ── Where CTAs go ────────────────────────────────────────────────────────

  /**
   * Destination for any primary conversion CTA. During early access there is
   * nothing to buy, so every path leads to signup.
   */
  conversionCta: EARLY_ACCESS ? ROUTES.startFree : ROUTES.pricing,

  /** Same, from the logged-out /insights/preview surface, with attribution. */
  proofCta: EARLY_ACCESS
    ? ROUTES.startFree
    : withSource(ROUTES.pricing, "insights-preview"),
} as const;
