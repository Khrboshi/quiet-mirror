// app/api/ai/weekly-summary/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { ensureCreditsFresh } from "@/lib/creditRules";

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const FALLBACK_THEMES = new Set([
  "self-awareness",
  "processing",
  "presence",
  "consistency",
  "recovery",
  "self-respect",
  "motivation",
  "recognition",
  "boundaries",
  "self-worth",
  "connection",
  "visibility",
]);

const FALLBACK_EMOTIONS = new Set([
  "uncertainty",
  "restlessness",
  "quiet courage",
  "pride",
  "tiredness",
  "determination",
  "frustration",
  "hurt",
  "longing",
  "confusion",
]);

const FALLBACK_CP_PREFIXES = [
  "you're in the middle of something",
  "you're proud of progress, but still learning the line",
  "you're navigating a tension between your professional self-worth",
  "you're trying to protect your self-respect while staying connected",
];

const isFallbackT = (k: string) => FALLBACK_THEMES.has(k.toLowerCase().trim());
const isFallbackE = (k: string) => FALLBACK_EMOTIONS.has(k.toLowerCase().trim());
const isFallbackCP = (k: string) => {
  const lower = k.toLowerCase().trim();
  return FALLBACK_CP_PREFIXES.some((prefix) => lower.startsWith(prefix));
};

type PlanType = "FREE" | "TRIAL" | "PREMIUM";

function normalizePlan(v: unknown): PlanType {
  const p = String(v ?? "FREE").toUpperCase();
  return p === "PREMIUM" || p === "TRIAL" ? (p as PlanType) : "FREE";
}

function display(k: string) {
  const t = k.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function parseAI(raw: unknown): any {
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

async function callGroq(system: string, user: string): Promise<string> {
  const apiKey = process.env.GROQAPIKEY || process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQAPIKEY");

  const model = process.env.GROQMODEL || "llama-3.3-70b-versatile";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 400,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Groq ${res.status}: ${text}`);
    }

    const data: any = await res.json();
    return String(data?.choices?.[0]?.message?.content ?? "").trim();
  } finally {
    clearTimeout(timer);
  }
}

function buildSummaryPrompt(opts: {
  entryCount: number;
  topThemes: string[];
  topEmotions: string[];
  topCorepatterns: string[];
  topDomains: string[];
  momentum: string;
  trendUp: string[];
  trendDown: string[];
  firstEntryDate: string | null;
}): { system: string; user: string } {
  const {
    entryCount,
    topThemes,
    topEmotions,
    topCorepatterns,
    topDomains,
    momentum,
    trendUp,
    trendDown,
    firstEntryDate,
  } = opts;

  const since = firstEntryDate
    ? new Date(firstEntryDate).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : "recently";

  const DOMAIN_LABELS: Record<string, string> = {
    MONEY: "money and finances",
    WORK: "work and career",
    RELATIONSHIP: "relationships",
    HEALTH: "health and body",
    GRIEF: "grief and loss",
    PARENTING: "parenting",
    CREATIVE: "creativity and creative work",
    IDENTITY: "identity and self",
    FITNESS: "fitness and physical wellbeing",
  };

  const domainLabels = topDomains
    .slice(0, 3)
    .map((d) => DOMAIN_LABELS[d] ?? d.toLowerCase())
    .join(", ");

  const system = `You are Havenly, a calm and perceptive AI journaling companion.
Your job is to write a short, warm, personal summary of what you've noticed across a user's journal entries.

Rules:
- Write 2-3 short paragraphs. No more.
- Speak directly to the user ("you", "your") — warmly, not clinically.
- Be specific: name their actual emotions, themes, and what areas of life they write about most.
- Do NOT use therapy-speak, jargon, or prescriptive advice ("you should", "try to", "consider").
- Do NOT list bullet points or use headers.
- Sound like a thoughtful friend who has been quietly paying attention.
- The first paragraph should name what they write about most and what emotion sits underneath it.
- The second paragraph should name the pattern — what keeps showing up, and what it might mean.
- End with one quiet, open question — genuinely curious, not leading.
- Keep it under 200 words total.`;

  const parts: string[] = [
    `This person has written ${entryCount} journal entries since ${since}.`,
  ];

  if (domainLabels) {
    parts.push(`The areas of life they write about most: ${domainLabels}.`);
  }
  if (topEmotions.length) {
    parts.push(`Emotions that appear most often: ${topEmotions.slice(0, 4).join(", ")}.`);
  }
  if (topThemes.length) {
    parts.push(`Recurring themes: ${topThemes.slice(0, 4).join(", ")}.`);
  }
  if (topCorepatterns.length) {
    parts.push(`The core pattern Havenly detected most often: "${topCorepatterns[0]}".`);
    if (topCorepatterns[1]) {
      parts.push(`Second most recurring: "${topCorepatterns[1]}".`);
    }
  }
  if (trendUp.length) {
    parts.push(`Emotions rising recently: ${trendUp.slice(0, 3).join(", ")}.`);
  }
  if (trendDown.length) {
    parts.push(`Emotions fading recently: ${trendDown.slice(0, 3).join(", ")}.`);
  }
  if (momentum && momentum !== "Steady") {
    parts.push(`Overall emotional momentum right now: ${momentum}.`);
  }

  const user =
    parts.join("\n") +
    "\n\nWrite the summary now. Start with what you've noticed about them — not a greeting, not a preamble.";

  return { system, user };
}

export async function GET() {
  const supabase = createServerSupabase();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  await ensureCreditsFresh({ supabase, userId });

  const { data: credits } = await supabase
    .from("user_credits")
    .select("plan_type")
    .eq("user_id", userId)
    .maybeSingle();

  const plan = normalizePlan((credits as any)?.plan_type);
  if (plan !== "PREMIUM" && plan !== "TRIAL") {
    return NextResponse.json({ error: "Premium required" }, { status: 402 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("weekly_summary, weekly_summary_generated_at")
    .eq("id", userId)
    .maybeSingle();

  const cachedSummary = (profile as any)?.weekly_summary as string | null;
  const cachedAt = (profile as any)?.weekly_summary_generated_at as string | null;

  const isFresh =
    cachedSummary &&
    cachedAt &&
    Date.now() - new Date(cachedAt).getTime() < CACHE_TTL_MS;

  if (isFresh) {
    return NextResponse.json(
      {
        summary: cachedSummary,
        generatedAt: cachedAt,
        cached: true,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const { data: rows, error: rowsError } = await supabase
    .from("journal_entries")
    .select("ai_response, created_at")
    .eq("user_id", userId)
    .not("ai_response", "is", null)
    .order("created_at", { ascending: false })
    .limit(2000);

  if (rowsError) {
    return NextResponse.json(
      { error: "Summary data not available yet." },
      { status: 500 }
    );
  }

  if (!rows?.length) {
    return NextResponse.json({ error: "Not enough data yet." }, { status: 422 });
  }

  const themes: Record<string, number> = {};
  const emotions: Record<string, number> = {};
  const corepatterns: Record<string, number> = {};
  const domains: Record<string, number> = {};

  const now = Date.now();
  const FOUR_WEEKS = 28 * 24 * 60 * 60 * 1000;
  const recentEm: Record<string, number> = {};
  const olderEm: Record<string, number> = {};

  let firstEntryDate: string | null = null;
  let entryCount = 0;

  for (const row of rows) {
    const parsed = parseAI((row as any).ai_response);
    if (!parsed) continue;

    entryCount++;

    const created = String((row as any).created_at ?? "");
    if (created && (!firstEntryDate || new Date(created) < new Date(firstEntryDate))) {
      firstEntryDate = created;
    }

    const age = now - new Date(created).getTime();
    const isRecent = age <= FOUR_WEEKS;
    const isOlder = age > FOUR_WEEKS && age <= FOUR_WEEKS * 2;

    const entryDomain =
      typeof parsed?.domain === "string" ? parsed.domain.trim().toUpperCase() : "";
    if (entryDomain && entryDomain !== "GENERAL") {
      domains[entryDomain] = (domains[entryDomain] || 0) + 1;
    }

    for (const t of Array.isArray(parsed?.themes) ? parsed.themes : []) {
      const k = String(t || "").trim();
      if (!k || isFallbackT(k)) continue;
      const d = display(k);
      themes[d] = (themes[d] || 0) + 1;
    }

    for (const e of Array.isArray(parsed?.emotions) ? parsed.emotions : []) {
      const k = String(e || "").trim();
      if (!k || isFallbackE(k)) continue;
      const d = display(k);
      emotions[d] = (emotions[d] || 0) + 1;
      if (isRecent) recentEm[d] = (recentEm[d] || 0) + 1;
      if (isOlder) olderEm[d] = (olderEm[d] || 0) + 1;
    }

    const cp = typeof parsed?.corepattern === "string" ? parsed.corepattern.trim() : "";
    if (cp.length >= 20 && cp.length <= 200 && !isFallbackCP(cp)) {
      const d = display(cp);
      corepatterns[d] = (corepatterns[d] || 0) + 1;
    }
  }

  const topDomains = Object.entries(domains)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  const topThemes = Object.entries(themes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k);

  const topEmotions = Object.entries(emotions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k);

  const topCorepatterns = Object.entries(corepatterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  const trendUp: string[] = [];
  const trendDown: string[] = [];

  for (const [e, rc] of Object.entries(recentEm)) {
    if (rc > (olderEm[e] ?? 0) + 1) trendUp.push(e);
  }

  for (const [e, oc] of Object.entries(olderEm)) {
    if (oc > (recentEm[e] ?? 0) + 1) trendDown.push(e);
  }

  const POSITIVE = new Set([
    "calm",
    "hope",
    "hopeful",
    "joy",
    "grateful",
    "relief",
    "excited",
    "contentment",
    "clarity",
    "motivated",
    "open",
    "curious",
    "optimistic",
  ]);

  const HEAVY = new Set([
    "dread",
    "despair",
    "hopeless",
    "numb",
    "exhausted",
    "overwhelmed",
    "trapped",
    "grief",
    "shame",
    "guilt",
    "defeated",
  ]);

  let pos = 0;
  let hvy = 0;

  for (const [e, c] of Object.entries(recentEm)) {
    if (POSITIVE.has(e.toLowerCase())) pos += c;
    if (HEAVY.has(e.toLowerCase())) hvy += c;
  }

  let momentum = "Steady";
  if (pos > hvy + 2) momentum = "Lifting";
  else if (hvy > pos + 2) momentum = "Heavy";
  else if (trendUp.length > trendDown.length) momentum = "Shifting";
  else if (trendDown.length > trendUp.length) momentum = "Softening";

  if (!topThemes.length && !topEmotions.length) {
    return NextResponse.json(
      { error: "Not enough personal data yet. Keep writing and generating reflections." },
      { status: 422 }
    );
  }

  const { system, user } = buildSummaryPrompt({
    entryCount,
    topThemes,
    topEmotions,
    topCorepatterns,
    topDomains,
    momentum,
    trendUp,
    trendDown,
    firstEntryDate,
  });

  let summary: string;

  try {
    summary = await callGroq(system, user);
  } catch (err) {
    console.error("[weekly-summary] Groq failed:", err);
    return NextResponse.json(
      { error: "Summary generation failed. Try again in a moment." },
      { status: 500 }
    );
  }

  if (!summary || summary.length < 50) {
    return NextResponse.json(
      { error: "Summary generation failed. Try again in a moment." },
      { status: 500 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Missing Supabase server environment variables." },
      { status: 500 }
    );
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const generatedAt = new Date().toISOString();

  await adminClient.from("profiles").upsert(
    {
      id: userId,
      weekly_summary: summary,
      weekly_summary_generated_at: generatedAt,
    },
    { onConflict: "id" }
  );

  return NextResponse.json(
    {
      summary,
      generatedAt,
      cached: false,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST() {
  const supabase = createServerSupabase();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Missing Supabase server environment variables." },
      { status: 500 }
    );
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  await adminClient.from("profiles").upsert(
    {
      id: session.user.id,
      weekly_summary: null,
      weekly_summary_generated_at: null,
    },
    { onConflict: "id" }
  );

  return new Response(null, { status: 204 });
}
