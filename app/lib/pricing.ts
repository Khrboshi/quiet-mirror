// app/lib/pricing.ts
// Single source of truth for Havenly pricing.
// Update here and every reference in the app updates automatically.

export const PRICING = {
  /** Monthly price in USD */
  monthlyUsd: 1,
  /** Display string — price only */
  monthly: "$1",
  /** Display string — price + cadence */
  monthlyCadence: "$1/month",
  /** Short value-framing used near the price */
  valueLabel: "Almost Free Of Charge",
} as const;
