// app/api/ai/insights/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { ensureCreditsFresh } from "@/lib/creditRules";
import {
  bucketCorepattern,
  normalizeAIResponseSignals,
} from "@/lib/ai/normalizeInsightSignals";
import { type PlanType, normalizePlan } from "@/lib/planUtils";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

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

function isoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, "0")}`;
}

function sortedWeeks(keys: string[]): string[] {
  return [...new Set(keys)].sort();
}

export async function GET() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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
    .order("created_at", { ascending: true })
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
  const domains: Record<string, number> = {};

  const weeklyThemes: Record<string, Record<string, number>> = {};
  const weeklyEmotions: Record<string, Record<string, number>> = {};

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

    const normalized = normalizeAIResponseSignals(parsed);

    entryCount++;
    const entryDate = new Date((row as any).created_at ?? now);
    if (!firstEntryDate) firstEntryDate = entryDate;
    lastEntryDate = entryDate;

    const weekKey = isoWeek(entryDate);
    const age = now - entryDate.getTime();
    const isRecent = age <= FOUR_WEEKS;
    const isOlder = age > FOUR_WEEKS && age <= FOUR_WEEKS * 2;

    if (normalized.domain) {
      domains[normalized.domain] = (domains[normalized.domain] || 0) + 1;
    }

    for (const d of normalized.themes) {
      themes[d] = (themes[d] || 0) + 1;
      if (!weeklyThemes[weekKey]) weeklyThemes[weekKey] = {};
      weeklyThemes[weekKey][d] = (weeklyThemes[weekKey][d] || 0) + 1;
      if (isRecent) recentThemes[d] = (recentThemes[d] || 0) + 1;
      if (isOlder) olderThemes[d] = (olderThemes[d] || 0) + 1;
    }

    for (const d of normalized.emotions) {
      emotions[d] = (emotions[d] || 0) + 1;
      if (!weeklyEmotions[weekKey]) weeklyEmotions[weekKey] = {};
      weeklyEmotions[weekKey][d] = (weeklyEmotions[weekKey][d] || 0) + 1;
      if (isRecent) recentEmotions[d] = (recentEmotions[d] || 0) + 1;
      if (isOlder) olderEmotions[d] = (olderEmotions[d] || 0) + 1;
    }

    if (normalized.corepattern) {
      const bucketed = bucketCorepattern(normalized.corepattern);
      corepatterns[bucketed] = (corepatterns[bucketed] || 0) + 1;
    }
  }

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

  const themeSparklines: Record<string, number[]> = {};
  for (const k of topThemeKeys) {
    themeSparklines[k] = allWeeks.map((w) => weeklyThemes[w]?.[k] ?? 0);
  }

  const emotionSparklines: Record<string, number[]> = {};
  for (const k of topEmotionKeys) {
    emotionSparklines[k] = allWeeks.map((w) => weeklyEmotions[w]?.[k] ?? 0);
  }

  const trendUp: string[] = [];
  const trendDown: string[] = [];

  for (const [e, rc] of Object.entries(recentEmotions)) {
    if (rc > (olderEmotions[e] ?? 0) + 1) trendUp.push(e);
  }
  for (const [e, oc] of Object.entries(olderEmotions)) {
    if (oc > (recentEmotions[e] ?? 0) + 1) trendDown.push(e);
  }

  const POSITIVE_EMOTIONS = new Set([
    "calm",
    "hope",
    "hopeful",
    "joy",
    "joyful",
    "proud",
    "gratitude",
    "grateful",
    "relief",
    "excited",
    "excitement",
    "contentment",
    "content",
    "clarity",
    "clear",
    "motivated",
    "empowered",
    "open",
    "light",
    "energised",
    "energized",
    "curious",
    "optimistic",
  ]);

  const HEAVY_EMOTIONS = new Set([
    "dread",
    "despair",
    "hopeless",
    "numb",
    "exhaustion",
    "overwhelm",
    "trapped",
    "stuck",
    "grief",
    "shame",
    "guilt",
    "worthless",
    "powerless",
    "defeated",
    "withdrawn",
    "isolated",
    "fear",
    "anxiety",
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

  const { count: totalEntryCount } = await supabase
    .from("journal_entries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return NextResponse.json(
    {
      themes,
      emotions,
      corepatterns,
      entryCount,
      totalEntryCount: totalEntryCount ?? entryCount,
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
      domains,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
