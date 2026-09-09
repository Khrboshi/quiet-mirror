// app/(protected)/dashboard/page.tsx
/**
 * app/(protected)/dashboard/page.tsx
 *
 * Server component — fetches dashboard data (entries, credits, plan, streak)
 * and passes it to DashboardClient. Redirects unauthenticated users to /magic-login.
 */
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { parseAIResponse } from "@/lib/planUtils";
import DashboardClient from "./DashboardClient";
import { isFallbackCorepattern } from "@/lib/ai/normalizeInsightSignals";

export const dynamic = "force-dynamic";

// ── Fallback filter (same as insights API) ────────────────────────────────────
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

function isFallback(set: Set<string>, k: string) {
  return set.has((k || "").toLowerCase().trim());
}

// isFallbackCorepattern is imported from lib/ai/normalizeInsightSignals rather
// than duplicated here. The local copy lowercased and trimmed but did not
// normalise U+2018/U+2019, so an AI corepattern beginning "You\u2019re" was never
// recognised as a placeholder and reached lastCorepattern and the dashboard
// personalization card. Found by Sourcery on PR #260.
//
// NOTE: FALLBACK_THEMES and FALLBACK_EMOTIONS above are still local copies and
// have drifted from lib/ai -- this file filters frustration, hurt and longing,
// which lib/ai deliberately preserves as real user emotions, and covers 12 of
// its 37 themes. Deliberately left alone here: reconciling them changes what
// users see and needs its own decision.

function parseAiResponse(raw: string | Record<string, unknown> | null) {
  return parseAIResponse(raw);
}

export type DashboardData = {
  userId: string;
  entryCount: number;
  writingDays: number;
  // Last entry info
  lastEntryId: string | null;
  lastEntryTitle: string | null;
  lastEntryDate: string | null;
  lastEntryHasReflection: boolean;
  // Personalisation from most recent reflection
  lastTopEmotion: string | null;
  lastTopTheme: string | null;
  lastCorepattern: string | null;
  // Did they write today?
  wroteToday: boolean;
  // Did they reflect this week?
  reflectedThisWeek: boolean;
};

export default async function DashboardPage() {
  const supabase = await createServerSupabase();

  // ✅ Use getUser() — authenticates the token with Supabase Auth.
  // getSession() reads the cookie without verifying it, which Supabase warns about.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/magic-login?reason=not_authenticated");

  const userId = user.id;

  // ── Fetch last 30 entries with ai_response for personalisation ────────────
  const { data: rows } = await supabase
    .from("journal_entries")
    .select("id, title, created_at, ai_response")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  const entries = (rows || []) as Array<{
    id: string;
    title: string | null;
    created_at: string;
    ai_response: string | Record<string, unknown> | null;
  }>;

  // ── Count total entries ───────────────────────────────────────────────────
  const { count: entryCount } = await supabase
    .from("journal_entries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  // ── Writing days — distinct calendar days with at least one entry ─────────
  // Fetch all created_at timestamps (lightweight — date only, limit 365).
  const { data: allDates } = await supabase
    .from("journal_entries")
    .select("created_at")
    .eq("user_id", userId)
    .limit(365);

  const writingDays = new Set(
    (allDates ?? []).map((e) => new Date(e.created_at).toISOString().slice(0, 10))
  ).size;

  // ── Last entry ────────────────────────────────────────────────────────────
  const last = entries[0] ?? null;
  const lastEntryId = last?.id ?? null;
  const lastEntryTitle = last?.title ?? null;
  const lastEntryDate = last?.created_at ?? null;
  const lastEntryHasReflection = !!last?.ai_response;

  // ── Today / this week flags ───────────────────────────────────────────────
  const todayKey = new Date().toISOString().slice(0, 10);
  const wroteToday = entries.some(
    (e) => new Date(e.created_at).toISOString().slice(0, 10) === todayKey
  );

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const reflectedThisWeek = entries.some(
    (e) => e.ai_response && new Date(e.created_at).getTime() >= oneWeekAgo
  );

  // ── Personalisation: find most recent reflection with real data ───────────
  let lastTopEmotion: string | null = null;
  let lastTopTheme: string | null = null;
  let lastCorepattern: string | null = null;

  for (const entry of entries) {
    if (!entry.ai_response) continue;
    const parsed = parseAiResponse(entry.ai_response);
    if (!parsed) continue;

    // Find first real (non-fallback) emotion
    if (!lastTopEmotion) {
      const emotions: string[] = Array.isArray(parsed.emotions) ? parsed.emotions : [];
      const realEmotion = emotions.find(
        (e) => typeof e === "string" && e.trim() && !isFallback(FALLBACK_EMOTIONS, e)
      );
      if (realEmotion) {
        lastTopEmotion = realEmotion.charAt(0).toUpperCase() + realEmotion.slice(1);
      }
    }

    // Find first real (non-fallback) theme
    if (!lastTopTheme) {
      const themes: string[] = Array.isArray(parsed.themes) ? parsed.themes : [];
      const realTheme = themes.find(
        (t) => typeof t === "string" && t.trim() && !isFallback(FALLBACK_THEMES, t)
      );
      if (realTheme) {
        lastTopTheme = realTheme.charAt(0).toUpperCase() + realTheme.slice(1);
      }
    }

    // Find most recent non-fallback corepattern
    if (!lastCorepattern) {
      const cp = typeof parsed.corepattern === "string" ? parsed.corepattern.trim() : "";
      if (cp.length >= 20 && !isFallbackCorepattern(cp)) {
        lastCorepattern = cp.charAt(0).toUpperCase() + cp.slice(1);
      }
    }

    if (lastTopEmotion && lastTopTheme && lastCorepattern) break;
  }

  const dashboardData: DashboardData = {
    userId,
    entryCount: entryCount ?? entries.length,
    writingDays,
    lastEntryId,
    lastEntryTitle,
    lastEntryDate,
    lastEntryHasReflection,
    lastTopEmotion,
    lastTopTheme,
    lastCorepattern,
    wroteToday,
    reflectedThisWeek,
  };

  return <DashboardClient data={dashboardData} />;
}
