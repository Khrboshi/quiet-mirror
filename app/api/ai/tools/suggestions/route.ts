// app/api/ai/tools/suggestions/route.ts
import { NextResponse } from "next/server";
import { CONFIG } from "@/app/lib/config";
import { createServerSupabase } from "@/lib/supabase/server";
import { ensureCreditsFresh } from "@/lib/creditRules";
import { normalizeAIResponseSignals } from "@/lib/ai/normalizeInsightSignals";
import { normalizePlan, type UserCreditsRow, type JournalAIRow, type GroqChatResponse, parseAIResponse } from "@/lib/planUtils";
import { getLocaleFromCookieString, getAiLanguageName, SUPPORTED_LOCALES, DEFAULT_LOCALE } from "@/app/lib/i18n";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

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
        temperature: 0.75,
        max_tokens: 200,
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

    const data: GroqChatResponse = await res.json();
    return String(data?.choices?.[0]?.message?.content ?? "").trim();
  } finally {
    clearTimeout(timer);
  }
}

function parseSuggestions(raw: string): { text: string; prompt: string }[] {
  const lines = raw
    .split("\n")
    .map((l) => l.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);

  const suggestions: { text: string; prompt: string }[] = [];

  for (const line of lines) {
    if (suggestions.length >= 2) break;
    const [text, prompt] = line.split("|").map((s) => s.trim());
    if (text && text.length > 5) {
      suggestions.push({
        text,
        prompt: prompt && prompt.length > 5 ? prompt : `Write about: ${text}`,
      });
    }
  }

  return suggestions;
}

const FALLBACK_SUGGESTIONS = [
  {
    text: "Write for five minutes without editing yourself.",
    prompt:
      "Set a timer for five minutes and write without stopping. No editing, no re-reading — just what comes out.",
  },
  {
    text: "Name one thing that went unacknowledged this week.",
    prompt:
      "What happened this week that nobody noticed, including you? Something small you did, felt, or got through.",
  },
];

export async function GET(req: Request) {
  const rawLocale      = getLocaleFromCookieString(req.headers.get("cookie") ?? "");
  const locale         = SUPPORTED_LOCALES.includes(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const targetLanguage = getAiLanguageName(locale);
  const languageInstruction = targetLanguage
    ? `\nLANGUAGE RULE: Respond entirely in ${targetLanguage}. Both suggestions and both journal prompts must be in ${targetLanguage} only.\n`
    : "";
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  await ensureCreditsFresh({ supabase, userId });

  const { data: credits } = await supabase
    .from("user_credits")
    .select("plan_type")
    .eq("user_id", userId)
    .maybeSingle() as { data: UserCreditsRow | null; error: unknown };

  const plan = normalizePlan(credits?.plan_type);
  if (plan !== "PREMIUM" && plan !== "TRIAL") {
    return NextResponse.json({ error: "Premium required" }, { status: 402 });
  }

  const { data: rows } = await supabase
    .from("journal_entries")
    .select("ai_response, created_at")
    .eq("user_id", userId)
    .not("ai_response", "is", null)
    .order("created_at", { ascending: false })
    .limit(30) as { data: JournalAIRow[] | null; error: unknown };

  if (!rows?.length) {
    return NextResponse.json(
      { suggestions: FALLBACK_SUGGESTIONS, hasData: false },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const themes: Record<string, number> = {};
  const emotions: Record<string, number> = {};
  const corepatterns: string[] = [];

  for (const row of rows) {
    try {
      const parsed = parseAIResponse(row.ai_response);

      const normalized = normalizeAIResponseSignals(parsed);

      for (const t of normalized.themes) {
        themes[t] = (themes[t] || 0) + 1;
      }
      for (const e of normalized.emotions) {
        emotions[e] = (emotions[e] || 0) + 1;
      }
      if (normalized.corepattern && corepatterns.length < 3) {
        corepatterns.push(normalized.corepattern);
      }
    } catch {}
  }

  const topThemes = Object.entries(themes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k]) => k);

  const topEmotions = Object.entries(emotions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k]) => k);

  if (!topThemes.length && !topEmotions.length) {
    return NextResponse.json(
      { suggestions: FALLBACK_SUGGESTIONS, hasData: false },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const system = `You are ${CONFIG.aiPersonaName}, a calm AI journaling companion.
Your job is to suggest two small, gentle things this person could do or think about — drawn from what keeps showing up in their journal.
${languageInstruction}
Rules:
- Write EXACTLY two suggestions. No more, no less.
- Each suggestion must be on its own numbered line, in this exact format:
  1. <suggestion> | <a journal prompt about it>
  2. <suggestion> | <a journal prompt about it>
- The suggestion (before the pipe) should be one short sentence — a quiet, specific invitation. Under 20 words.
- The journal prompt (after the pipe) should be one question or open sentence they could write about. Under 25 words.
- No advice. No "you should". Not a plan or a goal. Just one small, honest thing.
- Keep it specific to what this person actually carries — not generic.
- Do NOT use therapy-speak, self-help language, or productivity framing.`;

  const parts: string[] = [];
  if (topEmotions.length)
    parts.push(`Emotions that appear most often: ${topEmotions.join(", ")}.`);
  if (topThemes.length)
    parts.push(`Themes that keep returning: ${topThemes.join(", ")}.`);
  if (corepatterns.length)
    parts.push(`Core pattern noticed: "${corepatterns[0]}".`);

  const userPrompt =
    parts.join("\n") +
    "\n\nWrite the two suggestions now, in the exact format specified.";

  try {
    const raw = await callGroq(system, userPrompt);
    const suggestions = parseSuggestions(raw);

    if (suggestions.length < 1) throw new Error("Could not parse suggestions");

    while (suggestions.length < 2) {
      suggestions.push(FALLBACK_SUGGESTIONS[suggestions.length]);
    }

    return NextResponse.json(
      { suggestions, hasData: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[tools/suggestions] Groq failed:", err);
    return NextResponse.json(
      { suggestions: FALLBACK_SUGGESTIONS, hasData: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
