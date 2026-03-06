// app/(protected)/insights/preview/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import UpgradeIntentTracker from "@/app/components/UpgradeIntentTracker";

// ── Pull real aggregated data for the free user ───────────────────────────────

async function getUserInsightData(userId: string) {
  const supabase = createServerSupabase();

  const { data: rows } = await supabase
    .from("journal_entries")
    .select("ai_response, created_at")
    .eq("user_id", userId)
    .not("ai_response", "is", null)
    .order("created_at", { ascending: false })
    .limit(200);

  const themes: Record<string, number> = {};
  const emotions: Record<string, number> = {};
  const domains: Record<string, number> = {};
  let entryCount = 0;

  const FALLBACK_THEMES = new Set(["self-awareness", "processing", "presence",
    "consistency", "recovery", "self-respect", "motivation", "recognition",
    "boundaries", "self-worth", "connection", "visibility"]);
  const FALLBACK_EMOTIONS = new Set(["uncertainty", "restlessness", "quiet courage",
    "pride", "tiredness", "determination", "frustration", "hurt", "longing", "confusion"]);

  for (const row of rows ?? []) {
    let parsed: any = null;
    try {
      parsed = typeof row.ai_response === "string"
        ? JSON.parse(row.ai_response) : row.ai_response;
    } catch { continue; }

    entryCount++;

    for (const t of Array.isArray(parsed?.themes) ? parsed.themes : []) {
      const k = String(t || "").trim().toLowerCase();
      if (!k || FALLBACK_THEMES.has(k)) continue;
      themes[k] = (themes[k] || 0) + 1;
    }
    for (const e of Array.isArray(parsed?.emotions) ? parsed.emotions : []) {
      const k = String(e || "").trim().toLowerCase();
      if (!k || FALLBACK_EMOTIONS.has(k)) continue;
      emotions[k] = (emotions[k] || 0) + 1;
    }
    const domain = typeof parsed?.domain === "string"
      ? parsed.domain.trim().toUpperCase() : "";
    if (domain && domain !== "GENERAL") {
      domains[domain] = (domains[domain] || 0) + 1;
    }
  }

  const topTheme = Object.entries(themes).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const topEmotion = Object.entries(emotions).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const topDomain = Object.entries(domains).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const themeCount = Object.keys(themes).length;
  const emotionCount = Object.keys(emotions).length;

  return { entryCount, topTheme, topEmotion, topDomain, themeCount, emotionCount };
}

const DOMAIN_LABELS: Record<string, string> = {
  MONEY: "money and financial stress", WORK: "work and career",
  RELATIONSHIP: "relationships", HEALTH: "health and the body",
  GRIEF: "grief and loss", PARENTING: "parenting",
  CREATIVE: "creative work", IDENTITY: "identity and self",
  FITNESS: "fitness and physical wellbeing",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PremiumInsightPreviewPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/magic-login");

  const { entryCount, topTheme, topEmotion, topDomain, themeCount, emotionCount } =
    await getUserInsightData(user.id);

  const hasData = entryCount >= 2 && (topTheme || topEmotion);
  const domainLabel = topDomain ? (DOMAIN_LABELS[topDomain] ?? topDomain.toLowerCase()) : null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-slate-200">
      <UpgradeIntentTracker source="insights-preview" />

      {/* Header */}
      <header className="mb-10">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Your patterns
        </p>
        <h1 className="text-2xl font-semibold text-white">
          {hasData
            ? "Havenly has noticed something."
            : "A glimpse of your patterns"}
        </h1>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          {hasData
            ? `Across your ${entryCount} reflected ${entryCount === 1 ? "entry" : "entries"}, patterns are forming. Premium brings them into focus.`
            : "As you keep writing, Havenly begins to notice themes that repeat quietly over time."}
        </p>
      </header>

      {/* Real data teaser — blurred */}
      {hasData && (
        <section className="mb-8 space-y-4">

          {/* Top emotion */}
          {topEmotion && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2">
                Most recurring emotion
              </p>
              <div className="flex items-center gap-3">
                <span className="blur-sm select-none rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-sm font-medium text-slate-200">
                  {topEmotion}
                </span>
                <span className="text-xs text-slate-500">
                  appears across multiple entries
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-600">
                Premium shows you when it peaks, what triggers it, and how it's shifted over time.
              </p>
            </div>
          )}

          {/* Top theme */}
          {topTheme && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2">
                A theme that keeps returning
              </p>
              <div className="flex items-center gap-3">
                <span className="blur-sm select-none rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">
                  {topTheme}
                </span>
                <span className="text-xs text-slate-500">
                  {themeCount > 1 ? `+${themeCount - 1} other themes detected` : "detected across your entries"}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-600">
                Premium maps all {themeCount} themes across your timeline so you can see what's growing and what's fading.
              </p>
            </div>
          )}

          {/* Domain + pattern hint */}
          {domainLabel && (
            <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700 mb-2">
                What you write about most
              </p>
              <p className="text-sm text-slate-300">
                Most of your entries circle around{" "}
                <span className="font-medium text-slate-100">{domainLabel}</span>.{" "}
                Premium surfaces the pattern underneath — what you keep coming back to, and why.
              </p>
            </div>
          )}

          {/* Blurred weekly summary preview */}
          <div className="relative rounded-xl border border-slate-800 bg-slate-950/60 p-5 overflow-hidden">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-3">
              What Havenly has noticed — weekly summary
            </p>
            <div className="space-y-2 blur-sm select-none pointer-events-none">
              <p className="text-sm text-slate-300 leading-relaxed">
                {topEmotion
                  ? `You've been carrying ${topEmotion} more than you might realise. It surfaces most in entries about ${domainLabel ?? topTheme ?? "your daily life"}, often underneath what looks like practical concerns.`
                  : "You've been carrying something heavier than the words suggest. The pattern shows up quietly, most in entries about what feels unresolved."}
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                {topTheme
                  ? `The theme of ${topTheme} keeps returning — not as a crisis, but as a background hum. It's connected to how you see yourself right now.`
                  : "There's a recurring thread in what you write about — connected to how you've been seeing yourself lately."}
              </p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30">
              <span className="rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-xs text-slate-300">
                Unlock to read your full summary →
              </span>
            </div>
          </div>

        </section>
      )}

      {/* No data state */}
      {!hasData && (
        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-950/50 p-8 text-center space-y-3">
          <p className="text-2xl">✦</p>
          <p className="text-sm text-slate-400">
            {entryCount === 0
              ? "Write your first entry and Havenly will start noticing what repeats."
              : `${entryCount} ${entryCount === 1 ? "entry" : "entries"} so far — patterns start forming after a few more.`}
          </p>
          <Link
            href="/journal/new"
            className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition"
          >
            Write an entry →
          </Link>
        </section>
      )}

      {/* What Premium adds */}
      <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-950/50 p-6 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          What Premium unlocks
        </h3>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">✓</span>
            Full pattern timeline — themes and emotions across weeks and months
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">✓</span>
            Weekly AI summary — what Havenly has noticed in plain language
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">✓</span>
            Unlimited reflections — no monthly limit
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">✓</span>
            Core pattern detection — the recurring dynamic beneath your entries
          </li>
        </ul>
      </section>

      {/* CTA */}
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/upgrade?from=insights-preview"
          className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition"
        >
          Unlock Premium insights
        </Link>
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-300 transition">
          Back to dashboard
        </Link>
      </div>

      <p className="mt-5 text-xs text-slate-700">
        Free always stays usable. Premium just adds depth.
      </p>
    </main>
  );
}
