import { SupabaseClient } from "@supabase/supabase-js";

const FREE_MONTHLY_CREDITS = 3;
const TRIAL_MONTHLY_CREDITS = 10;

export type PlanType = "FREE" | "TRIAL" | "PREMIUM";

type CreditsRow = {
  user_id: string;
  plan_type: PlanType;
  remaining_credits: number;
  updated_at: string | null;
  renewal_date: string | null;
};

function normalizePlan(v: unknown): PlanType {
  const p = String(v ?? "FREE").toUpperCase();
  if (p === "PREMIUM" || p === "TRIAL") return p as PlanType;
  return "FREE";
}

function isSameUtcMonth(aIso: string, b: Date) {
  const a = new Date(aIso);
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}

async function getCreditsRow(params: {
  supabase: SupabaseClient;
  userId: string;
}): Promise<{ row: CreditsRow | null; err: any | null }> {
  const { supabase, userId } = params;

  const { data, error } = await supabase
    .from("user_credits")
    .select("user_id, plan_type, remaining_credits, updated_at, renewal_date")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { row: null, err: error };
  if (!data) return { row: null, err: null };

  const r: any = data;

  return {
    row: {
      user_id: String(r.user_id),
      plan_type: normalizePlan(r.plan_type),
      remaining_credits: typeof r.remaining_credits === "number" ? r.remaining_credits : 0,
      updated_at: typeof r.updated_at === "string" ? r.updated_at : null,
      renewal_date: typeof r.renewal_date === "string" ? r.renewal_date : null,
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
      remaining_credits: FREE_MONTHLY_CREDITS,
      updated_at: nowIso,
      renewal_date: null,
    } as any,
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
  if (row.remaining_credits > FREE_MONTHLY_CREDITS) {
    await supabase
      .from("user_credits")
      .update({
        remaining_credits: FREE_MONTHLY_CREDITS,
        updated_at: now.toISOString(),
        renewal_date: null,
      } as any)
      .eq("user_id", userId);

    return;
  }

  // Monthly reset for FREE tier
  if (!row.updated_at || !isSameUtcMonth(row.updated_at, now)) {
    await supabase
      .from("user_credits")
      .update({
        remaining_credits: FREE_MONTHLY_CREDITS,
        updated_at: now.toISOString(),
        renewal_date: null,
      } as any)
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
    .update({ remaining_credits: remaining, updated_at: new Date().toISOString() } as any)
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
      ? 9999
      : planType === "TRIAL"
      ? TRIAL_MONTHLY_CREDITS
      : FREE_MONTHLY_CREDITS;

  await supabase.from("user_credits").upsert(
    {
      user_id: userId,
      plan_type: planType,
      remaining_credits,
      updated_at: nowIso,
      renewal_date: null,
    } as any,
    { onConflict: "user_id" }
  );
}
