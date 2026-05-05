// app/lib/pricing.ts — audited 2026-04-08
// Single source of truth for Quiet Mirror pricing.
// Update here and every reference in the app updates automatically.
//
// TO CHANGE THE TRIAL LENGTH: edit `TRIAL_DAYS` below.
// Every UI string, logic gate, and Stripe API call derives from it.

const TRIAL_DAYS: number = 3; // ← the one number to change
// Derived once here — shared by trialDayWord and trialFreeFor below
const TRIAL_DAY_WORD: string = TRIAL_DAYS === 1 ? "day" : "days";

export const PRICING = {
  /**
   * Monthly price in USD as a raw number. Use this when a consumer
   * needs numeric input (arithmetic, analytics payloads, currency
   * formatters); use `monthly` or `monthlyCadence` for display.
   */
  monthlyUsd: 19,

  /** Display string — price only */
  monthly: "$19",

  /** Display string — price + cadence */
  monthlyCadence: "$19/month",

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

  /** "day" or "days" — singular/plural; use instead of PRICING.trialDays === 1 checks */
  trialDayWord: TRIAL_DAY_WORD,

  /** "Free for 1 day" / "Free for 3 days" — used in sub-CTA lines */
  trialFreeFor: `Free for ${TRIAL_DAYS} ${TRIAL_DAY_WORD}`,

  /**
   * "no charge until day 2" / "no charge until day 4" — refund/charge copy.
   * Always one more than trialDays.
   */
  trialNoChargeUntil: `no charge until day ${TRIAL_DAYS + 1}`,
} as const;
