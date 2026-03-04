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

function sortMap(map: Record<string, number>) {
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function weekStartISO(d: Date) {
  // Monday-based week start
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = x.getUTCDay(); // 0=Sun ... 6=Sat
  const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
  x.setUTCDate(x.getUTCDate() + diff);
  return x.toISOString().slice(0, 10); // YYYY-MM-DD
}

function buildWeekKeys(lastNWeeks: number) {
  const keys: string[] = [];
  const now = new Date();
  // start from current week start
  const start = new Date(Date.parse(weekStartISO(now) + "T00:00:00.000Z"));
  for (let i = lastNWeeks - 1; i >= 0; i--) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() - i * 7);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

function computeTrend(opts: {
  rows: Array<{ created_at?: string | null; ai_response: any }>;
  recentN?: number;
  takeTop?: number;
}) {
  const recentN = opts.recentN ?? 10;
  const takeTop = opts.takeTop ?? 8;

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

    for (const t of asArray(parsed?.themes)) inc(target, t);
    for (const e of asArray(parsed?.emotions)) inc(target, e);
  }

  for (const r of recent) addFromRow(freqRecent, r);
  for (const r of prev) addFromRow(freqPrev, r);

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
    .sort((a, b) => a.d - b.d)
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

  // Weekly buckets (last 8 weeks)
  const weekKeys = buildWeekKeys(8);
  const weeklyThemes: Record<string, Record<string, number>> = {};
  const weeklyEmotions: Record<string, Record<string, number>> = {};
  for (const wk of weekKeys) {
    weeklyThemes[wk] = {};
    weeklyEmotions[wk] = {};
  }

  for (const row of rows || []) {
    const parsed = parseAiResponse((row as any).ai_response);
    if (!parsed) continue;

    parsedCount += 1;

    const t = asArray(parsed?.themes);
    const e = asArray(parsed?.emotions);

    for (const item of t) inc(themes, item);
    for (const item of e) inc(emotions, item);

    const cp =
      asArray(parsed?.corepatterns) ||
      asArray(parsed?.core_patterns) ||
      asArray(parsed?.corePatterns);

    for (const item of cp) inc(corepatterns, item);

    // weekly
    const ca = (row as any).created_at ? new Date((row as any).created_at) : null;
    if (ca) {
      const wk = weekStartISO(ca);
      if (weeklyThemes[wk]) {
        for (const item of t) inc(weeklyThemes[wk], item);
        for (const item of e) inc(weeklyEmotions[wk], item);
      }
    }
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

  // Pick top items overall, then build per-week series arrays
  const topThemeKeys = sortMap(themes).slice(0, 5).map(([k]) => k);
  const topEmotionKeys = sortMap(emotions).slice(0, 5).map(([k]) => k);

  const seriesThemes = topThemeKeys.map((k) => ({
    key: k,
    counts: weekKeys.map((wk) => weeklyThemes[wk]?.[k] || 0),
  }));

  const seriesEmotions = topEmotionKeys.map((k) => ({
    key: k,
    counts: weekKeys.map((wk) => weeklyEmotions[wk]?.[k] || 0),
  }));

  return NextResponse.json(
    {
      themes,
      emotions,
      corepatterns: Object.keys(corepatterns).length ? corepatterns : undefined,
      entryCount,
      hasRealData,
      trend,
      weekly: {
        weeks: weekKeys, // YYYY-MM-DD week starts (Mon)
        themes: seriesThemes, // [{ key, counts: [..8] }]
        emotions: seriesEmotions, // [{ key, counts: [..8] }]
      },
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
