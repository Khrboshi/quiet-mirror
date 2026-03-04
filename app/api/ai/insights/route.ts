// app/api/ai/insights/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { ensureCreditsFresh } from "@/lib/creditRules";

export const dynamic = "force-dynamic";

type PlanType = "FREE" | "TRIAL" | "PREMIUM";

function normalizePlan(v: unknown): PlanType {
  const p = String(v ?? "FREE").toUpperCase();
  return p === "PREMIUM" || p === "TRIAL" ? (p as PlanType) : "FREE";
}

async function getUserPlanType(
  supabase: ReturnType<typeof createServerSupabase>,
  userId: string
): Promise<PlanType> {
  await ensureCreditsFresh({ supabase, userId });

  const { data } = await supabase
    .from("user_credits")
    .select("plan_type")
    .eq("user_id", userId)
    .maybeSingle();

  return normalizePlan((data as any)?.plan_type);
}

function inc(map: Record<string, number>, raw: unknown) {
  const k = String(raw ?? "").trim();
  if (!k) return;
  map[k] = (map[k] || 0) + 1;
}

function asArray(v: any): any[] {
  return Array.isArray(v) ? v : [];
}

function parseAiResponse(raw: any) {
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

/**
 * Trend computed from recent vs previous windows.
 * We keep it stable by using entry windows (not time) since created_at might be missing/unstable in some setups.
 */
function computeTrend(opts: {
  rows: Array<{ created_at?: string | null; ai_response: any }>;
  recentN?: number;
  takeTop?: number;
}) {
  const recentN = opts.recentN ?? 10;
  const takeTop = opts.takeTop ?? 6;

  // Sort newest-first if created_at exists, otherwise keep DB order as-is.
  const sorted = [...opts.rows].sort((a, b) => {
    const ta = a.created_at ? Date.parse(a.created_at) : 0;
    const tb = b.created_at ? Date.parse(b.created_at) : 0;
    return tb - ta;
  });

  const recent = sorted.slice(0, recentN);
  const prev = sorted.slice(recentN, recentN * 2);

  const freqRecent: Record<string, number> = {};
  const freqPrev: Record<string, number> = {};

  function addFromRow(target: Record<string, number>, row: any) {
    const parsed = parseAiResponse(row.ai_response);
    if (!parsed) return;

    const themes = asArray(parsed?.themes);
    const emotions = asArray(parsed?.emotions);

    for (const t of themes) inc(target, t);
    for (const e of emotions) inc(target, e);
  }

  for (const r of recent) addFromRow(freqRecent, r);
  for (const r of prev) addFromRow(freqPrev, r);

  // Delta = recent - prev
  const keys = new Set([...Object.keys(freqRecent), ...Object.keys(freqPrev)]);
  const deltas = Array.from(keys).map((k) => ({
    k,
    d: (freqRecent[k] || 0) - (freqPrev[k] || 0),
  }));

  const up = deltas
    .filter((x) => x.d > 0)
    .sort((a, b) => b.d - a.d)
    .slice(0, takeTop)
    .map((x) => x.k);

  const down = deltas
    .filter((x) => x.d < 0)
    .sort((a, b) => a.d - b.d) // most negative first
    .slice(0, takeTop)
    .map((x) => x.k);

  return { up, down };
}

export async function GET() {
  const supabase = createServerSupabase();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const planType = await getUserPlanType(supabase, user.id);
  if (planType !== "PREMIUM" && planType !== "TRIAL") {
    return NextResponse.json({ error: "Premium required" }, { status: 402 });
  }

  // Pull ai_response + created_at (for trend ordering)
  const { data: rows, error } = await supabase
    .from("journal_entries")
    .select("ai_response, created_at")
    .eq("user_id", user.id)
    .not("ai_response", "is", null)
    .limit(2000);

  if (error) {
    return NextResponse.json(
      { error: "Insights data not available yet." },
      { status: 500 }
    );
  }

  const themes: Record<string, number> = {};
  const emotions: Record<string, number> = {};
  const corepatterns: Record<string, number> = {};

  let parsedCount = 0;

  for (const row of rows || []) {
    const parsed = parseAiResponse((row as any).ai_response);
    if (!parsed) continue;

    parsedCount += 1;

    const t = asArray(parsed?.themes);
    const e = asArray(parsed?.emotions);

    for (const item of t) inc(themes, item);
    for (const item of e) inc(emotions, item);

    // Optional: support different key names if you add them later in your AI output
    const cp =
      asArray(parsed?.corepatterns) ||
      asArray(parsed?.core_patterns) ||
      asArray(parsed?.corePatterns);

    for (const item of cp) inc(corepatterns, item);
  }

  const entryCount = parsedCount;

  const hasRealData =
    entryCount >= 5 &&
    (Object.keys(themes).length > 0 || Object.keys(emotions).length > 0);

  const trend = computeTrend({
    rows: (rows as any[]) || [],
    recentN: 10,
    takeTop: 8,
  });

  return NextResponse.json(
    {
      themes,
      emotions,
      corepatterns: Object.keys(corepatterns).length ? corepatterns : undefined,
      entryCount,
      hasRealData,
      trend,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
