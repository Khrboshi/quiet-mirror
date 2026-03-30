// lib/planUtils.ts
// Single source of truth for plan type definitions and normalisation.
//
// Previously duplicated in:
//   - app/api/ai/reflection/route.ts
//   - app/api/ai/insights/route.ts
//   - app/api/ai/weekly-summary/route.ts
//   - app/api/user/plan/route.ts
//   - app/components/useUserPlan.ts
//
// To add a new plan tier: update PlanType here — all routes update automatically.

export type PlanType = "FREE" | "TRIAL" | "PREMIUM";

/**
 * Coerces any unknown value from the database into a valid PlanType.
 * Defaults to "FREE" for null, undefined, or unrecognised strings.
 *
 * @example
 * normalizePlan("premium")  // → "PREMIUM"
 * normalizePlan(null)        // → "FREE"
 * normalizePlan("expired")   // → "FREE"
 */
export function normalizePlan(v: unknown): PlanType {
  const p = String(v ?? "FREE").toUpperCase();
  return p === "PREMIUM" || p === "TRIAL" ? (p as PlanType) : "FREE";
}
