// app/api/ai/tools/reflection/route.ts
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
        temperature: 0.85,
        max_tokens: 80,
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

const FALLBACK_QUESTIONS = [
  "What have you been telling yourself you're fine about — that you're not actually fine about?",
  "What is one thing you've been carrying lately that you haven't found the words for yet?",
  "What keeps coming back, even when you're not thinking about it?",
];

export async function GET(req: Request) {
  const rawLocale      = getLocaleFromCookieString(req.headers.get("cookie") ?? "");
  const locale         = SUPPORTED_LOCALES.includes(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const targetLanguage = getAiLanguageName(locale);
  const languageInstruction = targetLanguage
    ? `\nLANGUAGE RULE: Respond entirely in ${targetLanguage}. The question must be in ${targetLanguage} only.\n`
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
      { question: FALLBACK_QUESTIONS[0], hasData: false },
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
      { question: FALLBACK_QUESTIONS[0], hasData: false },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const system = `You are ${CONFIG.aiPersonaName}, a calm and perceptive AI journaling companion.
Your job is to write ONE reflection question for this person, shaped around what keeps showing up in their journal.
${languageInstruction}
Rules:
- Write exactly ONE question. No preamble, no explanation, nothing else.
- Make it feel personal and specific to what this person carries — not generic.
- The question should open something up, not close it down.
- Do NOT give advice. Do NOT use therapy-speak. Do NOT suggest what they should do.
- Be quietly curious — the kind of question worth sitting with for a while.
- Keep it under 25 words.
- Do not start with "What if" or "Have you considered" or "Why do you".`;

  const parts: string[] = [];
  if (topEmotions.length)
    parts.push(`Emotions that appear most often: ${topEmotions.join(", ")}.`);
  if (topThemes.length)
    parts.push(`Themes that keep returning: ${topThemes.join(", ")}.`);
  if (corepatterns.length)
    parts.push(`Core pattern noticed: "${corepatterns[0]}".`);

  const userPrompt =
    parts.join("\n") +
    "\n\nWrite the question now. One question only — nothing else.";

  try {
    const raw = await callGroq(system, userPrompt);
    const question = raw.replace(/^["'""]|["'""]$/g, "").trim();

    if (!question || question.length < 10) {
      throw new Error("Empty or too-short response");
    }

    return NextResponse.json(
      { question, hasData: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[tools/reflection] Groq failed:", err);
    const fallback =
      FALLBACK_QUESTIONS[Math.floor(Math.random() * FALLBACK_QUESTIONS.length)];
    return NextResponse.json(
      { question: fallback, hasData: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
