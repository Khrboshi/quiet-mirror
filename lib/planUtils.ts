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

// ── Shared Supabase row shapes ────────────────────────────────────────────────
// These mirror the columns our AI routes actually SELECT — not the full table.
// Using these instead of `as any` gives us type-safe property access and
// makes it obvious when a query's select() list changes.

/** Row returned by: .from("user_credits").select("plan_type") */
export interface UserCreditsRow {
  plan_type: string | null;
}

/** Row returned by: .from("journal_entries").select("ai_response, created_at") */
export interface JournalAIRow {
  ai_response: string | Record<string, unknown> | null;
  created_at: string | null;
}

/** Row returned by: .from("profiles").select("weekly_summary, weekly_summary_generated_at") */
export interface ProfileSummaryRow {
  weekly_summary: string | null;
  weekly_summary_generated_at: string | null;
}

// ── Groq API response shape ───────────────────────────────────────────────────
// Only the fields our routes actually read from the Groq chat completions API.

export interface GroqChatResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

/** Safely parse an ai_response column value that may be a JSON string or object */
export function parseAIResponse(raw: string | Record<string, unknown> | null): Record<string, unknown> | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return null; }
  }
  return raw;
}
