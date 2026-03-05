// lib/ai/generateReflection.ts
// Havenly V14 — Claude API, tighter prompt, anchor-first fallback

export type Reflection = {
  summary: string;
  corepattern?: string;
  themes: string[];
  emotions: string[];
  gentlenextstep: string;
  questions: string[];
};

type Input = {
  title?: string;
  content: string;
  plan: "FREE" | "PREMIUM";
  recentThemes?: string[];
};

type Domain = "WORK" | "RELATIONSHIP" | "FITNESS" | "GENERAL";

// ─── Domain Detection ─────────────────────────────────────────────────────────

const DOMAIN_SIGNALS: Record<Domain, RegExp[]> = {
  FITNESS: [
    /\b(ran|run|running|jog(ged)?|sprint(ed)?)\b/,
    /\b(workout|training|exercise|gym|lifting|cardio)\b/,
    /\b(pace|steps?|miles?|kilometres?|km|5k|10k)\b/,
    /\b(sore|recovery|rest day|hydration|protein|reps|sets)\b/,
    /\b(sleep|tired|exhausted|fatigue)\b/,
  ],
  WORK: [
    /\b(colleague|coworker|manager|boss|team|client)\b/,
    /\b(meeting|office|project|deadline|presentation)\b/,
    /\b(work|job|career|promotion|performance.?review)\b/,
  ],
  RELATIONSHIP: [
    /\b(partner|wife|husband|girlfriend|boyfriend|spouse)\b/,
    /\b(relationship|love|date|argu(e|ed|ment)|fight|break.?up)\b/,
    /\b(family|friend|parents?|sibling)\b/,
    /\b(he|she|they)\b.{0,60}\b(said|asked|didn't|ignored|forgot|left|looked|felt|was|weren't|never)\b/i,
    /\b(invisible|unheard|unseen|disconnected|lonely|taken for granted)\b/,
    /\bwe\b.{0,80}\b(didn't|wasn't|weren't|fine|awkward|quiet|distant|ignored)\b/i,
  ],
  GENERAL: [],
};

const EMOTIONAL_BOOSTERS: Record<Exclude<Domain, "GENERAL">, RegExp[]> = {
  WORK: [
    /\b(humiliat|embarrass|dismiss|invisible|overlooked|undervalued|unfair)\b/,
    /\b(cried|crying|tears|hurt|angry|rage|shame)\b/,
  ],
  RELATIONSHIP: [
    /\b(invisible|lonely|disconnected|unloved|unheard|ignored|taken for granted)\b/,
    /\b(cried|crying|hurt|heartbreak|ache|longing|miss)\b/,
  ],
  FITNESS: [
    /\b(proud|accomplished|strong|powerful|beat my)\b/,
    /\b(pushing too hard|overdid|burnout|injury|pain)\b/,
  ],
};

function scoreDomain(text: string): Record<Domain, number> {
  const s = text.toLowerCase();
  const scores: Record<Domain, number> = { FITNESS: 0, WORK: 0, RELATIONSHIP: 0, GENERAL: 0 };
  for (const [domain, patterns] of Object.entries(DOMAIN_SIGNALS) as [Domain, RegExp[]][]) {
    for (const p of patterns) if (p.test(s)) scores[domain]++;
  }
  return scores;
}

function emotionalBoost(text: string, domain: Exclude<Domain, "GENERAL">): number {
  const s = text.toLowerCase();
  let boost = 0;
  for (const p of EMOTIONAL_BOOSTERS[domain]) if (p.test(s)) boost++;
  return boost;
}

export function detectDomain(text: string): Domain {
  const scores = scoreDomain(text);
  const candidates = (Object.entries(scores) as [Domain, number][])
    .filter(([d]) => d !== "GENERAL" && scores[d] > 0)
    .sort(([, a], [, b]) => b - a);
  if (candidates.length === 0) return "GENERAL";
  const [top, second] = candidates;
  if (!second || top[1] > second[1]) return top[0];
  const topBoost = emotionalBoost(text, top[0] as Exclude<Domain, "GENERAL">);
  const secondBoost = emotionalBoost(text, second[0] as Exclude<Domain, "GENERAL">);
  return topBoost >= secondBoost ? top[0] : second[0];
}

function isShortEntry(text: string): boolean {
  return text.trim().split(/\s+/).length < 12;
}

// ─── Domain Defaults (fallback only) ─────────────────────────────────────────

type DomainDefaults = {
  summary: string;
  shortSummary: string;
  corepattern: string;
  themes: string[];
  emotions: string[];
  nextStepFree: string;
  nextStepPremium: string;
  shortNextStep: string;
  questions: string[];
  shortQuestions: string[];
  mustHave: RegExp;
  driftKeywords: RegExp;
};

const DOMAIN_DEFAULTS: Record<Domain, DomainDefaults> = {
  FITNESS: {
    summary:
      "What you're carrying: Pride mixed with fatigue — you did something hard and your body is asking for recovery.\nWhat's really happening: You're negotiating the line between healthy challenge and unnecessary pressure.",
    shortSummary:
      "What you're carrying: A quiet sense that something in your body or energy is asking to be noticed.\nWhat's really happening: You showed up — and that's the part worth sitting with before asking what comes next.",
    corepattern:
      "You're proud of progress, but still learning the line between healthy challenge and unnecessary pressure.",
    themes: ["consistency", "recovery", "self-respect", "motivation"],
    emotions: ["pride", "tiredness", "uncertainty", "determination"],
    nextStepFree:
      "Option A: Choose one recovery action today (sleep, hydration, easy walk) and treat it as training. Option B: Define tomorrow's effort as \"easy\" or \"hard\" before you start.",
    nextStepPremium:
      "Option A: Choose one recovery action today (sleep, hydration, easy walk) and treat it as training. Option B: Define tomorrow's effort as \"easy\" or \"hard\" before you start. Script line: \"I'm building consistency, and recovery is part of the plan.\"",
    shortNextStep:
      "Option A: Notice one physical sensation right now and name it without judging it. Option B: Write one sentence about what showing up costs you lately.",
    questions: [
      "What did you prove to yourself by showing up today?",
      "What would healthy discipline look like this week — not perfection?",
      "What is one recovery signal your body gives you that you tend to ignore?",
      "Next time, note your exact self-talk after the workout and what you did next.",
    ],
    shortQuestions: [
      "What does your body feel like right now — not good or bad, just what's actually there?",
      "What would rest look like today that doesn't feel like giving up?",
      "What would you tell a friend who said exactly what you just wrote?",
      "Next time, write two more sentences — what's underneath the first feeling?",
    ],
    mustHave:
      /\b(ran|run|running|workout|training|exercise|recovery|rest|sleep|hydration|pace|cardio|\d+\s*km|\d+\s*k)\b/,
    driftKeywords:
      /\b(colleague|coworker|manager|meeting|office|partner|wife|husband|girlfriend|boyfriend)\b/,
  },

  WORK: {
    summary:
      "What you're carrying: A workplace moment that left a mark.\nWhat's really happening: Something in that dynamic touched your sense of value or competence.",
    shortSummary:
      "What you're carrying: Something from work is sitting with you — quietly, but persistently.\nWhat's really happening: Even a few words can hold a lot of weight when they touch your sense of worth.",
    corepattern:
      "You're navigating a tension between your professional self-worth and external expectations.",
    themes: ["recognition", "boundaries", "self-worth"],
    emotions: ["frustration", "hurt", "determination"],
    nextStepFree:
      "Option A: Write down the one thing you wish had gone differently. Option B: Name what you'd want to say if there were no consequences.",
    nextStepPremium:
      "Option A: Write down the one thing you wish had gone differently. Option B: Name what you'd want to say if there were no consequences. Script line: \"I need to be clear about what I need here.\"",
    shortNextStep:
      "Option A: Finish this sentence — \"What I actually needed in that moment was...\". Option B: Write down one thing you want to be different next time.",
    questions: [
      "What felt most dismissed — your idea, your effort, or your presence?",
      "What would a calm, direct version of yourself say in that moment?",
      "What boundary, if stated clearly, would protect you without escalating?",
      "Next time, write down the exact words exchanged and your immediate reaction.",
    ],
    shortQuestions: [
      "What's the one word that best describes how that made you feel?",
      "If a colleague described the same situation, what would you tell them?",
      "What would it look like to protect yourself here without escalating?",
      "Next time, write more — what happened just before, and just after?",
    ],
    mustHave: /\b(work|meeting|colleague|manager|office|team|project|boss|client|performance)\b/,
    driftKeywords: /\b(partner|wife|husband|girlfriend|boyfriend|workout|running|gym)\b/,
  },

  RELATIONSHIP: {
    summary:
      "What you're carrying: Something in this connection left you unsettled.\nWhat's really happening: A gap between what you felt and what was expressed is asking for attention.",
    shortSummary:
      "What you're carrying: A quiet ache around a connection that matters to you.\nWhat's really happening: Something small happened — or didn't happen — and it landed harder than it looked.",
    corepattern:
      "You're trying to protect your self-respect while staying connected to someone who matters.",
    themes: ["connection", "visibility", "self-worth"],
    emotions: ["hurt", "longing", "confusion"],
    nextStepFree:
      "Option A: Name the feeling in one sentence without assigning blame. Option B: Ask yourself what you most needed in that moment.",
    nextStepPremium:
      "Option A: Name the feeling in one sentence without assigning blame. Option B: Ask yourself what you most needed in that moment. Script line: \"I want to understand this before I respond.\"",
    shortNextStep:
      "Option A: Finish this sentence — \"What I actually needed was...\". Option B: Notice whether you want to say something, or just to be seen.",
    questions: [
      "What exactly did that moment trigger — anger, shame, fear, or something else?",
      "What's the most generous interpretation that still respects your feelings?",
      "What would you ask for if you knew you'd be heard without judgment?",
      "Next time, paste the exact words that stung and what you did immediately after.",
    ],
    shortQuestions: [
      "What's the feeling underneath the low — is it loneliness, disappointment, or something else?",
      "Who or what came to mind when you wrote this?",
      "What would it feel like to say this feeling out loud to someone safe?",
      "Next time, write two more sentences — what happened before this feeling arrived?",
    ],
    mustHave: /\b(partner|wife|husband|girlfriend|boyfriend|relationship|family|friend|love|date)\b|\b(he|she|they|we)\b/i,
    driftKeywords: /\b(colleague|manager|meeting|workout|gym|running)\b/,
  },

  GENERAL: {
    summary:
      "What you're carrying: Something is sitting with you — not fully named yet, but real.\nWhat's really happening: You wrote it down, which means part of you is already trying to make sense of it.",
    shortSummary:
      "What you're carrying: Something quiet — not loud enough to name yet, but present enough to notice.\nWhat's really happening: You showed up to write, even without words. That's the start of something.",
    corepattern:
      "You're in the middle of something — not at the beginning, not at the end, just present with it.",
    themes: ["self-awareness", "processing", "presence"],
    emotions: ["uncertainty", "restlessness", "quiet courage"],
    nextStepFree:
      "Option A: Write one more sentence — what's the feeling underneath the first one? Option B: Ask yourself: is this about something that happened, something expected, or something missing?",
    nextStepPremium:
      "Option A: Write one more sentence — what's the feeling underneath the first one? Option B: Ask yourself: is this about something that happened, something expected, or something missing? Script line: \"I don't need to have the answer — I just need to stay with the question.\"",
    shortNextStep:
      "Option A: Sit with it for 60 seconds and notice if a word arrives. Option B: Write one more line — it doesn't have to make sense.",
    questions: [
      "What's the feeling that's hardest to name right now?",
      "Is this about something that happened, something you're expecting, or something you're missing?",
      "What would feel like one small step toward clarity — not resolution, just clarity?",
      "Next time, write for two more minutes without stopping — what else is there?",
    ],
    shortQuestions: [
      "Where do you feel this in your body right now?",
      "If you had to guess what's underneath the uncertainty — what would you say?",
      "What would help right now — company, quiet, movement, or something else?",
      "Next time, write for two more minutes without stopping — what else comes up?",
    ],
    mustHave: /./,
    driftKeywords: /(?!)/,
  },
};

// ─── Anchor Extraction ────────────────────────────────────────────────────────

function extractAnchors(entry: string): string[] {
  const t = entry.trim();
  const seen = new Set<string>();
  const anchors: string[] = [];

  const add = (s: string) => {
    const v = s.trim();
    if (!v) return;
    const key = v.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key)) return;
    seen.add(key);
    anchors.push(v);
  };

  for (const m of t.matchAll(/["""]([^"""]{4,90})["""]/g)) {
    add(`"${m[1]}"`);
    if (anchors.length >= 3) break;
  }

  if (anchors.length < 2) {
    const sentences = t.split(/\n|(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
    for (const s of sentences.slice(0, 4)) {
      add(s.length > 110 ? s.slice(0, 110).trim() : s);
      if (anchors.length >= 2) break;
    }
  }

  const patterns: [RegExp, string][] = [
    [/in front of (others|people|everyone)/i, "in front of others"],
    [/colleague|coworker|manager|team|meeting/i, "a work moment that left a mark"],
    [/smiled|laughed it off|kept it in|stayed silent/i, "you smiled in the moment, then replayed it later"],
    [/replaying|kept replaying|ruminat/i, "you kept replaying it and felt small"],
    [/don't want to start a fight|avoid conflict|respond without starting a fight/i, "you want to respond without starting a fight"],
    [/\b(invisible|unheard|unseen)\b/i, "you felt invisible"],
    [/fine isn't what I wanted/i, "fine isn't what you wanted"],
    [/cried in the car|cried on the way/i, "you cried on the way home"],
    [/nodded and said thank you/i, "you nodded and said thank you instead of pushing back"],
    [/\b(tired|exhausted|fatigue)\b/i, "part of you wants rest while another wants to push harder"],
    [/improving|progress|forcing myself|discipline/i, "you're questioning whether this is growth or pressure"],
  ];

  for (const [re, label] of patterns) {
    if (re.test(t)) add(label);
  }

  // Fitness-specific anchors
  if (/ran\s*5\s*k(m)?\b/i.test(t)) {
    add("I ran 5km today and felt proud but also tired");
  } else if (DOMAIN_DEFAULTS.FITNESS.mustHave.test(t.toLowerCase())) {
    add("you exercised and felt proud but also tired");
  }

  if (anchors.length < 1) add("you wrote this down, which means something is asking to be noticed");

  return anchors.slice(0, 5);
}

// ─── JSON Parsing ─────────────────────────────────────────────────────────────

function parseModelJson<T>(raw: string): T | null {
  const cleaned = raw
    .replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, "$1")
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try { return JSON.parse(cleaned.slice(start, end + 1)) as T; } catch {}
    }
    return null;
  }
}

// ─── Quality Gate ─────────────────────────────────────────────────────────────

type QualityResult = { pass: true } | { pass: false; reasons: string[] };

function qualityCheck(
  parsed: any,
  anchors: string[],
  plan: "FREE" | "PREMIUM",
  domain: Domain,
  short: boolean
): QualityResult {
  const reasons: string[] = [];
  const defaults = DOMAIN_DEFAULTS[domain];

  const summary = String(parsed?.summary ?? "").trim();
  const nextStep = String(parsed?.gentlenextstep ?? "").trim();
  const themes: unknown[] = Array.isArray(parsed?.themes) ? parsed.themes : [];
  const emotions: unknown[] = Array.isArray(parsed?.emotions) ? parsed.emotions : [];
  const questions: unknown[] = Array.isArray(parsed?.questions) ? parsed.questions : [];
  const fullText = [summary, nextStep, ...questions].join("\n").toLowerCase();

  if (!short) {
    const hasAnchor = anchors.some(a =>
      fullText.includes(a.toLowerCase().replace(/^[""]|[""]$/g, "").trim())
    );
    if (!hasAnchor) reasons.push("Missing verbatim anchor");

    // Summary itself must not be a known template opener
    const BANNED_SUMMARY_OPENERS = [
      "a workplace moment that left a mark",
      "something is sitting with you",
      "something in this connection left you unsettled",
      "something in this connection",
    ];
    const summaryLower = summary.toLowerCase();
    for (const banned of BANNED_SUMMARY_OPENERS) {
      if (summaryLower.startsWith(banned)) {
        reasons.push(`Generic template summary detected: "${banned}"`);
        break;
      }
    }
  }

  if (!summary.includes("What you're carrying:")) reasons.push('Missing "What you\'re carrying:"');
  if (!summary.includes("What's really happening:")) reasons.push('Missing "What\'s really happening:"');
  if (plan === "PREMIUM" && !short && !summary.includes("Deeper direction:"))
    reasons.push('Missing "Deeper direction:" (PREMIUM)');

  const minLen = short ? 80 : plan === "PREMIUM" ? 240 : 150;
  if (summary.length < minLen) reasons.push(`Summary too short (${summary.length} < ${minLen})`);

  if (!/Option A:/i.test(nextStep)) reasons.push("Missing Option A");
  if (!/Option B:/i.test(nextStep)) reasons.push("Missing Option B");
  if (plan === "PREMIUM" && !short && !/Script line:/i.test(nextStep))
    reasons.push("Missing Script line (PREMIUM)");

  const minArr = plan === "PREMIUM" ? 3 : 2;
  if (themes.length < minArr) reasons.push(`themes: need ${minArr}, got ${themes.length}`);
  if (emotions.length < minArr) reasons.push(`emotions: need ${minArr}, got ${emotions.length}`);
  if (questions.length < 2) reasons.push(`questions: need 2, got ${questions.length}`);

  const lastQ = String(questions[questions.length - 1] ?? "");
  if (!lastQ.toLowerCase().startsWith("next time,"))
    reasons.push('Last question must start with "Next time,"');

  if (domain !== "GENERAL") {
    if (!defaults.mustHave.test(fullText)) reasons.push(`Domain signal missing for ${domain}`);
    if (defaults.driftKeywords.test(fullText)) reasons.push(`Domain drift for ${domain}`);
  }

  return reasons.length === 0 ? { pass: true } : { pass: false, reasons };
}

// ─── Normalization ────────────────────────────────────────────────────────────

function normalizeReflection(r: any, domain: Domain, short: boolean): Reflection {
  const defaults = DOMAIN_DEFAULTS[domain];
  const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const cleanArr = (v: unknown, max: number): string[] =>
    Array.isArray(v) ? v.map(x => String(x ?? "").trim()).filter(Boolean).slice(0, max) : [];

  const questions = ensureFourQuestions(cleanArr(r?.questions, 6), domain, short);

  return {
    summary: clean(r?.summary) || (short ? defaults.shortSummary : defaults.summary),
    corepattern: clean(r?.corepattern) || defaults.corepattern,
    themes: cleanArr(r?.themes, 6).length ? cleanArr(r.themes, 6) : defaults.themes,
    emotions: cleanArr(r?.emotions, 6).length ? cleanArr(r.emotions, 6) : defaults.emotions,
    gentlenextstep:
      clean(r?.gentlenextstep) || (short ? defaults.shortNextStep : defaults.nextStepFree),
    questions,
  };
}

function ensureFourQuestions(qs: string[], domain: Domain, short: boolean): string[] {
  const defaults = short ? DOMAIN_DEFAULTS[domain].shortQuestions : DOMAIN_DEFAULTS[domain].questions;
  const out = qs.filter(Boolean).slice(0, 4);
  while (out.length < 4) out.push(defaults[out.length] ?? defaults[defaults.length - 1]);
  if (!out[out.length - 1].toLowerCase().startsWith("next time,"))
    out[out.length - 1] = defaults[3] ?? defaults[defaults.length - 1];
  return out;
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────

function buildSystemPrompt(plan: "FREE" | "PREMIUM", domain: Domain, short: boolean): string {
  const isPremium = plan === "PREMIUM";

  const summaryStructure = isPremium && !short
    ? `1) "What you're carrying:" — what the person is holding emotionally right now\n  2) "What's really happening:" — the deeper dynamic, named specifically\n  3) "Deeper direction:" — one forward-facing observation, grounded in the entry`
    : `1) "What you're carrying:" — what the person is holding emotionally right now\n  2) "What's really happening:" — the deeper dynamic, named specifically`;

  const nextStepStructure = isPremium && !short
    ? `"Option A:" (practical, doable today) and "Option B:" (reflective alternative) and "Script line:" (1-2 calm sentences the person could actually say or write)`
    : `"Option A:" (practical, doable today) and "Option B:" (reflective alternative)`;

  const domainGuidance: Record<Domain, string> = {
    WORK: `DOMAIN: WORK
Name the specific workplace dynamic — being dismissed, overlooked, undervalued, or caught in a power tension.
"What you're carrying:" MUST describe what literally happened: who was in the room, what was said or done, how you responded.
"What's really happening:" must name what was touched: dignity, competence, recognition, or safety.
BANNED opener: "A workplace moment that left a mark" — write the actual moment instead.
Do NOT drift to relationship or fitness language.`,

    RELATIONSHIP: `DOMAIN: RELATIONSHIP
Name the specific relational dynamic — feeling invisible, disconnected, unheard, or the gap between what was needed and what happened.
"What you're carrying:" MUST name who it involves and what happened: "You told him you were struggling and got reassurance instead of presence."
"What's really happening:" must name what the gap was: attention, care, presence, or reciprocity.
BANNED opener: "Something in this connection left you unsettled" — write the actual dynamic instead.
Do NOT drift to workplace or fitness language.`,

    FITNESS: `DOMAIN: FITNESS
Stay in the physical/training lane. Do NOT mention colleagues, partners, or conflict unless explicitly in the entry.
"What's really happening:" must be about the body, energy, or the inner voice around training and recovery.
CRITICAL: If the person skipped or avoided exercise, do NOT assign "pride" as an emotion. Match the actual emotional tone — avoidance, guilt, resistance, or relief are more honest.
If they worked out and felt good, THEN pride is valid. Read the entry before assigning emotions.`,

    GENERAL: `DOMAIN: GENERAL
Use the person's EXACT words — especially vivid metaphors or images they used — directly in your summary.
"What you're carrying:" must describe what the person actually wrote, not a generic label.
"What's really happening:" must echo their specific phrasing. If they wrote "stuck behind glass watching my own life", use those words.
BANNED opener: "Something is sitting with you" — write what is specifically sitting with them instead.
BANNED phrase: "Something important is asking for clarity" — placeholder, forbidden.
If the entry is short or unclear, be gentle and curious. Lead with warmth.`,
  };

  const shortGuidance = short
    ? `\nSHORT ENTRY: Under 12 words. Be warm and curious — NOT analytical. Do not extract themes that aren't there.
"What you're carrying:" and "What's really happening:" should be brief and open. Questions invite more, they don't demand.`
    : "";

  return `You are Havenly — a private journaling companion that reflects back what people write with warmth, clarity, and precision.

CORE RULES (never break these):
- Write directly to "you". Never say "the user" or "this person".
- "What you're carrying:" MUST use the person's exact situation — not a generic label. If they ran 5km, say so. If they cried, say so. If they said thank you when they wanted to push back, say so.
- "What's really happening:" MUST quote or closely echo a specific phrase from the entry. The reader should recognise their own words.
- "gentlenextstep" Option A and Option B MUST be specific to THIS entry — not generic advice that could apply to anyone.
- Never invent events not in the entry.
- BANNED summary openers: "A workplace moment that left a mark", "Something is sitting with you", "Something in this connection left you unsettled" — these are placeholders. Write the actual situation.
- BANNED: "Something important is asking for clarity" — useless placeholder.
- BANNED: "A moment felt important" — unless the entry is one sentence with zero emotional signal.
- If a person wrote a vivid, specific phrase (like "stuck behind glass watching my own life", or "handed a mask and told to put it back on") — that phrase MUST appear verbatim in your summary or corepattern. Do not paraphrase it away.

${domainGuidance[domain]}
${shortGuidance}

TONE: Grounded, calm, perceptive. Not clinical. Not preachy. Not flattering.

REQUIRED STRUCTURE:

summary — labeled sections in this exact order:
${summaryStructure}

corepattern — ONE sentence naming the underlying dynamic. Specific to this entry.

gentlenextstep — must include:
${nextStepStructure}
Both options must be things a real person can do today. Not abstract.

questions — exactly 4. The LAST question MUST start with exactly: "Next time,"

OUTPUT: Return ONLY valid JSON with double-quoted strings. No markdown, no code fences, no preamble.
{
  "summary": "...",
  "corepattern": "...",
  "themes": ["...", "...", "..."],
  "emotions": ["...", "...", "..."],
  "gentlenextstep": "...",
  "questions": ["...", "...", "...", "Next time, ..."]
}`.trim();
}

// ─── Groq Caller ─────────────────────────────────────────────────────────────

async function callGroq(opts: {
  apiKey: string;
  model: string;
  system: string;
  user: string;
  maxTokens: number;
  temperature: number;
}): Promise<string> {
  const { apiKey, model, system, user, maxTokens, temperature } = opts;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
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
    return String(data?.choices?.[0]?.message?.content ?? "");
  } finally {
    clearTimeout(timer);
  }
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export async function generateReflectionFromEntry(input: Input): Promise<Reflection> {
  const apiKey = process.env.GROQAPIKEY || process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQAPIKEY");

  // llama-4-scout: best Groq free model for structured JSON output as of 2025
  const model = process.env.GROQMODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

  const entryBody = (input.content || "").trim();
  const titleLine = input.title?.trim() ? `Title: ${input.title.trim()}\n` : "";
  const entryText = `${titleLine}Entry:\n${entryBody}`;

  const domain = detectDomain(entryBody);
  const short = isShortEntry(entryBody);
  const anchors = extractAnchors(entryBody);
  const anchorsBlock = anchors.map((a, i) => `${i + 1}) ${a}`).join("\n");

  const recentThemes = (input.recentThemes || [])
    .map(s => String(s).trim())
    .filter(Boolean)
    .slice(0, 5);

  const memoryBlock = recentThemes.length
    ? `CONTEXT — themes from recent entries (reference only if genuinely relevant):\n${recentThemes.map((t, i) => `${i + 1}) ${t}`).join("\n")}\n`
    : "";

  const userPrompt = `${memoryBlock}ANCHORS — include at least one verbatim in your response${short ? " if possible" : ""}:
${anchorsBlock}

${entryText}`.trim();

  const maxTokens = input.plan === "PREMIUM" ? 1100 : 750;
  const systemPrompt = buildSystemPrompt(input.plan, domain, short);

  const ATTEMPTS = [
    { temperature: input.plan === "PREMIUM" ? 0.5 : 0.4, note: undefined as string | undefined },
    { temperature: 0.25, note: `Retry. Be specific to this entry. Use the person's exact words in "What's really happening:". Domain: ${domain}. Return ONLY valid JSON.` },
    { temperature: 0.1,  note: `Final attempt. Domain: ${domain}. Reference the entry directly. "Something important is asking for clarity" is BANNED. Return ONLY valid JSON.` },
  ];

  let bestParsed: any = null;

  for (let i = 0; i < ATTEMPTS.length; i++) {
    const { temperature, note } = ATTEMPTS[i];
    const system = note ? `${systemPrompt}\n\nRETRY NOTE: ${note}` : systemPrompt;

    let raw = "";
    try {
      raw = await callGroq({ apiKey, model, system, user: userPrompt, maxTokens, temperature });
    } catch (err) {
      console.warn(`[Havenly] Attempt ${i + 1} threw:`, err);
      continue;
    }

    const parsed = parseModelJson<any>(raw);
    if (!parsed) continue;

    bestParsed = parsed; // keep last valid parse in case all fail quality

    const result = qualityCheck(parsed, anchors, input.plan, domain, short);
    if (result.pass) return normalizeReflection(parsed, domain, short);

    if (i === ATTEMPTS.length - 1) {
      console.warn("[Havenly] Quality gate failed after 3 attempts. Domain:", domain, "Reasons:", (result as any).reasons);
      // Return best parsed output — still better than a pure template
      return normalizeReflection(parsed, domain, short);
    }
  }

  // ─── Last resort: pure template with real anchor injected ────────────────
  const defaults = DOMAIN_DEFAULTS[domain];
  const a1 = anchors[0] || "what you wrote";
  const isPremium = input.plan === "PREMIUM";
  const baseSummary = short ? defaults.shortSummary : defaults.summary;
  const continuityLine = recentThemes.length
    ? `This echoes a theme you have touched before: ${recentThemes[0]}.`
    : "";

  const summaryWithAnchor = [
    baseSummary,
    ...(isPremium && !short ? [`Deeper direction: ${defaults.corepattern}`] : []),
    ...(continuityLine ? [continuityLine] : []),
  ]
    .join("\n")
    .replace("What's really happening:", `What's really happening: ${a1} --`);

  return normalizeReflection(
    {
      summary: summaryWithAnchor,
      corepattern: defaults.corepattern,
      themes: defaults.themes,
      emotions: defaults.emotions,
      gentlenextstep: short
        ? defaults.shortNextStep
        : isPremium
        ? defaults.nextStepPremium
        : defaults.nextStepFree,
      questions: short ? defaults.shortQuestions : defaults.questions,
    },
    domain,
    short
  );
}
