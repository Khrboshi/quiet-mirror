// app/lib/pricing.ts
// Single source of truth for Havenly pricing.
// Update here and every reference in the app updates automatically.
//
// TO CHANGE THE TRIAL LENGTH: edit `trialDays` below.
// Every UI string, logic gate, and Stripe API call derives from it.

const TRIAL_DAYS = 7; // ← the one number to change

export const PRICING = {
  /** Monthly price in USD */
  monthlyUsd: 1,
  /** Display string — price only */
  monthly: "$1",
  /** Display string — price + cadence */
  monthlyCadence: "$1/month",

  // ── Trial ────────────────────────────────────────────────────────────────

  /**
   * Length of the free trial in days.
   * Drives: Stripe checkout, billing page logic, and all UI copy.
   * Change this one value — everything else updates automatically.
   */
  trialDays: TRIAL_DAYS,

  /** "7-day free trial" — short label used in buttons and badges */
  trialLabel: `${TRIAL_DAYS}-day free trial`,

  /** "7-day free trial included" — used in the pricing badge */
  valueLabel: `${TRIAL_DAYS}-day free trial included`,

  /** "Free for 7 days" — used in sub-CTA lines */
  trialFreeFor: `Free for ${TRIAL_DAYS} days`,

  /**
   * "no charge until day 8" — used in refund policy copy.
   * Always one more than trialDays.
   */
  trialNoChargeUntil: `no charge until day ${TRIAL_DAYS + 1}`,
} as const;
