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
  // Keep this to ensure the plan is up to date for API calls.
  await ensureCreditsFresh({ supabase, userId });

  const { data } = await supabase
    .from("user_credits")
    .select("plan_type")
    .eq("user_id", userId)
    .maybeSingle();

  return normalizePlan((data as any)?.plan_type);
}

/** Normalize keys so you don't get duplicates like "Curiosity" vs "curiosity". */
function canonicalKey(input: unknown): string {
  return String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ");
}

/** Make labels look consistent in UI while preserving hyphens if present. */
function prettyLabel(input: string): string {
  const s = input.trim();
  if (!s) return s;

  // Title-case letters after start / space / hyphen.
  return s.replace(/(^|[\s-])([a-z])/g, (_, p1: string, p2: string) => p1 + p2.toUpperCase());
}

/** Safe parse JSON stored as string/object. */
function parseAIResponse(ai_response: unknown): any | null {
  try {
    if (typeof ai_response === "string") return JSON.parse(ai_response);
    if (ai_response && typeof ai_response === "object") return ai_response;
    return null;
  } catch {
    return null;
  }
}

/** Read list fields that might appear under different keys. */
function pickStringArray(obj: any, keys: string[]): string[] {
  for (const k of keys) {
    const v = obj?.[k];
    if (Array.isArray(v)) {
      return v
        .map((x) => String(x ?? "").trim())
        .filter(Boolean);
    }
  }
  return [];
}

/** Compute simple trend: compare last N entries vs previous N entries (by created_at). */
function computeTrend(
  ordered: Array<{ themes: string[]; emotions: string[] }>,
  windowSize: number
): { up: string[]; down: string[] } {
  const n = ordered.length;
  if (n < 2) return { up: [], down: [] };

  const w = Math.max(1, Math.min(windowSize, Math.floor(n / 2)));
  const recent = ordered.slice(0, w);
  const prev = ordered.slice(w, w * 2);

  const count = (rows: Array<{ themes: string[]; emotions: string[] }>) => {
    const m = new Map<string, number>();
    const bump = (label: string) => m.set(label, (m.get(label) ?? 0) + 1);

    for (const r of rows) {
      // Use both emotions + themes for trend signals (feels more "premium").
      for (const e of r.emotions) bump(e);
      for (const t of r.themes) bump(t);
    }
    return m;
  };

  const rMap = count(recent);
  const pMap = count(prev);

  const allKeys = new Set<string>([...rMap.keys(), ...pMap.keys()]);
  const deltas: Array<{ label: string; delta: number }> = [];

  for (const k of allKeys) {
    const delta = (rMap.get(k) ?? 0) - (pMap.get(k) ?? 0);
    if (delta !== 0) deltas.push({ label: k, delta });
  }

  deltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const up = deltas
    .filter((x) => x.delta > 0)
    .slice(0, 4)
    .map((x) => x.label);

  const down = deltas
    .filter((x) => x.delta < 0)
    .slice(0, 4)
    .map((x) => x.label);

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
  const premiumUnlocked = planType === "PREMIUM" || planType === "TRIAL";

  // Your /insights page already redirects non-premium to /insights/preview,
  // but keep the API guarded too.
  if (!premiumUnlocked) {
    return NextResponse.json(
      { error: "Premium required", premiumUnlocked, planType },
      { status: 402 }
    );
  }

  // Include created_at so we can compute trend.
  const { data: rows, error } = await supabase
    .from("journal_entries")
    .select("ai_response, created_at")
    .eq("user_id", user.id)
    .not("ai_response", "is", null)
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error) {
    return NextResponse.json(
      { error: "Insights data not available yet." },
      { status: 500 }
    );
  }

  // We aggregate with canonical keys to avoid duplicates, and keep a display label.
  const themesCanon = new Map<string, { label: string; count: number }>();
  const emotionsCanon = new Map<string, { label: string; count: number }>();
  const coreCanon = new Map<string, { label: string; count: number }>();

  // For trend windows: store per-entry label lists (pretty labels).
  const orderedForTrend: Array<{ themes: string[]; emotions: string[] }> = [];

  for (const row of rows || []) {
    const parsed = parseAIResponse((row as any).ai_response);
    if (!parsed) continue;

    const rawThemes = pickStringArray(parsed, ["themes", "theme", "topThemes"]);
    const rawEmotions = pickStringArray(parsed, ["emotions", "emotion", "topEmotions"]);

    // Best-effort core patterns (only if present in ai_response)
    const rawCore = pickStringArray(parsed, [
      "corepatterns",
      "corePatterns",
      "core_patterns",
      "core_pattern",
      "patterns",
    ]);

    const entryThemes: string[] = [];
    const entryEmotions: string[] = [];

    for (const item of rawThemes) {
      const canon = canonicalKey(item);
      if (!canon) continue;
      const label = prettyLabel(canon);
      const prev = themesCanon.get(canon);
      themesCanon.set(canon, { label, count: (prev?.count ?? 0) + 1 });
      entryThemes.push(label);
    }

    for (const item of rawEmotions) {
      const canon = canonicalKey(item);
      if (!canon) continue;
      const label = prettyLabel(canon);
      const prev = emotionsCanon.get(canon);
      emotionsCanon.set(canon, { label, count: (prev?.count ?? 0) + 1 });
      entryEmotions.push(label);
    }

    for (const item of rawCore) {
      const canon = canonicalKey(item);
      if (!canon) continue;
      const label = prettyLabel(canon);
      const prev = coreCanon.get(canon);
      coreCanon.set(canon, { label, count: (prev?.count ?? 0) + 1 });
    }

    orderedForTrend.push({ themes: entryThemes, emotions: entryEmotions });
  }

  // Convert maps -> plain objects for JSON.
  const themes: Record<string, number> = {};
  for (const v of themesCanon.values()) themes[v.label] = v.count;

  const emotions: Record<string, number> = {};
  for (const v of emotionsCanon.values()) emotions[v.label] = v.count;

  const corepatterns: Record<string, number> = {};
  for (const v of coreCanon.values()) corepatterns[v.label] = v.count;

  const entryCount = orderedForTrend.length;

  // Decide what "real data" means. You can tune these thresholds.
  const hasRealData =
    entryCount >= 3 && (Object.keys(themes).length > 0 || Object.keys(emotions).length > 0);

  // Trend based on last 6 vs previous 6 (or smaller if not enough entries).
  const trend = computeTrend(orderedForTrend, 6);

  return NextResponse.json(
    {
      premiumUnlocked,
      planType,
      entryCount,
      hasRealData,
      themes,
      emotions,
      // Only include if any exist (keeps payload clean)
      corepatterns: Object.keys(corepatterns).length ? corepatterns : undefined,
      trend:
        (trend.up?.length ?? 0) + (trend.down?.length ?? 0) > 0 ? trend : undefined,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
