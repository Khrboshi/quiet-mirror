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

// ─── Fallback pollution filter ────────────────────────────────────────────────
const FALLBACK_THEMES = new Set([
  "self-awareness", "processing", "presence",
  "consistency", "recovery", "self-respect", "motivation",
  "recognition", "boundaries", "self-worth",
  "connection", "visibility",
]);
const FALLBACK_EMOTIONS = new Set([
  "uncertainty", "restlessness", "quiet courage",
  "pride", "tiredness", "determination",
  "frustration", "hurt", "longing", "confusion",
]);
// All 4 domain template fallback corepatterns — exact match (case-insensitive prefix)
const FALLBACK_COREPATTERNS = new Set([
  "you're in the middle of something",
  "you're proud of progress, but still learning the line",
  "you're navigating a tension between your professional self-worth",
  "you're trying to protect your self-respect while staying connected",
]);

const isFallback = (set: Set<string>, k: string) =>
  set.has(k.toLowerCase().trim());

function isFallbackCP(k: string): boolean {
  const lower = k.toLowerCase().trim();
  for (const prefix of FALLBACK_COREPATTERNS) {
    if (lower.startsWith(prefix)) return true;
  }
  return false;
}

function display(k: string) {
  const t = k.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// ─── Week-bucket helpers ──────────────────────────────────────────────────────
// Returns ISO week key "YYYY-WW" for a date
function isoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, "0")}`;
}

// Sort week keys chronologically
function sortedWeeks(keys: string[]): string[] {
  return [...new Set(keys)].sort();
}

// ─────────────────────────────────────────────────────────────────────────────

export async function GET() {
  const supabase = createServerSupabase();

  // ✅ getSession — cookie-local read, no network call
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const planType = await getUserPlanType(supabase, session.user.id);
  if (planType !== "PREMIUM" && planType !== "TRIAL") {
    return NextResponse.json({ error: "Premium required" }, { status: 402 });
  }

  const { data: rows, error } = await supabase
    .from("journal_entries")
    .select("ai_response, created_at")
    .eq("user_id", session.user.id)
    .not("ai_response", "is", null)
    .order("created_at", { ascending: true }) // oldest first for timeline
    .limit(2000);

  if (error) {
    return NextResponse.json(
      { error: "Insights data not available yet." },
      { status: 500 }
    );
  }

  // ── Aggregation buckets ────────────────────────────────────────────────────
  const themes: Record<string, number> = {};
  const emotions: Record<string, number> = {};
  const corepatterns: Record<string, number> = {};

  // Weekly: { [week]: { [emotion|theme]: count } }
  const weeklyThemes: Record<string, Record<string, number>> = {};
  const weeklyEmotions: Record<string, Record<string, number>> = {};

  // Trend window: last 4 weeks vs prior 4 weeks
  const now = Date.now();
  const FOUR_WEEKS = 28 * 24 * 60 * 60 * 1000;
  const recentEmotions: Record<string, number> = {};
  const olderEmotions: Record<string, number> = {};
  const recentThemes: Record<string, number> = {};
  const olderThemes: Record<string, number> = {};

  let entryCount = 0;
  let firstEntryDate: Date | null = null;
  let lastEntryDate: Date | null = null;

  for (const row of rows || []) {
    let parsed: any = null;
    try {
      parsed =
        typeof (row as any).ai_response === "string"
          ? JSON.parse((row as any).ai_response)
          : (row as any).ai_response;
    } catch {
      continue;
    }

    entryCount++;
    const entryDate = new Date((row as any).created_at ?? now);
    if (!firstEntryDate) firstEntryDate = entryDate;
    lastEntryDate = entryDate;

    const weekKey = isoWeek(entryDate);
    const age = now - entryDate.getTime();
    const isRecent = age <= FOUR_WEEKS;
    const isOlder = age > FOUR_WEEKS && age <= FOUR_WEEKS * 2;

    // Themes
    for (const item of Array.isArray(parsed?.themes) ? parsed.themes : []) {
      const k = String(item || "").trim();
      if (!k || isFallback(FALLBACK_THEMES, k)) continue;
      const d = display(k);
      themes[d] = (themes[d] || 0) + 1;
      if (!weeklyThemes[weekKey]) weeklyThemes[weekKey] = {};
      weeklyThemes[weekKey][d] = (weeklyThemes[weekKey][d] || 0) + 1;
      if (isRecent) recentThemes[d] = (recentThemes[d] || 0) + 1;
      if (isOlder) olderThemes[d] = (olderThemes[d] || 0) + 1;
    }

    // Emotions
    for (const item of Array.isArray(parsed?.emotions) ? parsed.emotions : []) {
      const k = String(item || "").trim();
      if (!k || isFallback(FALLBACK_EMOTIONS, k)) continue;
      const d = display(k);
      emotions[d] = (emotions[d] || 0) + 1;
      if (!weeklyEmotions[weekKey]) weeklyEmotions[weekKey] = {};
      weeklyEmotions[weekKey][d] = (weeklyEmotions[weekKey][d] || 0) + 1;
      if (isRecent) recentEmotions[d] = (recentEmotions[d] || 0) + 1;
      if (isOlder) olderEmotions[d] = (olderEmotions[d] || 0) + 1;
    }

    // Corepatterns
    const cp =
      typeof parsed?.corepattern === "string" ? parsed.corepattern.trim() : "";
    if (
      cp.length >= 20 &&
      cp.length <= 200 &&
      !isFallbackCP(cp)
    ) {
      const d = display(cp);
      corepatterns[d] = (corepatterns[d] || 0) + 1;
    }
  }

  // ── Weekly sparkline data for top 4 themes + top 4 emotions ──────────────
  // Only last 8 weeks for readability
  const allWeeks = sortedWeeks([
    ...Object.keys(weeklyThemes),
    ...Object.keys(weeklyEmotions),
  ]).slice(-8);

  const topThemeKeys = Object.entries(themes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k]) => k);

  const topEmotionKeys = Object.entries(emotions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k]) => k);

  // sparkline: array of weekly counts, one per week in allWeeks
  const themeSparklines: Record<string, number[]> = {};
  for (const k of topThemeKeys) {
    themeSparklines[k] = allWeeks.map((w) => weeklyThemes[w]?.[k] ?? 0);
  }

  const emotionSparklines: Record<string, number[]> = {};
  for (const k of topEmotionKeys) {
    emotionSparklines[k] = allWeeks.map((w) => weeklyEmotions[w]?.[k] ?? 0);
  }

  // ── Trend ──────────────────────────────────────────────────────────────────
  const trendUp: string[] = [];
  const trendDown: string[] = [];
  for (const [e, rc] of Object.entries(recentEmotions)) {
    if (rc > (olderEmotions[e] ?? 0) + 1) trendUp.push(e);
  }
  for (const [e, oc] of Object.entries(olderEmotions)) {
    if (oc > (recentEmotions[e] ?? 0) + 1) trendDown.push(e);
  }

  // ── Momentum word ─────────────────────────────────────────────────────────
  // Compares recent vs older emotion landscape for a single-word label.
  // Based on balance of positive/active vs heavy/withdrawing emotions.
  const POSITIVE_EMOTIONS = new Set([
    "calm", "hope", "hopeful", "joy", "joyful", "proud", "gratitude",
    "grateful", "relief", "excited", "excitement", "contentment", "content",
    "clarity", "clear", "motivated", "empowered", "open", "light",
    "energised", "energized", "curious", "optimistic",
  ]);
  const HEAVY_EMOTIONS = new Set([
    "dread", "despair", "hopeless", "numb", "exhausted", "overwhelmed",
    "trapped", "stuck", "grief", "shame", "guilt", "worthless",
    "powerless", "defeated", "withdrawn", "isolated",
  ]);

  let positiveScore = 0;
  let heavyScore = 0;
  for (const [e, c] of Object.entries(recentEmotions)) {
    if (POSITIVE_EMOTIONS.has(e.toLowerCase())) positiveScore += c;
    if (HEAVY_EMOTIONS.has(e.toLowerCase())) heavyScore += c;
  }

  let momentum = "Steady";
  if (positiveScore > heavyScore + 2) momentum = "Lifting";
  else if (heavyScore > positiveScore + 2) momentum = "Heavy";
  else if (trendUp.length > trendDown.length) momentum = "Shifting";
  else if (trendDown.length > trendUp.length) momentum = "Softening";

  const hasRealData =
    Object.keys(themes).length >= 2 || Object.keys(emotions).length >= 2;

  // Total entries (including those not yet reflected on)
  const { count: totalEntryCount } = await supabase
    .from("journal_entries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", session.user.id);

  return NextResponse.json(
    {
      themes,
      emotions,
      corepatterns,
      entryCount,           // entries WITH reflections (used for pattern quality gate)
      totalEntryCount: totalEntryCount ?? entryCount, // ALL entries (shown in header)
      hasRealData,
      firstEntryDate: firstEntryDate?.toISOString() ?? null,
      lastEntryDate: lastEntryDate?.toISOString() ?? null,
      weeklyTrend: {
        weeks: allWeeks,
        themes: themeSparklines,
        emotions: emotionSparklines,
      },
      trend: { up: trendUp.slice(0, 4), down: trendDown.slice(0, 4) },
      momentum,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
