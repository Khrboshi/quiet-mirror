// app/lib/pricing.ts
// Single source of truth for Quiet Mirror pricing.
// Update here and every reference in the app updates automatically.
//
// TO CHANGE THE TRIAL LENGTH: edit `TRIAL_DAYS` below.
// Every UI string, logic gate, and Stripe API call derives from it.

const TRIAL_DAYS = 1; // ← the one number to change

export const PRICING = {
  /** Monthly price in USD */
  monthlyUsd: 9,

  /** Display string — price only */
  monthly: "$9",

  /** Display string — price + cadence */
  monthlyCadence: "$9/month",

  // ── Trial ────────────────────────────────────────────────────────────────

  // ── Free tier ─────────────────────────────────────────────────────────────

  /**
   * Number of AI reflections a free-plan user gets per month.
   * Change this one value — the reflection API route enforces it automatically.
   */
  freeMonthlyCredits: 3,

  // ── Trial ─────────────────────────────────────────────────────────────────

  /**
   * Length of the free trial in days.
   * Drives: Stripe checkout, billing page logic, and all UI copy.
   * Change this one value — everything else updates automatically.
   */
  trialDays: TRIAL_DAYS,

  /** "1-day free trial" — short label used in buttons and badges */
  trialLabel: `${TRIAL_DAYS}-day free trial`,

  /** "1-day free trial included" — used in the pricing badge */
  valueLabel: `${TRIAL_DAYS}-day free trial included`,

  /** "Free for 1 day" / "Free for 7 days" — used in sub-CTA lines */
  trialFreeFor: `Free for ${TRIAL_DAYS} day${TRIAL_DAYS === 1 ? "" : "s"}`,

  /**
   * "no charge until day 2" / "no charge until day 8" — refund/charge copy.
   * Always one more than trialDays.
   */
  trialNoChargeUntil: `no charge until day ${TRIAL_DAYS + 1}`,
} as const;
