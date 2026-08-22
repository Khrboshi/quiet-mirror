/**
 * app/api/user/plan/route.ts
 *
 * GET — Returns the current user's plan type, credit count, and renewal date.
 *       Consumed by useUserPlan() on every protected page mount.
 *
 * Returns 401 (not 200+FREE) on auth failure — prevents silent plan
 * degradation masking session expiry from the client hook.
 * Always sets Cache-Control: no-store so stale plan data never lingers.
 */
import { NextResponse } from "next/server";
import { createAdminSupabase, createServerSupabase } from "@/lib/supabase/server";
import { ensureCreditsFresh } from "@/lib/creditRules";
import { type PlanType, normalizePlan } from "@/lib/planUtils";
import { PRICING } from "@/app/lib/pricing";
import { setUserPlan } from "@/lib/creditRules";
import type { UserCreditsRow } from "@/lib/supabaseTypes";

export const dynamic = "force-dynamic";

function safeJson(data: {
  planType: PlanType;
  credits: number;
  renewalDate: string | null;
  trialEndsAt: string | null;
  earlyAccessEndsAt: string | null;
  storedPlanType: PlanType;
  effectivePlanType: PlanType;
}) {
  return NextResponse.json(
    {
      planType: data.effectivePlanType,
      plan: data.effectivePlanType,
      storedPlanType: data.storedPlanType,
      effectivePlanType: data.effectivePlanType,
      trialEndsAt: data.trialEndsAt,
      earlyAccessEndsAt: data.earlyAccessEndsAt, // backward compatibility
      credits: data.credits,
      renewalDate: data.renewalDate,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

export async function GET() {
  try {
    const supabase = await createServerSupabase();

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      // Return 401 rather than 200+FREE — silent plan degradation on session
      // expiry was masking auth failures from the client. The useUserPlan hook
      // already handles non-OK responses gracefully without smashing cached state.
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    await ensureCreditsFresh({ supabase, userId: user.id });

    const { data, error } = await supabase
      .from("user_credits")
      .select("plan_type, remaining_credits, renewal_date, trial_ends_at, early_access_ends_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !data) {
      return safeJson({ planType: "FREE", credits: 0, renewalDate: null, trialEndsAt: null, earlyAccessEndsAt: null, storedPlanType: "FREE", effectivePlanType: PRICING.earlyAccess ? "EARLY_ACCESS" : "FREE" });
    }

    const row = data as UserCreditsRow;
    const storedPlanType = normalizePlan(row.plan_type);
    const trialEndsAt = typeof row.trial_ends_at === "string" ? row.trial_ends_at : null;
    if (storedPlanType === "TRIAL" && trialEndsAt && new Date(trialEndsAt).getTime() <= Date.now()) {
      await setUserPlan({ supabase: createAdminSupabase(), userId: user.id, planType: "FREE" });
      return safeJson({ planType: "FREE", credits: 0, renewalDate: null, trialEndsAt: null, earlyAccessEndsAt: null, storedPlanType: "FREE", effectivePlanType: PRICING.earlyAccess ? "EARLY_ACCESS" : "FREE" });
    }
    const effectivePlanType = PRICING.earlyAccess && storedPlanType === "FREE" ? "EARLY_ACCESS" : storedPlanType;
    return safeJson({
      planType: effectivePlanType,
      credits: typeof row.remaining_credits === "number" ? row.remaining_credits : 0,
      renewalDate: typeof row.renewal_date === "string" ? row.renewal_date : null,
      trialEndsAt,
      earlyAccessEndsAt: typeof row.early_access_ends_at === "string" ? row.early_access_ends_at : null,
      storedPlanType,
      effectivePlanType,
    });
  } catch (err) {
    console.error("GET /api/user/plan failed:", err);
    return safeJson({ planType: "FREE", credits: 0, renewalDate: null, trialEndsAt: null, earlyAccessEndsAt: null, storedPlanType: "FREE", effectivePlanType: PRICING.earlyAccess ? "EARLY_ACCESS" : "FREE" });
  }
}
