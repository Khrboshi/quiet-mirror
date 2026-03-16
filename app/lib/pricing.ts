// app/lib/pricing.ts
// Single source of truth for Havenly pricing.
// Update here and every reference in the app updates automatically.

export const PRICING = {
  /** Monthly price in USD */
  monthlyUsd: 30,
  /** Display string — price only */
  monthly: "$30",
  /** Display string — price + cadence */
  monthlyCadence: "$30/month",
  /** Short value-framing used near the price */
  valueLabel: "About $1 a day",
} as const;
