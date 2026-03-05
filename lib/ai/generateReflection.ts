// lib/ai/generateReflection.ts
// Havenly V15 — Phase 2 audit complete rewrite
// Fixes: template summaries per domain, anchor suppression, FITNESS misclassification

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
    /\b(pace|steps?|miles?|kilometres?|km|5k|10k|8k)\b/,
    /\b(sore|recovery|rest day|hydration|protein|reps|sets)\b/,
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

// FIX: removed tired/sleep/exhausted from FITNESS signals — these caused
// emotional-burnout GENERAL entries to be misclassified as FITNESS.
// FITNESS booster now requires actual training vocabulary to score higher.

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
    /\b(ran|run|running|workout|gym|cardio|lifting|training|exercise)\b/,
    /\b(pace|km|miles|5k|10k|8k|reps|sets|pb|personal best)\b/,
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

// ─── Domain Defaults (absolute last resort — model output is always preferred) ─

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
      "What you're carrying: Something happened in training today that's still with you.\nWhat's really happening: The gap between what your body did and what you felt about it is worth sitting with.",
    shortSummary:
      "What you're carrying: A quiet signal from your body asking to be noticed.\nWhat's really happening: You showed up — and that's the part worth sitting with before asking what comes next.",
    corepattern:
      "You're learning to read the difference between pushing toward something and pushing away from discomfort.",
    themes: ["consistency", "recovery", "self-respect", "motivation"],
    emotions: ["uncertainty", "determination", "tiredness"],
    nextStepFree:
      "Option A: Choose one recovery action today (sleep, hydration, easy walk) and treat it as training. Option B: Define tomorrow's effort as \"easy\" or \"hard\" before you start.",
    nextStepPremium:
      "Option A: Choose one recovery action today (sleep, hydration, easy walk) and treat it as training. Option B: Define tomorrow's effort as \"easy\" or \"hard\" before you start. Script line: \"I'm building consistency, and recovery is part of the plan.\"",
    shortNextStep:
      "Option A: Notice one physical sensation right now and name it without judging it. Option B: Write one sentence about what showing up costs you lately.",
    questions: [
      "What did you actually feel in your body today — not good or bad, just what was there?",
      "What would healthy discipline look like this week — not perfection?",
      "What is one recovery signal your body gives you that you tend to ignore?",
      "Next time, note your exact self-talk during the session and what you did next.",
    ],
    shortQuestions: [
      "What does your body feel like right now — not good or bad, just what's actually there?",
      "What would rest look like today that doesn't feel like giving up?",
      "What would you tell a friend who said exactly what you just wrote?",
      "Next time, write two more sentences — what's underneath the first feeling?",
    ],
    mustHave:
      /\b(ran|run|running|workout|training|exercise|recovery|rest|hydration|pace|cardio|\d+\s*km|\d+\s*k)\b/,
    driftKeywords:
      /\b(colleague|coworker|manager|meeting|office|partner|wife|husband|girlfriend|boyfriend)\b/,
  },

  WORK: {
    summary:
      "What you're carrying: Something from work got under your skin today.\nWhat's really happening: The way it landed says something about what matters to you — and what you need to feel respected.",
    shortSummary:
      "What you're carrying: Something from work is sitting with you — quietly, but persistently.\nWhat's really happening: Even a few words can hold a lot of weight when they touch your sense of worth.",
    corepattern:
      "You're navigating a tension between your professional self-worth and what's being reflected back to you.",
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
      "What you're carrying: A gap between you and someone who matters opened up today.\nWhat's really happening: The distance you felt — and what you didn't say — is still with you.",
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
      "What you're carrying: Something you haven't fully named yet — but it's real enough to write down.\nWhat's really happening: The fact that you put it into words means part of you is already trying to understand it.",
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
// Anchors = the person's most vivid, specific phrases. Must appear in model output.
// This is the primary anti-template mechanism.

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

  // 1. Quoted phrases — highest signal value
  for (const m of t.matchAll(/["""]([^"""]{4,90})["""]/g)) {
    add(`"${m[1]}"`);
    if (anchors.length >= 3) break;
  }

  // 2. Emotionally vivid sentences — prioritise these over structural sentences
  const sentences = t.split(/\n|(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  const emotionalSignals = /\b(but|just|still|keep|always|never|again|somehow|quiet|ache|miss|wish|pretend|perform|smile|nod|sat|floor|nothing|empty|disappear|invisible|mask|mirror|watching|gap|distance|wanted|needed|tired|exhausted|fine|okay|somewhere|underneath)\b/i;

  for (const s of sentences) {
    if (anchors.length >= 4) break;
    if (emotionalSignals.test(s)) {
      add(s.length > 120 ? s.slice(0, 120).trim() : s);
    }
  }

  // 3. Fill with opening sentences if still short
  if (anchors.length < 2) {
    for (const s of sentences.slice(0, 4)) {
      add(s.length > 110 ? s.slice(0, 110).trim() : s);
      if (anchors.length >= 2) break;
    }
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

// FIX: comprehensive banned openers list — every template phrase found in Phase 2 audit
const BANNED_SUMMARY_OPENERS = [
  // WORK
  "a workplace moment that left a mark",
  "something from work got under your skin",
  "something happened at work",
  // RELATIONSHIP
  "something in this connection left you unsettled",
  "something in this connection",
  "a gap between you and someone who matters",
  "a connection that matters",
  // GENERAL
  "something is sitting with you",
  "something you haven't fully named yet",
  "something you haven't fully",
  "something important is asking",
  "something is asking to be noticed",
  "something quiet",
  // FITNESS
  "pride mixed with fatigue",
  "something happened in training today",
  "something happened in training",
  "something happened in your workout",
  // Cross-domain generic
  "something happened today that",
  "today was one of those days",
  "a moment felt important",
  "something left a mark",
  "something worth sitting with",
];

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
    // Anchor check — model must use at least one of the person's actual phrases
    const hasAnchor = anchors.some(a =>
      fullText.includes(a.toLowerCase().replace(/^[""]|[""]$/g, "").trim())
    );
    if (!hasAnchor) reasons.push("Missing verbatim anchor from entry");

    // Banned opener check — checks both starts-with and contains
    const summaryLower = summary.toLowerCase();
    for (const banned of BANNED_SUMMARY_OPENERS) {
      if (summaryLower.startsWith(banned) || summaryLower.includes(banned)) {
        reasons.push(`Generic template detected: "${banned}"`);
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
    ? `1) "What you're carrying:" — what the person is holding emotionally right now\n  2) "What's really happening:" — the deeper dynamic, named specifically using THEIR words\n  3) "Deeper direction:" — one forward-facing observation grounded in THIS entry`
    : `1) "What you're carrying:" — what the person is holding emotionally right now\n  2) "What's really happening:" — the deeper dynamic, named specifically using THEIR words`;

  const nextStepStructure = isPremium && !short
    ? `"Option A:" (practical, doable today) and "Option B:" (reflective alternative) and "Script line:" (1-2 calm sentences the person could actually say or write)`
    : `"Option A:" (practical, doable today) and "Option B:" (reflective alternative)`;

  const domainGuidance: Record<Domain, string> = {
    WORK: `DOMAIN: WORK
Name the exact workplace dynamic from this entry. Use the person's actual words.
"What you're carrying:" must open with what specifically happened — name the event, not the category.
"What's really happening:" must name what was touched: dignity, competence, recognition, belonging, or fairness.

FORMULA: "What you're carrying: You [specific action from entry] — and [what the person did/felt in response]."
Example shape (not words to copy): "You did X, nobody Y, and you Z." Fill in from THIS entry only.

HARD RULE: "What you're carrying:" must contain at least one concrete detail from the entry (a person, an action, an object, a response). If it contains zero concrete details — rewrite it.
Do NOT drift into relationship or fitness language.`,

    RELATIONSHIP: `DOMAIN: RELATIONSHIP
Name the specific relational dynamic from this entry — who, what happened, and what was left unsaid.
"What you're carrying:" must name who it involves and what specifically happened or didn't happen.
"What's really happening:" must name the actual gap: attention, presence, desire, reciprocity, or being seen.

FORMULA: "What you're carrying: You and [who] [what happened] — and [what you did or didn't do/say]."
Example shape (not words to copy): "You X and he Y — and you went quiet about Z." Fill in from THIS entry only.

HARD RULE: If the person used a vivid phrase — name it directly in your summary. "Wanted not needed", "miles apart", "the same fight again" — these belong in your words, not paraphrased away.`,

    FITNESS: `DOMAIN: FITNESS
Stay strictly in the physical/training lane. Name exactly what happened with the body or routine.
"What you're carrying:" must describe the actual experience — what they did (or didn't do), and what they felt about it.
"What's really happening:" must be about the body, energy, self-expectation, or the inner voice around training.

FORMULA: "What you're carrying: You [specific action: skipped/ran/completed X] — and [specific emotional response]."
Example shape (not words to copy): "You skipped X for the Y time and came home and Z." Fill in from THIS entry only.

CRITICAL — EMOTION RULE:
  SKIPPED or AVOIDED → guilt, resistance, self-doubt, exhaustion. NEVER pride.
  COMPLETED, felt good → pride, satisfaction, determination are valid.
  COMPLETED, felt empty → emptiness, confusion, disconnection.
  Match emotions to what ACTUALLY happened. Read the entry first.

BANNED: "Pride mixed with fatigue" — only if entry explicitly states both. Otherwise forbidden.
BANNED: "Something happened in training today" — too vague, always forbidden.`,

    GENERAL: `DOMAIN: GENERAL
This entry is about the person's inner state, a pattern, or something they're processing.
"What you're carrying:" must open with their specific situation — their exact words or a close echo.
"What's really happening:" must name the specific dynamic they're in — name it from their language, not a therapy label.

FORMULA: "What you're carrying: You [specific thing they described doing/feeling/noticing] — and [the emotional truth underneath it]."
Example shape (not words to copy): "You've been X for so long that Y — and in the gap between those two things is Z." Fill in from THIS entry only.

HARD RULE: The most specific or unusual phrase the person used MUST appear verbatim (or near-verbatim) in your summary or corepattern. If they wrote "editing myself before I even speak" or "performing a version of myself" — those exact words belong in your response.

BANNED: "Something is sitting with you", "Something you haven't fully named", "Something important is asking" — all forbidden.
BANNED: Any "What you're carrying:" that contains zero words from the actual entry.`,
  };

  const shortGuidance = short
    ? `\nSHORT ENTRY: Under 12 words. Be warm and curious — not analytical. Don't extract themes that aren't there.
"What you're carrying:" and "What's really happening:" should be brief and open. Questions invite more, not demand more.`
    : "";

  return `You are Havenly — a private journaling companion that reflects back what people write with warmth, clarity, and precision.

YOUR PRIMARY OBJECTIVE: Make the person feel genuinely seen — not processed through a template.
The quality test is simple: when they read your reflection, they should recognise their own words and think "yes, that's exactly what I meant."
If your reflection could be pasted onto 5 different entries and still make sense — it has failed. Start over.

CORE RULES — never break these:
- Write directly to "you". Never say "the user" or "this person".
- "What you're carrying:" MUST use the person's exact situation — not a category label. If they skipped the gym and sat on the floor, say so. If they did their colleague's work and nobody noticed, say so. If they said 'fine' to someone when they weren't fine, say so.
- "What's really happening:" MUST contain at least one phrase directly from the entry — close echo or verbatim. The reader should recognise their own words.
- "gentlenextstep" Options A and B MUST be specific to THIS entry — not advice that applies to anyone in this domain.
- Never invent events not in the entry.
- Questions must be specific enough that a different entry would produce different questions.

ANTI-TEMPLATE MANDATE — this overrides everything else:
Before you write "What you're carrying:", ask yourself:
"Could I paste this exact opener onto 5 different journal entries about [this domain] and have it still sound plausible?"
If yes — it is a template. Do not write it. Start with the entry's actual situation.

ABSOLUTELY BANNED summary phrases — these will fail quality check and trigger a retry:
- "A workplace moment that left a mark"
- "Something from work got under your skin"
- "Something in this connection left you unsettled"
- "Something is sitting with you"
- "Something you haven't fully named"
- "Something happened in training today"
- "Pride mixed with fatigue" (unless both are explicit)
- "Something important is asking for clarity"
- "Something happened today that"
- "A moment felt important"
- ANY "What you're carrying:" that starts with "Something [adjective/verb]" — always forbidden
- ANY "What you're carrying:" that contains zero words from the actual entry

${domainGuidance[domain]}
${shortGuidance}

TONE: Grounded, calm, perceptive. Speaks like a trusted friend who notices things. Not clinical, not preachy, not flattering. No padding phrases. No unnecessary reassurance.

REQUIRED OUTPUT STRUCTURE:

summary — in this exact labeled order:
${summaryStructure}

corepattern — ONE sentence naming the underlying dynamic. Specific to this entry. Not a category label. Not a therapeutic formula.

gentlenextstep — must include:
${nextStepStructure}
Both options must be concrete, doable today. Not abstract. Different from the questions.

questions — exactly 4. The LAST question MUST start with exactly: "Next time,"
All 4 questions must be specific enough to this entry that they would differ for a different entry.

OUTPUT: Return ONLY valid JSON with double-quoted strings. No markdown fences. No preamble. No explanation.
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

  const model = process.env.GROQMODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

  const entryBody = (input.content || "").trim();
  const titleLine = input.title?.trim() ? `Title: ${input.title.trim()}\n` : "";
  const entryText = `${titleLine}Entry:\n${entryBody}`;

  const domain = detectDomain(entryBody);
  const short = isShortEntry(entryBody);
  const anchors = extractAnchors(entryBody);

  // FIX: anchors now presented as explicit numbered constraints with
  // a hard instruction above them — forces the model to treat them as
  // requirements, not optional context it can skip.
  const anchorsBlock = anchors
    .map((a, i) => `ANCHOR ${i + 1}: ${a}`)
    .join("\n");

  const recentThemes = (input.recentThemes || [])
    .map(s => String(s).trim())
    .filter(Boolean)
    .slice(0, 5);

  const memoryBlock = recentThemes.length
    ? `RECENT PATTERN CONTEXT (reference only if genuinely relevant to this specific entry):\n${recentThemes.map((t, i) => `${i + 1}) ${t}`).join("\n")}\n\n`
    : "";

  const userPrompt = `${memoryBlock}THE PERSON'S EXACT WORDS (use at least one verbatim in your summary):
${anchorsBlock}

REMINDER: "What you're carrying:" must open with a concrete detail from this entry — not a generic label.
Bad: "What you're carrying: Something from work got under your skin."
Good: "What you're carrying: You did the shared report alone, nobody thanked you, and you're still carrying that silence."

${entryText}`.trim();

  const maxTokens = input.plan === "PREMIUM" ? 1100 : 750;
  const systemPrompt = buildSystemPrompt(input.plan, domain, short);

  const ATTEMPTS = [
    {
      temperature: input.plan === "PREMIUM" ? 0.55 : 0.45,
      note: undefined as string | undefined,
    },
    {
      temperature: 0.3,
      note: `RETRY — your previous "What you're carrying:" was rejected as a generic template. It must open with what SPECIFICALLY happened in this entry — name the action, the person, the moment. Use at least one phrase from THE PERSON'S EXACT WORDS above. Domain: ${domain}. All banned phrases still apply. Return ONLY valid JSON.`,
    },
    {
      temperature: 0.2,
      note: `FINAL ATTEMPT — "What you're carrying:" has failed twice for being generic. THIS TIME: start by reading the entry, pick the most specific thing the person described (an action, a phrase, a moment), and open with that. Example of what's needed: "What you're carrying: You [specific thing from entry]." The person's exact words are listed above — use them. Domain: ${domain}. Return ONLY valid JSON.`,
    },
  ];

  let bestParsed: any = null;

  for (let i = 0; i < ATTEMPTS.length; i++) {
    const { temperature, note } = ATTEMPTS[i];
    const system = note ? `${systemPrompt}\n\nRETRY INSTRUCTION: ${note}` : systemPrompt;

    let raw = "";
    try {
      raw = await callGroq({ apiKey, model, system, user: userPrompt, maxTokens, temperature });
    } catch (err) {
      console.warn(`[Havenly] Attempt ${i + 1} threw:`, err);
      continue;
    }

    const parsed = parseModelJson<any>(raw);
    if (!parsed) continue;

    bestParsed = parsed;

    const result = qualityCheck(parsed, anchors, input.plan, domain, short);
    if (result.pass) return normalizeReflection(parsed, domain, short);

    if (i === ATTEMPTS.length - 1) {
      console.warn("[Havenly] Quality gate failed after 3 attempts. Domain:", domain, "Reasons:", (result as any).reasons);
      return normalizeReflection(parsed, domain, short);
    }
  }

  // ─── Absolute last resort: template with anchor injected ──────────────────
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
    .replace("What's really happening:", `What's really happening: "${a1}" —`);

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
