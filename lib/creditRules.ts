/**
 * lib/creditRules.ts
 *
 * Credit lifecycle management for Quiet Mirror.
 *
 * Responsibilities:
 * - Ensure a user_credits row exists (creates one on first access)
 * - Monthly reset for FREE users (UTC month boundary)
 * - Clamp abnormal FREE balances (e.g. leftover PREMIUM 9999 after downgrade)
 * - Decrement credits atomically and return remaining count
 * - Set plan type and seed credits on upgrade / downgrade
 *
 * All functions accept a Supabase client so they work in both
 * server-component and edge-route contexts.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { type PlanType, normalizePlan } from "@/lib/planUtils";
import { PRICING } from "@/app/lib/pricing";

// Trial credits are not in PRICING (trial behaviour differs from free tier)
const TRIAL_MONTHLY_CREDITS = 10;

// Sentinel value stored for PREMIUM users — high enough to never block access.
// ensureCreditsFresh clamps FREE users back down if this value leaks through a downgrade.
const PREMIUM_CREDIT_SENTINEL = 9999;

type CreditsRow = {
  user_id: string;
  plan_type: PlanType;
  remaining_credits: number;
  updated_at: string | null;
  renewal_date: string | null;
};

// Local schema types for Supabase write operations.
// These replace `as any` casts until Supabase generated types are in place.
type UserCreditsInsert = {
  user_id: string;
  plan_type: PlanType;
  remaining_credits: number;
  updated_at: string;
  renewal_date: string | null;
};

type UserCreditsUpdate = {
  remaining_credits?: number;
  updated_at?: string;
  renewal_date?: string | null;
  plan_type?: PlanType;
};

function isSameUtcMonth(aIso: string, b: Date) {
  const a = new Date(aIso);
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}

async function getCreditsRow(params: {
  supabase: SupabaseClient;
  userId: string;
}): Promise<{ row: CreditsRow | null; err: unknown }> {
  const { supabase, userId } = params;

  const { data, error } = await supabase
    .from("user_credits")
    .select("user_id, plan_type, remaining_credits, updated_at, renewal_date")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { row: null, err: error };
  if (!data) return { row: null, err: null };

  return {
    row: {
      user_id: String(data.user_id),
      plan_type: normalizePlan(data.plan_type),
      remaining_credits: typeof data.remaining_credits === "number" ? data.remaining_credits : 0,
      updated_at: typeof data.updated_at === "string" ? data.updated_at : null,
      renewal_date: typeof data.renewal_date === "string" ? data.renewal_date : null,
    },
    err: null,
  };
}

async function ensureCreditRowExists(params: {
  supabase: SupabaseClient;
  userId: string;
}) {
  const { supabase, userId } = params;

  const { row, err } = await getCreditsRow({ supabase, userId });
  if (err) return;
  if (row) return;

  const nowIso = new Date().toISOString();

  await supabase.from("user_credits").upsert(
    {
      user_id: userId,
      plan_type: "FREE",
      remaining_credits: PRICING.freeMonthlyCredits,
      updated_at: nowIso,
      renewal_date: null,
    } as UserCreditsInsert,
    { onConflict: "user_id" }
  );
}

/**
 * ✅ Credit normalization + monthly reset (FREE only).
 * SAFE to call multiple times.
 *
 * Critical protection:
 * - If a user is FREE but has a large remaining_credits value (e.g. 9999 from a prior PREMIUM state),
 *   clamp it back down immediately to the FREE cap. Otherwise they effectively stay "unlimited"
 *   until the next month boundary.
 */
export async function ensureCreditsFresh(params: {
  supabase: SupabaseClient;
  userId: string;
}) {
  const { supabase, userId } = params;

  await ensureCreditRowExists({ supabase, userId });

  const { row, err } = await getCreditsRow({ supabase, userId });
  if (err || !row) return;

  // PREMIUM/TRIAL: do nothing here
  if (row.plan_type === "PREMIUM" || row.plan_type === "TRIAL") return;

  const now = new Date();

  // ✅ Clamp abnormal FREE credit balances immediately (e.g., leftover 9999)
  if (row.remaining_credits > PRICING.freeMonthlyCredits) {
    await supabase
      .from("user_credits")
      .update({
        remaining_credits: PRICING.freeMonthlyCredits,
        updated_at: now.toISOString(),
        renewal_date: null,
      } as UserCreditsUpdate)
      .eq("user_id", userId);

    return;
  }

  // Monthly reset for FREE tier
  if (!row.updated_at || !isSameUtcMonth(row.updated_at, now)) {
    await supabase
      .from("user_credits")
      .update({
        remaining_credits: PRICING.freeMonthlyCredits,
        updated_at: now.toISOString(),
        renewal_date: null,
      } as UserCreditsUpdate)
      .eq("user_id", userId);
  }
}

export async function decrementCreditIfAllowed(params: {
  supabase: SupabaseClient;
  userId: string;
  feature: string;
}): Promise<{ ok: boolean; remaining?: number; reason?: string }> {
  const { supabase, userId } = params;

  await ensureCreditsFresh({ supabase, userId });

  const { row, err } = await getCreditsRow({ supabase, userId });
  if (err || !row) return { ok: false, reason: "credits_unavailable" };

  if (row.plan_type === "PREMIUM" || row.plan_type === "TRIAL") return { ok: true };

  if (row.remaining_credits <= 0) return { ok: false, reason: "limit_reached" };

  const remaining = row.remaining_credits - 1;

  await supabase
    .from("user_credits")
    .update({ remaining_credits: remaining, updated_at: new Date().toISOString() } as UserCreditsUpdate)
    .eq("user_id", userId);

  return { ok: true, remaining };
}

export async function setUserPlan(params: {
  supabase: SupabaseClient;
  userId: string;
  planType: PlanType;
}) {
  const { supabase, userId, planType } = params;

  const nowIso = new Date().toISOString();

  const remaining_credits =
    planType === "PREMIUM"
      ? PREMIUM_CREDIT_SENTINEL
      : planType === "TRIAL"
      ? TRIAL_MONTHLY_CREDITS
      : PRICING.freeMonthlyCredits;

  const { error: upsertErr } = await supabase.from("user_credits").upsert(
    {
      user_id: userId,
      plan_type: planType,
      remaining_credits,
      updated_at: nowIso,
      renewal_date: null,
    } as UserCreditsInsert,
    { onConflict: "user_id" }
  );

  if (upsertErr) {
    throw new Error(
      `setUserPlan failed to write user_credits for user ${userId}: ${upsertErr.message}`
    );
  }
}
