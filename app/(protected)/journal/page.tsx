// app/(protected)/journal/page.tsx
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

// ── Domain metadata ────────────────────────────────────────────────────────────

const DOMAIN_META: Record<string, { emoji: string; color: string }> = {
  MONEY:        { emoji: "💰", color: "#34d399" },
  WORK:         { emoji: "💼", color: "#60a5fa" },
  RELATIONSHIP: { emoji: "🤝", color: "#f472b6" },
  HEALTH:       { emoji: "🫀", color: "#fb923c" },
  GRIEF:        { emoji: "🕊️", color: "#a78bfa" },
  PARENTING:    { emoji: "🌱", color: "#86efac" },
  CREATIVE:     { emoji: "✍️", color: "#fbbf24" },
  IDENTITY:     { emoji: "🪞", color: "#e879f9" },
  FITNESS:      { emoji: "⚡", color: "#2dd4bf" },
  GENERAL:      { emoji: "📝", color: "#64748b" },
};

// ── Emotion color mapping (matches JournalEntryClient) ─────────────────────────

const EMOTION_COLORS: Record<string, string> = {
  // Reds / danger
  fear: "#f87171", panic: "#f87171", terror: "#f87171", dread: "#f87171",
  rage: "#f87171", fury: "#f87171", anger: "#f87171",
  // Oranges
  anxiety: "#fb923c", worry: "#fb923c", stress: "#fb923c", overwhelmed: "#fb923c",
  frustration: "#fb923c", irritation: "#fb923c",
  // Yellows
  shame: "#fbbf24", guilt: "#fbbf24", embarrassment: "#fbbf24",
  // Slates / grey-blue
  sadness: "#94a3b8", grief: "#94a3b8", loneliness: "#94a3b8",
  exhaustion: "#94a3b8", numbness: "#94a3b8", emptiness: "#94a3b8",
  disconnection: "#94a3b8", resignation: "#94a3b8",
  // Purples
  confusion: "#a78bfa", doubt: "#a78bfa", uncertainty: "#a78bfa",
  invisibility: "#a78bfa", "self-doubt": "#a78bfa",
  // Greens
  hope: "#34d399", relief: "#34d399", calm: "#34d399", gratitude: "#34d399",
  pride: "#34d399", joy: "#34d399", contentment: "#34d399",
  // Blues
  curiosity: "#60a5fa", openness: "#60a5fa", clarity: "#60a5fa",
  // Pinks
  love: "#f472b6", connection: "#f472b6", tenderness: "#f472b6",
};

function emotionColor(e: string): string {
  return EMOTION_COLORS[e.toLowerCase().trim()] ?? "#64748b";
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

function entryTitle(title: string | null, content: string | null): string {
  if (title?.trim()) return title.trim();
  // Use first sentence of content, capped at 60 chars
  const first = (content ?? "").split(/[.!?\n]/)[0].trim();
  if (first.length > 4) return first.length > 60 ? first.slice(0, 57) + "…" : first;
  return "Untitled entry";
}

function parseAI(raw: any): any {
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function JournalPage() {
  const supabase = createServerSupabase();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/magic-login");

  const { data: entries } = await supabase
    .from("journal_entries")
    .select("id, created_at, title, content, ai_response")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  // Group by month
  const groups: { month: string; entries: typeof entries }[] = [];
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
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-10 text-center space-y-3">
          <p className="text-2xl">✦</p>
          <p className="text-sm text-slate-400">You haven&rsquo;t written any entries yet.</p>
          <Link
            href="/journal/new"
            className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition"
          >
            Write your first entry →
          </Link>
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
              const ai = parseAI((entry as any).ai_response);
              const hasReflection = Boolean(ai);
              const domain = (ai?.domain ?? "GENERAL").toUpperCase();
              const domainMeta = DOMAIN_META[domain] ?? DOMAIN_META.GENERAL;
              const topEmotion: string = ai?.emotions?.[0] ?? "";
              const eColor = topEmotion ? emotionColor(topEmotion) : null;
              const title = entryTitle(entry.title, entry.content);
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
