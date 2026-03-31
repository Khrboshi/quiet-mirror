// app/(protected)/journal/page.tsx
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "@/app/lib/i18n";
import { cookies } from "next/headers";
import { getLocaleFromCookieString } from "@/app/lib/i18n";
import { parseAIResponse } from "@/lib/planUtils";

export const dynamic = "force-dynamic";

// ── Domain metadata ────────────────────────────────────────────────────────────

const DOMAIN_META: Record<string, { emoji: string; color: string }> = {
  MONEY:        { emoji: "💰", color: "var(--qm-dv-positive)" },
  WORK:         { emoji: "💼", color: "var(--qm-dv-work)" },
  RELATIONSHIP: { emoji: "🤝", color: "var(--qm-dv-love)" },
  HEALTH:       { emoji: "🫀", color: "var(--qm-dv-health)" },
  GRIEF:        { emoji: "🕊️", color: "var(--qm-dv-grief)" },
  PARENTING:    { emoji: "🌱", color: "var(--qm-dv-growth)" },
  CREATIVE:     { emoji: "✍️", color: "var(--qm-dv-creative)" },
  IDENTITY:     { emoji: "🪞", color: "var(--qm-dv-identity)" },
  FITNESS:      { emoji: "⚡", color: "var(--qm-dv-fitness)" },
  GENERAL:      { emoji: "📝", color: "var(--qm-text-muted)" },
};

// ── Emotion color mapping (matches JournalEntryClient) ─────────────────────────

const EMOTION_COLORS: Record<string, string> = {
  // Reds / danger
  fear: "var(--qm-dv-fear)", panic: "var(--qm-dv-fear)", terror: "var(--qm-dv-fear)", dread: "var(--qm-dv-fear)",
  rage: "var(--qm-dv-fear)", fury: "var(--qm-dv-fear)", anger: "var(--qm-dv-fear)",
  // Oranges
  anxiety: "var(--qm-dv-health)", worry: "var(--qm-dv-health)", stress: "var(--qm-dv-health)", overwhelmed: "var(--qm-dv-health)",
  frustration: "var(--qm-dv-health)", irritation: "var(--qm-dv-health)",
  // Yellows
  shame: "var(--qm-dv-creative)", guilt: "var(--qm-dv-creative)", embarrassment: "var(--qm-dv-creative)",
  // Slates / grey-blue
  sadness: "var(--qm-text-secondary)", grief: "var(--qm-text-secondary)", loneliness: "var(--qm-text-secondary)",
  exhaustion: "var(--qm-text-secondary)", numbness: "var(--qm-text-secondary)", emptiness: "var(--qm-text-secondary)",
  disconnection: "var(--qm-text-secondary)", resignation: "var(--qm-text-secondary)",
  // Purples
  confusion: "var(--qm-dv-grief)", doubt: "var(--qm-dv-grief)", uncertainty: "var(--qm-dv-grief)",
  invisibility: "var(--qm-dv-grief)", "self-doubt": "var(--qm-dv-grief)",
  // Greens
  hope: "var(--qm-dv-positive)", relief: "var(--qm-dv-positive)", calm: "var(--qm-dv-positive)", gratitude: "var(--qm-dv-positive)",
  pride: "var(--qm-dv-positive)", joy: "var(--qm-dv-positive)", contentment: "var(--qm-dv-positive)",
  // Blues
  curiosity: "var(--qm-dv-work)", openness: "var(--qm-dv-work)", clarity: "var(--qm-dv-work)",
  // Pinks
  love: "var(--qm-dv-love)", connection: "var(--qm-dv-love)", tenderness: "var(--qm-dv-love)",
};

function emotionColor(e: string): string {
  return EMOTION_COLORS[e.toLowerCase().trim()] ?? "var(--qm-text-muted)";
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDay(iso: string): string {
  // Server-safe: use UTC to avoid hydration mismatch
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function monthKey(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

function entryTitle(title: string | null, content: string | null, fallback: string): string {
  if (title?.trim()) return title.trim();
  // Use first sentence of content, capped at 60 chars
  const first = (content ?? "").split(/[.!?\n]/)[0].trim();
  if (first.length > 4) return first.length > 60 ? first.slice(0, 57) + "…" : first;
  return fallback;
}

function parseAI(raw: string | Record<string, unknown> | null): Record<string, unknown> | null {
  return parseAIResponse(raw);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function JournalPage() {
  const cookieHeader = cookies().toString();
  const t = getTranslations(getLocaleFromCookieString(cookieHeader));
  const supabase = createServerSupabase();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/magic-login");

  const { data: rawEntries } = await supabase
    .from("journal_entries")
    .select("id, created_at, title, content, ai_response")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  const entries = (rawEntries ?? []) as Array<{
    id: string;
    created_at: string;
    title: string | null;
    content: string | null;
    ai_response: string | Record<string, unknown> | null;
  }>;

  type JournalEntry = (typeof entries)[number];
  const groups: { month: string; entries: JournalEntry[] }[] = [];
  for (const entry of entries ?? []) {
    const month = monthKey(entry.created_at);
    const last = groups[groups.length - 1];
    if (last?.month === month) {
      last.entries!.push(entry);
    } else {
      groups.push({ month, entries: [entry] });
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-slate-100">Your Journal</h1>
          {(entries?.length ?? 0) > 0 && (
            <p className="mt-1 text-sm text-slate-500">
              {entries!.length} {entries!.length === 1 ? "entry" : "entries"}
            </p>
          )}
        </div>
        <Link
          href="/journal/new"
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-emerald-400 transition-colors"
        >
          New Entry
        </Link>
      </div>

      {/* Empty state */}
      {entries?.length === 0 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center space-y-2">
            <p className="text-2xl">✦</p>
            <p className="text-sm text-slate-300 font-medium">You haven&rsquo;t written any entries yet.</p>
            <p className="text-xs text-slate-500">One sentence is always enough to start.</p>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              Start here
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { q: "What has been weighing on you lately?", sub: "You don't have to solve it — just name it.", color: "border-emerald-500/20 hover:border-emerald-500/40" },
                { q: "Is there something you keep thinking about today?", sub: "A conversation, a feeling, a moment.", color: "border-violet-500/20 hover:border-violet-500/40" },
                { q: "What felt heavy this week?", sub: "No need to explain why.", color: "border-amber-500/20 hover:border-amber-500/40" },
              ].map((p) => (
                <Link
                  key={p.q}
                  href={`/journal/new?prompt=${encodeURIComponent(p.q)}`}
                  className={`group rounded-2xl border bg-white/[0.02] p-5 transition hover:bg-white/[0.05] ${p.color}`}
                >
                  <p className="text-sm font-medium leading-snug text-slate-100 transition group-hover:text-white">{p.q}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{p.sub}</p>
                  <p className="mt-3 text-xs font-medium text-emerald-400 group-hover:text-emerald-300 transition">Start →</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Month groups */}
      {groups.map(({ month, entries: groupEntries }) => (
        <section key={month} className="space-y-3">

          {/* Month label */}
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-600 px-0.5">
            {month}
          </h2>

          {/* Entry grid */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {groupEntries!.map((entry) => {
              const ai = parseAI(entry.ai_response);
              const hasReflection = Boolean(ai);
              const domain = (String(ai?.domain ?? "GENERAL")).toUpperCase();
              const domainMeta = DOMAIN_META[domain] ?? DOMAIN_META.GENERAL;
              const topEmotion: string = String(ai?.emotions instanceof Array ? (ai.emotions[0] ?? "") : "");
              const eColor = topEmotion ? emotionColor(topEmotion) : null;
              const title = entryTitle(entry.title, entry.content, t.journal.untitledEntry);
              const isUntitled = !entry.title?.trim();

              return (
                <Link
                  key={entry.id}
                  href={`/journal/${entry.id}`}
                  className="group relative rounded-xl border border-slate-800 bg-slate-950/60 p-5 hover:border-slate-700 hover:bg-slate-900/80 transition-all"
                >
                  {/* Top row: date + domain + reflected badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Domain emoji */}
                      {hasReflection && (
                        <span className="shrink-0 text-sm" title={domain}>
                          {domainMeta.emoji}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 tabular-nums">
                        {formatDay(entry.created_at)}
                        <span className="text-slate-700 mx-1">·</span>
                        {formatTime(entry.created_at)}
                      </span>
                    </div>

                    {hasReflection ? (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        <span className="h-1 w-1 rounded-full bg-emerald-400" />
                        Reflected
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-600">
                        Draft
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <p className={`text-sm font-medium leading-snug transition group-hover:text-white ${
                    isUntitled ? "text-slate-400 italic" : "text-slate-100"
                  }`}>
                    {title}
                  </p>

                  {/* Content preview */}
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 line-clamp-2">
                    {entry.content}
                  </p>

                  {/* Bottom row: emotion pill + arrow */}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {topEmotion && eColor && (
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border"
                          style={{
                            color: eColor,
                            borderColor: `${eColor}30`,
                            backgroundColor: `${eColor}12`,
                          }}
                        >
                          {topEmotion}
                        </span>
                      )}
                    </div>
                    <span className="text-emerald-400 text-xs group-hover:text-emerald-300 transition shrink-0">
                      Open →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

    </div>
  );
}
