// lib/ai/generateReflection.ts
// Havenly V19 — Universal reflection engine (robust against any journaling topic)
//
// Upgrades vs V18:
// - Deterministic “Entry Understanding Object” (EUO) to stabilize specificity + tone
// - Intent-first prompting (prevents wrong tone: grief ≠ fixing; venting ≠ advice)
// - Multi-label theme + emotion signals (still returns your existing Reflection shape)
// - Safer, corrected parsing + fixed template-literal / regex issues from copy/paste
// - Defaults rewritten to avoid banned-template phrases (so fallback passes quality more often)
// - Premium enhancements: layered insight + (optional) memory/pattern lens + progress marker
//
// Output remains the SAME:
// { summary, corepattern, themes, emotions, gentlenextstep, questions }

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
  plan: "FREE" | "PREMIUM" | string; // accept runtime variance safely
  recentThemes?: string[]; // user-level memory/pattern hints (strings)
};

type Domain =
  | "WORK"
  | "RELATIONSHIP"
  | "FITNESS"
  | "MONEY"
  | "HEALTH"
  | "GRIEF"
  | "PARENTING"
  | "CREATIVE"
  | "IDENTITY"
  | "GENERAL";

type Intent =
  | "VENTING"
  | "CLARITY"
  | "DECISION"
  | "REPAIR"
  | "GRIEF_PROCESSING"
  | "HEALTH_ANXIETY"
  | "CREATIVE_BLOCK"
  | "SELF_WORTH"
  | "PLANNING"
  | "UNKNOWN";

type State =
  | "AGITATED"
  | "SHUTDOWN"
  | "SHAME_SPIRAL"
  | "FEARFUL"
  | "SAD"
  | "CALM"
  | "MIXED";

type WeightedSignal = { re: RegExp; w: number };

/* ────────────────────────────────────────────────────────────────────────── */
/* Plan normalization                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

function normalizePlan(p: unknown): "FREE" | "PREMIUM" {
  const s = String(p ?? "").trim().toUpperCase();
  if (s === "PREMIUM" || s.includes("PREMIUM") || s.includes("PRO") || s.includes("UNLIMIT")) {
    return "PREMIUM";
  }
  return "FREE";
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Domain Detection (weighted; avoids pronoun false positives)                 */
/* ────────────────────────────────────────────────────────────────────────── */

const DOMAIN_SIGNALS: Record<Domain, WeightedSignal[]> = {
  FITNESS: [
    { re: /\b(ran|run|running|jog(ged)?|sprint(ed)?)\b/i, w: 2 },
    { re: /\b(workout|training|exercise|gym|lifting|cardio)\b/i, w: 2 },
    { re: /\b(pace|steps?|miles?|kilomet(?:res|ers)?|km|5k|8k|10k)\b/i, w: 2 },
    { re: /\b(sore|recovery|rest day|hydration|protein|reps|sets)\b/i, w: 1 },
  ],
  WORK: [
    { re: /\b(colleague|coworker|manager|boss|team|client)\b/i, w: 2 },
    { re: /\b(meeting|office|project|deadline|presentation)\b/i, w: 2 },
    { re: /\b(work|job|career|promotion|performance.?review)\b/i, w: 2 },
  ],
  RELATIONSHIP: [
    { re: /\b(partner|wife|husband|girlfriend|boyfriend|spouse)\b/i, w: 3 },
    { re: /\b(relationship|love|date|argu(e|ed|ment)|fight|break.?up)\b/i, w: 2 },
    { re: /\b(family|friend|parents?|sibling)\b/i, w: 1 },
    { re: /\b(invisible|unheard|unseen|disconnected|lonely|taken for granted)\b/i, w: 2 },
  ],
  MONEY: [
    { re: /\b(money|finances?|budget|debt|savings?|bills?|rent|mortgage)\b/i, w: 3 },
    { re: /\b(afford|expensive|broke|salary|income|spending|overdraft|loan)\b/i, w: 2 },
    { re: /\b(financial|bank|credit card|paycheck|cost of living)\b/i, w: 2 },
  ],
  HEALTH: [
    { re: /\b(doctor|hospital|diagnosis|symptoms?|medication|treatment)\b/i, w: 3 },
    { re: /\b(illness|sick|pain|chronic|anxiety|mental health|therapy)\b/i, w: 2 },
    { re: /\b(scan|test results?|appointment|specialist|blood)\b/i, w: 2 },
    { re: /\b(burnout|panic|depress(ed|ion)|insomnia)\b/i, w: 1 },
  ],
  GRIEF: [
    { re: /\b(grief|grieving|loss|lost|died|death|passed away|funeral)\b/i, w: 3 },
    { re: /\b(miss|missing|gone|no longer|remember|memories)\b/i, w: 2 },
    { re: /\b(mourning|bereavement|anniversary|memorial)\b/i, w: 2 },
  ],
  PARENTING: [
    { re: /\b(kid|kids|child|children|son|daughter|baby|toddler|teen)\b/i, w: 3 },
    { re: /\b(parenting|parent|motherhood|fatherhood|school|homework)\b/i, w: 2 },
    { re: /\b(bedtime|tantrums?|behavio(u)?r|discipline|daycare)\b/i, w: 1 },
  ],
  CREATIVE: [
    { re: /\b(writing|write|drawing|painting|music|art|design|creative|creativity)\b/i, w: 3 },
    { re: /\b(project|portfolio|novel|song|screenplay|poem|blog)\b/i, w: 2 },
    { re: /\b(block|stuck|inspired|creating|making|building|coding)\b/i, w: 2 },
    { re: /\b(blank page|draft|publish|share|audience)\b/i, w: 1 },
  ],
  IDENTITY: [
    { re: /\b(who I am|who am I|identity|purpose|meaning|direction)\b/i, w: 3 },
    { re: /\b(belong|belonging|authentic|real self|mask)\b/i, w: 2 },
    { re: /\b(values?|belief|change|transition|quarter.?life|mid.?life)\b/i, w: 2 },
    { re: /\b(perform|performing|version of myself|showing up)\b/i, w: 2 },
  ],
  GENERAL: [],
};

const EMOTIONAL_BOOSTERS: Record<Exclude<Domain, "GENERAL">, WeightedSignal[]> = {
  WORK: [
    { re: /\b(humiliat|embarrass|dismiss|invisible|overlooked|undervalued|unfair)\b/i, w: 1 },
    { re: /\b(cried|crying|tears|hurt|angry|rage|shame)\b/i, w: 1 },
  ],
  RELATIONSHIP: [
    { re: /\b(invisible|lonely|disconnected|unloved|unheard|ignored|taken for granted)\b/i, w: 1 },
    { re: /\b(cried|crying|hurt|heartbreak|ache|longing|miss)\b/i, w: 1 },
  ],
  FITNESS: [
    { re: /\b(ran|run|running|workout|gym|cardio|lifting|training|exercise)\b/i, w: 1 },
    { re: /\b(pace|km|miles|5k|10k|8k|reps|sets|pb|personal best)\b/i, w: 1 },
  ],
  MONEY: [
    { re: /\b(shame|embarrass|stress|panic|spiral|overwhelm|hopeless|stuck)\b/i, w: 1 },
    { re: /\b(can't afford|cannot afford|no money|broke|debt|behind|late|overdue)\b/i, w: 1 },
  ],
  HEALTH: [
    { re: /\b(scared|terrified|anxious|worried|uncertain|diagnosis|results)\b/i, w: 1 },
    { re: /\b(chronic|daily|constant|can't|unable|struggling|managing)\b/i, w: 1 },
  ],
  GRIEF: [
    { re: /\b(cried|crying|tears|heartbreak|ache|miss|longing|hollow|empty)\b/i, w: 1 },
    { re: /\b(anniversary|remembered|thought of|dreamed|photo|voice)\b/i, w: 1 },
  ],
  PARENTING: [
    { re: /\b(guilt|failing|bad parent|overwhelmed|exhausted|snapped|yelled)\b/i, w: 1 },
    { re: /\b(worried|scared|proud|frustrated|helpless|lost)\b/i, w: 1 },
  ],
  CREATIVE: [
    { re: /\b(blocked|stuck|nothing|empty|can't|pointless|worthless|comparison)\b/i, w: 1 },
    { re: /\b(inspiration|flow|finally|breakthrough|proud|finished)\b/i, w: 1 },
  ],
  IDENTITY: [
    { re: /\b(lost|confused|don't know|do not know|unsure|searching|hollow|empty)\b/i, w: 1 },
    { re: /\b(changed|changing|different|anymore|used to|used to be)\b/i, w: 1 },
  ],
};

function scoreDomain(text: string): Record<Domain, number> {
  const s = text.toLowerCase();
  const scores: Record<Domain, number> = {
    FITNESS: 0,
    WORK: 0,
    RELATIONSHIP: 0,
    MONEY: 0,
    HEALTH: 0,
    GRIEF: 0,
    PARENTING: 0,
    CREATIVE: 0,
    IDENTITY: 0,
    GENERAL: 0,
  };

  for (const [domain, signals] of Object.entries(DOMAIN_SIGNALS) as [Domain, WeightedSignal[]][]) {
    let sum = 0;
    for (const sig of signals) {
      if (sig.re.test(s)) sum += sig.w;
    }
    scores[domain] = sum;
  }
  return scores;
}

function emotionalBoost(text: string, domain: Exclude<Domain, "GENERAL">): number {
  const s = text.toLowerCase();
  let boost = 0;
  for (const sig of EMOTIONAL_BOOSTERS[domain]) {
    if (sig.re.test(s)) boost += sig.w;
  }
  return boost;
}

export function detectDomain(text: string): Domain {
  const scores = scoreDomain(text);
  const sorted = (Object.entries(scores) as [Domain, number][])
    .filter(([d]) => d !== "GENERAL")
    .sort(([, a], [, b]) => b - a);

  const [top, second] = sorted;

  if (!top || top[1] <= 0) return "GENERAL";

  const secondScore = second?.[1] ?? 0;
  const margin = top[1] - secondScore;

  if (top[1] < 2 && margin <= 0) return "GENERAL";
  if (margin >= 2) return top[0];

  const topBoost = emotionalBoost(text, top[0] as Exclude<Domain, "GENERAL">);
  const secondBoost = second ? emotionalBoost(text, second[0] as Exclude<Domain, "GENERAL">) : 0;

  if (topBoost === secondBoost && margin <= 0) return "GENERAL";
  return topBoost >= secondBoost ? top[0] : (second?.[0] ?? top[0]);
}

function isShortEntry(text: string): boolean {
  return text.trim().split(/\s+/).length < 12;
}

/* ────────────────────────────────────────────────────────────────────────── */
/* EUO: deterministic entry understanding object                               */
/* ────────────────────────────────────────────────────────────────────────── */

type EUO = {
  anchors: string[]; // verbatim
  facts: string[]; // extracted without guessing
  themes: string[]; // multi-label hints (not the final Reflection themes)
  emotions: string[]; // multi-label hints (not the final Reflection emotions)
  intent: Intent;
  state: State;
  tensions: string[];
  needs: string[];
  sensitivities: {
    userSaysDontFix?: boolean; // e.g., "I don't want to feel better"
    griefTone?: boolean;
    medicalUncertainty?: boolean;
  };
};

const FACT_PATTERNS: RegExp[] = [
  /\b(today|yesterday|tonight|this morning|this week|this month|on Sundays?)\b/i,
  /\b(can't afford|cannot afford|behind|overdue|rent|mortgage|bills?)\b/i,
  /\b(test results?|doctor wants me to come in|appointment|scan|blood)\b/i,
  /\b(yelled|snapped|argued|fight|broke up)\b/i,
];

const EMOTION_LEXICON: { tag: string; re: RegExp }[] = [
  { tag: "anxiety", re: /\b(anxious|anxiety|worried|worry|panic|panicked|scared|terrified)\b/i },
  { tag: "shame", re: /\b(shame|ashamed|embarrass|pretend|performing|failing)\b/i },
  { tag: "sadness", re: /\b(sad|cry|crying|tears|heartbreak|grief|miss|missing|hollow|empty)\b/i },
  { tag: "anger", re: /\b(angry|rage|furious|yelled|snapped|irritat|resent)\b/i },
  { tag: "overwhelm", re: /\b(overwhelm|too much|can't do this|exhausted|burnout|tired)\b/i },
  { tag: "numbness", re: /\b(numb|nothing|flat|shut down|can't feel)\b/i },
  { tag: "hope", re: /\b(hope|relief|better|progress|proud)\b/i },
];

const THEME_LEXICON: { tag: string; re: RegExp }[] = [
  { tag: "safety", re: /\b(safe|safety|security|rent|money|home|stable)\b/i },
  { tag: "control", re: /\b(control|out of control|can't|unable|stuck)\b/i },
  { tag: "belonging", re: /\b(belong|alone|lonely|unseen|unheard|disconnected)\b/i },
  { tag: "self-worth", re: /\b(worth|good enough|failing|not good|never as good)\b/i },
  { tag: "boundaries", re: /\b(boundary|boundaries|overstep|respect|dismiss)\b/i },
  { tag: "uncertainty", re: /\b(uncertain|unknown|don't know|unsure|waiting)\b/i },
  { tag: "avoidance", re: /\b(avoid|avoiding|can't start|procrastinat|staring at)\b/i },
  { tag: "repair", re: /\b(apolog|make it right|repair|hurt him|hurt her)\b/i },
];

function uniq(arr: string[], max = 8): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const x of arr) {
    const k = x.trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(x.trim());
    if (out.length >= max) break;
  }
  return out;
}

function inferIntent(text: string, domain: Domain): Intent {
  const s = text.toLowerCase();

  if (/\bi don't want to feel better\b/i.test(text) || domain === "GRIEF") return "GRIEF_PROCESSING";
  if (domain === "HEALTH" && /\b(test results?|doctor wants me to come in|scared|terrified)\b/i.test(text))
    return "HEALTH_ANXIETY";
  if (domain === "CREATIVE" && /\b(blank page|staring|block|stuck)\b/i.test(text)) return "CREATIVE_BLOCK";
  if (/\bshould i\b|\bwhat do i do\b|\bhow do i\b|\bnext step\b/i.test(text)) return "CLARITY";
  if (/\bdecide|decision|choose|which one|either\b/i.test(text)) return "DECISION";
  if (/\byelled|snapped|said something|hurt\b/i.test(text)) return "REPAIR";
  if (/\bplan|schedule|tomorrow|this week|budget|steps\b/i.test(text)) return "PLANNING";
  if (/\bpretend|performing|never as good|failing|broken\b/i.test(text)) return "SELF_WORTH";
  if (/\bjust need to\b|\bi'm tired of\b|\bi can't\b|\bvent\b/i.test(text)) return "VENTING";

  return "UNKNOWN";
}

function inferState(text: string): State {
  const s = text.toLowerCase();

  if (/\b(shame|ashamed|embarrass|pretend|performing|failing)\b/i.test(text)) return "SHAME_SPIRAL";
  if (/\b(scared|terrified|panic|worried|anxious)\b/i.test(text)) return "FEARFUL";
  if (/\b(angry|rage|furious|yelled|snapped)\b/i.test(text)) return "AGITATED";
  if (/\b(numb|flat|shut down|can't feel|empty)\b/i.test(text)) return "SHUTDOWN";
  if (/\b(grief|miss|cry|sad|heartbreak)\b/i.test(text)) return "SAD";
  if (/\b(calm|okay|fine)\b/i.test(text)) return "CALM";

  return "MIXED";
}

function deriveNeeds(domain: Domain, intent: Intent, themes: string[], emotions: string[]): string[] {
  const needs: string[] = [];
  const add = (n: string) => needs.push(n);

  if (themes.includes("safety") || domain === "MONEY") add("safety");
  if (themes.includes("control") || intent === "DECISION") add("control");
  if (themes.includes("belonging") || domain === "RELATIONSHIP") add("connection");
  if (themes.includes("self-worth") || intent === "SELF_WORTH") add("dignity");
  if (domain === "WORK") add("respect");
  if (domain === "HEALTH") add("reassurance");
  if (domain === "GRIEF") add("meaning");
  if (domain === "PARENTING") add("repair");
  if (domain === "CREATIVE") add("permission");

  if (emotions.includes("overwhelm")) add("rest");

  return uniq(needs, 6);
}

function deriveTensions(domain: Domain, intent: Intent, themes: string[]): string[] {
  const t: string[] = [];
  const add = (x: string) => t.push(x);

  if (domain === "MONEY") add("security vs pride");
  if (domain === "WORK") add("recognition vs self-protection");
  if (domain === "RELATIONSHIP") add("connection vs self-respect");
  if (domain === "HEALTH") add("certainty vs waiting");
  if (domain === "CREATIVE") add("expression vs judgment");
  if (domain === "IDENTITY") add("authenticity vs approval");
  if (domain === "PARENTING") add("patience vs depletion");
  if (domain === "GRIEF") add("love vs moving forward");

  if (themes.includes("control") && themes.includes("uncertainty")) add("control vs uncertainty");

  return uniq(t, 5);
}

function extractFacts(entry: string): string[] {
  const facts: string[] = [];
  const t = entry.trim();
  const lines = t.split("\n").map((l) => l.trim()).filter(Boolean);
  const joined = lines.join(" ");

  // pull up to 3 “fact-ish” snippets without guessing
  for (const re of FACT_PATTERNS) {
    const m = joined.match(re);
    if (m?.[0]) facts.push(m[0]);
  }

  // also capture numbers/currency if present
  for (const m of joined.matchAll(/\b(\$|€|£)?\s?\d{1,3}(?:,\d{3})*(?:\.\d+)?\b/g)) {
    facts.push(m[0]);
    if (facts.length >= 4) break;
  }

  return uniq(facts, 5);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Anchor Extraction (better quotes support)                                   */
/* ────────────────────────────────────────────────────────────────────────── */

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

  // 1) Quoted phrases — high signal (supports smart quotes)
  for (const m of t.matchAll(/["“”]([^"“”]{4,120})["“”]/g)) {
    add(`"${m[1]}"`);
    if (anchors.length >= 3) break;
  }

  // 2) Split on sentence end
  const lines = t.split("\n").map((l) => l.trim()).filter(Boolean);
  const joined = lines.join(" ");
  const sentences = joined.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);

  const emotionalSignals =
    /\b(but|just|still|keep|always|never|again|ache|miss|wish|pretend|perform|nothing|empty|disappear|invisible|gap|distance|wanted|needed|tired|exhausted|fine|okay|underneath|scared|afraid|worried|hopeless|stuck|alone|lost|failed)\b/i;

  for (const s of sentences) {
    if (anchors.length >= 4) break;
    if (emotionalSignals.test(s) && s.length <= 180) add(s);
  }

  // 3) Fill with first sentences if needed
  if (anchors.length < 2) {
    for (const s of sentences.slice(0, 4)) {
      if (s.length <= 180) add(s);
      if (anchors.length >= 2) break;
    }
  }

  if (anchors.length < 1) add("you wrote this down, which means it matters");

  return anchors.slice(0, 5);
}

function buildEUO(entryBody: string, domain: Domain): EUO {
  const anchors = extractAnchors(entryBody);

  const emotionHits = uniq(
    EMOTION_LEXICON.filter((x) => x.re.test(entryBody)).map((x) => x.tag),
    6
  );

  const themeHits = uniq(
    THEME_LEXICON.filter((x) => x.re.test(entryBody)).map((x) => x.tag),
    6
  );

  const intent = inferIntent(entryBody, domain);
  const state = inferState(entryBody);

  const sensitivities = {
    userSaysDontFix: /\bi don't want to feel better\b/i.test(entryBody),
    griefTone: domain === "GRIEF",
    medicalUncertainty:
      domain === "HEALTH" && /\b(test results?|doctor wants me to come in|results back|appointment)\b/i.test(entryBody),
  };

  const needs = deriveNeeds(domain, intent, themeHits, emotionHits);
  const tensions = deriveTensions(domain, intent, themeHits);
  const facts = extractFacts(entryBody);

  return {
    anchors,
    facts,
    themes: themeHits,
    emotions: emotionHits,
    intent,
    state,
    tensions,
    needs,
    sensitivities,
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Defaults (rewritten to avoid banned-template phrasing)                      */
/* ────────────────────────────────────────────────────────────────────────── */

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
      "What you're carrying: Your training session left a specific feeling in your body that you’re still holding.\nWhat's really happening: The meaning you’re making from performance is shaping how you treat yourself after the workout.",
    shortSummary:
      "What you're carrying: A small signal from your body is asking to be noticed.\nWhat's really happening: Noticing is part of training too — especially when you’re tired.",
    corepattern:
      "You’re trying to build consistency while your mind keeps turning effort into a verdict about you.",
    themes: ["consistency", "recovery", "self-respect", "motivation"],
    emotions: ["determination", "uncertainty", "tiredness"],
    nextStepFree:
      'Option A: Choose one recovery action today (sleep, hydration, easy walk) and treat it as training. Option B: Define tomorrow’s effort as "easy" or "hard" before you start.',
    nextStepPremium:
      'Option A: Choose one recovery action today (sleep, hydration, easy walk) and treat it as training. Option B: Define tomorrow’s effort as "easy" or "hard" before you start. Script line: "I’m building consistency — recovery counts."',
    shortNextStep:
      "Option A: Name one physical sensation you notice right now (no judgment). Option B: Write one sentence about what showing up costs you lately.",
    questions: [
      "What did you actually feel in your body today — not good or bad, just what was there?",
      "What would healthy discipline look like this week — not perfection?",
      "What recovery signal do you tend to ignore until it gets loud?",
      "Next time, note your exact self-talk during the session and what you did next.",
    ],
    shortQuestions: [
      "What does your body feel like right now — not good or bad, just what's there?",
      "What would rest look like today that doesn’t feel like giving up?",
      "What would you tell a friend who wrote exactly this?",
      "Next time, write two more sentences — what’s underneath the first feeling?",
    ],
    mustHave:
      /\b(ran|run|running|workout|training|exercise|recovery|rest|hydration|pace|cardio|\d+\s*km|\d+\s*k)\b/i,
    driftKeywords: /\b(colleague|coworker|manager|meeting|office|partner|wife|husband|girlfriend|boyfriend)\b/i,
  },

  WORK: {
    summary:
      "What you're carrying: A work moment landed in a way you’re still replaying.\nWhat's really happening: When work touches your sense of respect, it rarely stays “just professional.”",
    shortSummary:
      "What you're carrying: A work interaction is still echoing.\nWhat's really happening: A few words can carry a lot when they hit your sense of worth.",
    corepattern:
      "You’re balancing competence with the need to feel respected — and that tension is exhausting.",
    themes: ["recognition", "boundaries", "self-worth"],
    emotions: ["frustration", "hurt", "determination"],
    nextStepFree:
      "Option A: Write down the one thing you wish had gone differently. Option B: Name what you’d want to say if there were no consequences.",
    nextStepPremium:
      'Option A: Write down the one thing you wish had gone differently. Option B: Name what you’d want to say if there were no consequences. Script line: "I want to be clear about what I need here."',
    shortNextStep:
      'Option A: Finish this sentence — "What I needed in that moment was...". Option B: Write one thing you want to be different next time.',
    questions: [
      "What felt most dismissed — your idea, your effort, or your presence?",
      "What would a calm, direct version of yourself say in that moment?",
      "What boundary would protect you without escalating?",
      "Next time, write down the exact words exchanged and your immediate reaction.",
    ],
    shortQuestions: [
      "What’s the one word that best describes how that made you feel?",
      "If a colleague described the same situation, what would you tell them?",
      "What would it look like to protect yourself here without escalating?",
      "Next time, write more — what happened just before, and just after?",
    ],
    mustHave: /\b(work|meeting|colleague|manager|office|team|project|boss|client|performance)\b/i,
    driftKeywords: /\b(partner|wife|husband|girlfriend|boyfriend|workout|running|gym)\b/i,
  },

  RELATIONSHIP: {
    summary:
      "What you're carrying: A moment with someone important left you feeling a certain kind of distance.\nWhat's really happening: What went unsaid is part of what’s hurting.",
    shortSummary:
      "What you're carrying: A relationship feeling is still lingering.\nWhat's really happening: Something small can land big when it touches your need to be seen.",
    corepattern:
      "You’re trying to stay connected while protecting your self-respect at the same time.",
    themes: ["connection", "visibility", "self-worth"],
    emotions: ["hurt", "longing", "confusion"],
    nextStepFree:
      "Option A: Name the feeling in one sentence without blaming anyone. Option B: Ask yourself what you most needed in that moment.",
    nextStepPremium:
      'Option A: Name the feeling in one sentence without blaming anyone. Option B: Ask yourself what you most needed in that moment. Script line: "I want to understand this before I respond."',
    shortNextStep:
      'Option A: Finish this sentence — "What I needed was...". Option B: Notice whether you want to speak, or simply to be seen.',
    questions: [
      "What exactly did that moment trigger — anger, shame, fear, or something else?",
      "What’s the most generous interpretation that still respects your feelings?",
      "What would you ask for if you knew you’d be heard without judgment?",
      "Next time, paste the exact words that stung and what you did immediately after.",
    ],
    shortQuestions: [
      "What’s the feeling underneath this — loneliness, disappointment, fear, or something else?",
      "Who came to mind when you wrote this?",
      "What would it feel like to say this out loud to someone safe?",
      "Next time, write two more sentences — what happened right before the feeling arrived?",
    ],
    mustHave:
      /\b(partner|wife|husband|girlfriend|boyfriend|relationship|family|friend|love|date|argu(e|ed|ment)|fight|break.?up)\b/i,
    driftKeywords: /\b(colleague|manager|meeting|workout|gym|running)\b/i,
  },

  MONEY: {
    summary:
      "What you're carrying: Money pressure is forcing you to look at a hard number or deadline.\nWhat's really happening: It’s not only logistics — it’s your sense of safety and dignity getting squeezed.",
    shortSummary:
      "What you're carrying: A money worry is front and center today.\nWhat's really happening: The number is tied to how secure you feel.",
    corepattern:
      "You’re carrying the gap between what you have, what you need, and what you think that gap says about you.",
    themes: ["security", "control", "shame", "planning"],
    emotions: ["anxiety", "shame", "overwhelm"],
    nextStepFree:
      "Option A: Write down the most urgent money fact — just the fact, not the spiral. Option B: Name one piece of control you do have today.",
    nextStepPremium:
      'Option A: Write down the most urgent money fact — just the fact, not the spiral. Option B: Name one piece of control you do have today. Script line: "I’m handling one concrete thing at a time."',
    shortNextStep:
      "Option A: Name the feeling under the money stress (fear, shame, pressure). Option B: Write one sentence about what “enough” would mean for you right now.",
    questions: [
      "What’s the specific fear underneath this — consequences, judgment, or losing stability?",
      "What’s one small step today that moves toward the problem (not away)?",
      "When did money last feel manageable — what was different then?",
      "Next time, write the exact thought that triggered the spiral and what followed.",
    ],
    shortQuestions: [
      "Is this about a specific number, or the feeling behind it?",
      "What would feel like “safer” right now — not solved, just safer?",
      "What would you tell someone you care about in this exact situation?",
      "Next time, note whether the feeling is about the present, the past, or the future.",
    ],
    mustHave:
      /\b(money|financial|budget|debt|savings|bills|rent|mortgage|afford|broke|salary|income|spending|bank|paycheck)\b/i,
    driftKeywords: /\b(colleague|manager|partner|wife|husband|workout|gym)\b/i,
  },

  HEALTH: {
    summary:
      "What you're carrying: Your body (or test results) has put uncertainty on your mind.\nWhat's really happening: Waiting and not knowing can feel like losing control — even before you have answers.",
    shortSummary:
      "What you're carrying: A health concern is sitting with you today.\nWhat's really happening: Your attention keeps returning to it for a reason — it matters.",
    corepattern:
      "You’re trying to live your life while uncertainty keeps pulling you back to worst-case possibilities.",
    themes: ["uncertainty", "body awareness", "self-care", "control"],
    emotions: ["anxiety", "fear", "frustration"],
    nextStepFree:
      "Option A: Write what you know (facts) vs what you fear (stories). Option B: Name one gentle thing your body needs today that isn’t about fixing.",
    nextStepPremium:
      'Option A: Write what you know (facts) vs what you fear (stories). Option B: Name one gentle thing your body needs today that isn’t about fixing. Script line: "I can hold uncertainty without solving it today."',
    shortNextStep:
      "Option A: Notice where you feel this worry in your body. Option B: Write one sentence about what you wish someone understood about this.",
    questions: [
      "What’s the hardest part — symptoms, uncertainty, or the feeling of losing control?",
      "Is there anything you’ve been pushing past that your body has been repeating?",
      "Who in your life knows how this has been affecting you — and who doesn’t?",
      "Next time, write what changed since you last felt okay in your body.",
    ],
    shortQuestions: [
      "What does your body feel like right now — not thoughts, just sensations?",
      "Is there one small thing your body is asking for today?",
      "What would it feel like to be gentle with yourself about this?",
      "Next time, note what triggered the worry and what helped it settle.",
    ],
    mustHave:
      /\b(doctor|hospital|diagnosis|symptoms|medication|illness|sick|pain|health|medical|body|anxiety|therapy|mental|test results?)\b/i,
    driftKeywords: /\b(colleague|manager|partner|workout|gym|running|money|budget)\b/i,
  },

  GRIEF: {
    summary:
      "What you're carrying: Grief has returned in a very specific way (a day, a habit, a moment).\nWhat's really happening: Missing them is an expression of love, not a problem to solve.",
    shortSummary:
      "What you're carrying: A wave of grief showed up today.\nWhat's really happening: It makes sense that love still reaches for them.",
    corepattern:
      "You’re learning how to keep love present without forcing yourself to “move on” faster than your heart can.",
    themes: ["loss", "memory", "identity", "time"],
    emotions: ["grief", "longing", "sadness"],
    nextStepFree:
      "Option A: Write one small, specific memory you want to keep close. Option B: Let the feeling be here without turning it into a task.",
    nextStepPremium:
      'Option A: Write one small, specific memory you want to keep close. Option B: Let the feeling be here without turning it into a task. Script line: "I’m allowed to miss them — and I’m allowed to still be here."',
    shortNextStep:
      "Option A: Sit with the feeling for 60 seconds before doing anything else. Option B: Write one sentence that begins with: “I miss…”",
    questions: [
      "What triggered this today — something you saw, heard, or remembered?",
      "What do you wish people understood about what this loss is like for you?",
      "Is there something you never got to say — and is there a way to say it now, privately?",
      "Next time, write one vivid memory (what you saw, heard, felt).",
    ],
    shortQuestions: [
      "What showed up — a memory, a feeling, or something unexpected?",
      "Is there anyone who can hold this with you, even quietly?",
      "What would be the gentlest thing you could do for yourself today?",
      "Next time, write one specific thing you miss — in detail.",
    ],
    mustHave:
      /\b(grief|loss|lost|died|death|passed|miss|missing|gone|mourning|remember|anniversary)\b/i,
    driftKeywords: /\b(colleague|manager|workout|gym|money|budget)\b/i,
  },

  PARENTING: {
    summary:
      "What you're carrying: A parenting moment (and your reaction to it) is still sitting heavy in you.\nWhat's really happening: The guilt is pointing to how much you care — and how thin you were stretched.",
    shortSummary:
      "What you're carrying: A parenting moment is replaying in your mind.\nWhat's really happening: Caring this much can hurt when you don’t like how you showed up.",
    corepattern:
      "You’re trying to be the parent you want to be while running into real human limits.",
    themes: ["guilt", "self-doubt", "unconditional love", "exhaustion"],
    emotions: ["guilt", "love", "overwhelm"],
    nextStepFree:
      "Option A: Name one moment you did show up with care (even if imperfect). Option B: Identify what you needed (sleep, support, pause) before it escalated.",
    nextStepPremium:
      'Option A: Name one moment you did show up with care (even if imperfect). Option B: Identify what you needed (sleep, support, pause) before it escalated. Script line: "I can repair this — and I can learn my early warning signs."',
    shortNextStep:
      "Option A: Separate the moment from your identity: “I yelled” vs “I am a bad parent.” Option B: Write one line you could say to repair.",
    questions: [
      "What story are you telling yourself about what this moment means for your child?",
      "What would you tell a close friend who described this exact situation?",
      "What did you need right before you reached your limit?",
      "Next time, write the earliest warning sign you were approaching your edge.",
    ],
    shortQuestions: [
      "Is this about what happened, or what you fear it means?",
      "What’s one thing your child knows about being loved by you?",
      "What would “good enough” look like today — not perfect, just enough?",
      "Next time, note the moment before the guilt arrived — what was happening?",
    ],
    mustHave:
      /\b(kid|kids|child|children|son|daughter|baby|toddler|teen|parent|parenting|motherhood|fatherhood)\b/i,
    driftKeywords: /\b(colleague|manager|workout|gym|money|partner|husband|wife)\b/i,
  },

  CREATIVE: {
    summary:
      "What you're carrying: Your creative work is meeting resistance (avoidance, doubt, or pressure).\nWhat's really happening: The block often protects you from judgment — especially your own.",
    shortSummary:
      "What you're carrying: Creating feels heavier than it used to.\nWhat's really happening: The resistance is information, not proof you can’t do it.",
    corepattern:
      "You want to create, but part of you is treating the work as a referendum on your worth.",
    themes: ["creative block", "self-doubt", "identity", "process"],
    emotions: ["frustration", "self-doubt", "longing"],
    nextStepFree:
      "Option A: Do 10 minutes of deliberately imperfect work. Option B: Write what you’re afraid will happen if the work exists and is seen.",
    nextStepPremium:
      'Option A: Do 10 minutes of deliberately imperfect work. Option B: Write what you’re afraid will happen if the work exists and is seen. Script line: "The work doesn’t have to be good yet — it has to exist."',
    shortNextStep:
      "Option A: Do 5 minutes with a timer and no judging. Option B: Write about the last time creating felt easy — what was different?",
    questions: [
      "What are you afraid the work will reveal about you?",
      "When did this feel fun rather than loaded — what was different then?",
      "Is the block about the work itself, or about who might see it?",
      "Next time, write the very first thought you had when you sat down to create.",
    ],
    shortQuestions: [
      "What does creating feel like in your body right now — tight, flat, heavy?",
      "Is there a smaller, lower-stakes version of this project?",
      "What would you make if nobody would ever see it?",
      "Next time, note whether the block arrived before or after you started.",
    ],
    mustHave:
      /\b(writing|write|drawing|painting|music|art|design|creative|project|novel|song|poem|blog|draft|blank page|creating|making)\b/i,
    driftKeywords: /\b(colleague|manager|partner|gym|money|doctor|wife|husband|girlfriend|boyfriend)\b/i,
  },

  IDENTITY: {
    summary:
      "What you're carrying: A question about who you are (or who you’re becoming) is taking up space.\nWhat's really happening: When you’ve been performing for others, it can get hard to hear your own voice.",
    shortSummary:
      "What you're carrying: Something about who you are feels unclear.\nWhat's really happening: Asking honestly is already movement.",
    corepattern:
      "You’re transitioning between an old self you can perform and a truer self you’re still learning to trust.",
    themes: ["identity", "authenticity", "purpose", "change"],
    emotions: ["confusion", "longing", "uncertainty"],
    nextStepFree:
      "Option A: List three qualities that feel true about you (not achievements). Option B: Name one role you’re tired of performing.",
    nextStepPremium:
      'Option A: List three qualities that feel true about you (not achievements). Option B: Name one role you’re tired of performing. Script line: "I don’t have to know who I’m becoming yet — I can move toward what’s true."',
    shortNextStep:
      "Option A: Write one sentence that feels most “you” right now. Option B: Notice if this feels like a crisis or a becoming.",
    questions: [
      "When did you last feel like yourself — what were you doing?",
      "What are you performing for other people that you’re tired of maintaining?",
      "What would you do differently if you stopped worrying about how it looks?",
      "Next time, write one specific moment you felt most like yourself — in detail.",
    ],
    shortQuestions: [
      "What’s one word that feels true about you right now — even uncomfortably?",
      "What have you been giving up to fit what others expect?",
      "What would it feel like to not know yet — and still be okay?",
      "Next time, write what you want — not what you think you should want.",
    ],
    mustHave:
      /\b(identity|who I am|purpose|authentic|real self|mask|performing|version of myself|belong|lost|direction|meaning|transition)\b/i,
    driftKeywords: /\b(colleague|manager|gym|workout|money|doctor|wife|husband|girlfriend|boyfriend)\b/i,
  },

  GENERAL: {
    summary:
      "What you're carrying: You named something that matters, even if it’s not fully organized yet.\nWhat's really happening: Putting it into words is your mind trying to make sense of what you’re living through.",
    shortSummary:
      "What you're carrying: You showed up to write.\nWhat's really happening: Even one line can be a doorway into what’s underneath.",
    corepattern:
      "You’re in the middle of something — and part of you is asking for clarity.",
    themes: ["self-awareness", "processing", "presence"],
    emotions: ["uncertainty", "restlessness", "quiet courage"],
    nextStepFree:
      "Option A: Write one more sentence: what feeling is underneath the first one? Option B: Ask: is this about something that happened, something expected, or something missing?",
    nextStepPremium:
      'Option A: Write one more sentence: what feeling is underneath the first one? Option B: Ask: is this about something that happened, something expected, or something missing? Script line: "I don’t need the answer — I can stay with the question."',
    shortNextStep:
      "Option A: Sit with it for 60 seconds and see if one honest word arrives. Option B: Write one more line — it doesn’t have to be polished.",
    questions: [
      "What’s the feeling that’s hardest to name right now?",
      "Is this about something that happened, something you’re expecting, or something you’re missing?",
      "What would one small step toward clarity look like — not resolution, just clarity?",
      "Next time, write for two more minutes without stopping — what else is there?",
    ],
    shortQuestions: [
      "Where do you feel this in your body right now?",
      "If you had to guess what’s underneath, what would you say?",
      "What would help right now — company, quiet, movement, or something else?",
      "Next time, write for two more minutes without stopping — what else comes up?",
    ],
    mustHave: /./,
    driftKeywords: /(?!)/,
  },
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Template bans (regex-based; catches variations)                             */
/* ────────────────────────────────────────────────────────────────────────── */

const BANNED_SUMMARY_PATTERNS: RegExp[] = [
  /\ba workplace moment that left a mark\b/i,
  /\bsomething from work\b/i,
  /\bsomething happened at work\b/i,

  /\bsomething in this connection\b/i,
  /\ba gap between you and someone\b/i,
  /\ba connection that matters\b/i,

  /\bsomething is sitting with you\b/i,
  /\bsomething you haven't fully named\b/i,
  /\bsomething quiet\b/i,
  /\bsomething worth sitting with\b/i,

  /\bsomething happened in training\b/i,
  /\bpride mixed with fatigue\b/i,

  /\bthere'?s a financial weight\b/i,
  /\bsomething about money\b/i,

  /\byour body (or mind )?is asking\b/i,
  /\bsomething about your health\b/i,

  /\byou'?re in grief\b/i,
  /\bsomething about loss is with you\b/i,

  /\bsomething about parenting\b/i,
  /\bsomething about your child\b/i,

  /\bsomething about your creative work\b/i,
  /\byour creative energy is somewhere\b/i,

  /\ba question about who you are\b/i,
  /\bsomething about who you are\b/i,
];

const WRH_CROSS_DOMAIN_BANS: Record<Domain, RegExp[]> = {
  CREATIVE: [/\bdistance you felt\b/i, /\bwhat you didn't say\b/i, /\bgap between you\b/i],
  WORK: [],
  RELATIONSHIP: [],
  FITNESS: [],
  MONEY: [],
  HEALTH: [],
  GRIEF: [],
  PARENTING: [],
  IDENTITY: [],
  GENERAL: [],
};

/* ────────────────────────────────────────────────────────────────────────── */
/* JSON Parsing (non-destructive; brace-scan)                                  */
/* ────────────────────────────────────────────────────────────────────────── */

function stripCodeFences(raw: string): string {
  return raw.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, "$1").trim();
}

function extractFirstJsonObject(raw: string): string | null {
  const s = stripCodeFences(raw);
  const start = s.indexOf("{");
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < s.length; i++) {
    const ch = s[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") depth--;

    if (depth === 0) return s.slice(start, i + 1);
  }
  return null;
}

function parseModelJson<T>(raw: string): T | null {
  const json = extractFirstJsonObject(raw);
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Quality Gate (premium enforced; summary-on-domain; WRH leak guard)          */
/* ────────────────────────────────────────────────────────────────────────── */

type QualityResult = { pass: true } | { pass: false; reasons: string[] };

function extractSummaryLine(summary: string, label: string): string {
  const m = summary.match(new RegExp(`${label}\\s*([^\\n]+)`, "i"));
  return (m?.[1] ?? "").trim();
}

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9'"\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function anchorHitInLine(line: string, anchors: string[]): boolean {
  const ln = normalizeForMatch(line);
  for (const a of anchors) {
    const aa = normalizeForMatch(a.replace(/^["“”]|["“”]$/g, ""));
    if (aa.length >= 8 && ln.includes(aa)) return true;
  }
  return false;
}

function qualityCheck(
  parsed: any,
  e: EUO,
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

  if (!summary.includes("What you're carrying:")) reasons.push('Missing "What you\'re carrying:"');
  if (!summary.includes("What's really happening:")) reasons.push('Missing "What\'s really happening:"');

  const carrying = extractSummaryLine(summary, "What you're carrying:");
  const wrh = extractSummaryLine(summary, "What's really happening:");

  if (!short) {
    if (!anchorHitInLine(carrying, e.anchors) && !anchorHitInLine(wrh, e.anchors)) {
      reasons.push("Missing anchor in carrying/WRH line");
    }
  }

  if (!short) {
    for (const re of BANNED_SUMMARY_PATTERNS) {
      if (re.test(summary)) {
        reasons.push("Generic template detected");
        break;
      }
    }
  }

  if (plan === "PREMIUM" && !short) {
    if (!summary.includes("Deeper direction:")) reasons.push('Missing "Deeper direction:" (PREMIUM)');
    if (!/Script line:/i.test(nextStep)) reasons.push("Missing Script line (PREMIUM)");
  }

  const minLen = short ? 80 : plan === "PREMIUM" ? 260 : 160;
  if (summary.length < minLen) reasons.push(`Summary too short (${summary.length} < ${minLen})`);

  if (!/Option A:/i.test(nextStep)) reasons.push("Missing Option A");
  if (!/Option B:/i.test(nextStep)) reasons.push("Missing Option B");

  const minArr = plan === "PREMIUM" ? 3 : 2;
  if (themes.length < minArr) reasons.push(`themes: need ${minArr}, got ${themes.length}`);
  if (emotions.length < minArr) reasons.push(`emotions: need ${minArr}, got ${emotions.length}`);
  if (questions.length < 2) reasons.push(`questions: need 2, got ${questions.length}`);

  const lastQ = String(questions[questions.length - 1] ?? "");
  if (!lastQ.toLowerCase().startsWith("next time,")) reasons.push('Last question must start with "Next time,"');

  if (domain !== "GENERAL") {
    const summaryOnly = `${carrying}\n${wrh}\n${extractSummaryLine(summary, "Deeper direction:")}`.trim();
    if (!defaults.mustHave.test(summaryOnly)) reasons.push(`Domain signal missing in summary for ${domain}`);
    if (defaults.driftKeywords.test(summaryOnly)) reasons.push(`Domain drift in summary for ${domain}`);
  }

  for (const ban of WRH_CROSS_DOMAIN_BANS[domain] ?? []) {
    if (ban.test(wrh)) {
      reasons.push(`Cross-domain leakage in WRH for ${domain}`);
      break;
    }
  }

  // Sensitivity guard: if user explicitly says “don’t fix”, the model must not push “feel better”
  if (e.sensitivities.userSaysDontFix) {
    if (/\bfeel better\b/i.test(summary) || /\bmove on\b/i.test(summary) || /\bget over\b/i.test(summary)) {
      reasons.push("Tone mismatch: user said they don't want to feel better");
    }
  }

  return reasons.length === 0 ? { pass: true } : { pass: false, reasons };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Deterministic repair for generic carrying line                              */
/* ────────────────────────────────────────────────────────────────────────── */

function repairGenericCarrying(summary: string, anchors: string[]): string {
  if (!summary.includes("What you're carrying:")) return summary;

  const carrying = extractSummaryLine(summary, "What you're carrying:");
  const isGeneric = BANNED_SUMMARY_PATTERNS.some((re) => re.test(`What you're carrying: ${carrying}`));
  if (!isGeneric) return summary;

  const a = anchors[0] || anchors[1] || "";
  const clean = a.replace(/^["“”]|["“”]$/g, "").trim();
  const injected =
    clean.length >= 12
      ? `You wrote: "${clean}" — and it’s still sitting with you.`
      : `You wrote: "${clean}" — and it’s still sitting with you.`;

  return summary.replace(/What you're carrying:\s*[^\n]+/i, `What you're carrying: ${injected}`);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Normalization (ensures exactly 4 questions)                                 */
/* ────────────────────────────────────────────────────────────────────────── */

function ensureFourQuestions(qs: string[], domain: Domain, short: boolean): string[] {
  const defaults = short ? DOMAIN_DEFAULTS[domain].shortQuestions : DOMAIN_DEFAULTS[domain].questions;
  const out = qs.filter(Boolean).slice(0, 4);

  while (out.length < 4) out.push(defaults[out.length] ?? defaults[defaults.length - 1]);
  if (!out[out.length - 1].toLowerCase().startsWith("next time,")) out[out.length - 1] = defaults[3];

  return out;
}

function normalizeReflection(
  r: any,
  domain: Domain,
  short: boolean,
  plan: "FREE" | "PREMIUM",
  e: EUO
): Reflection {
  const defaults = DOMAIN_DEFAULTS[domain];

  const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const cleanArr = (v: unknown, max: number): string[] =>
    Array.isArray(v) ? v.map((x) => String(x ?? "").trim()).filter(Boolean).slice(0, max) : [];

  let summary = clean(r?.summary) || (short ? defaults.shortSummary : defaults.summary);

  if (!short) summary = repairGenericCarrying(summary, e.anchors);

  const themes = cleanArr(r?.themes, 6);
  const emotions = cleanArr(r?.emotions, 6);
  const questions = ensureFourQuestions(cleanArr(r?.questions, 6), domain, short);

  const step = clean(r?.gentlenextstep);
  const gentlenextstep =
    step ||
    (short
      ? defaults.shortNextStep
      : plan === "PREMIUM"
        ? defaults.nextStepPremium
        : defaults.nextStepFree);

  // If premium & not short: hard-enforce script line if missing
  let enforcedStep = gentlenextstep;
  if (plan === "PREMIUM" && !short && !/Script line:/i.test(enforcedStep)) {
    enforcedStep = `${enforcedStep} Script line: "I can take one clear step at a time."`;
  }

  // If model returned empty themes/emotions, use deterministic EUO hints first, then defaults
  const finalThemes = themes.length ? themes : (e.themes.length ? e.themes : defaults.themes);
  const finalEmotions = emotions.length ? emotions : (e.emotions.length ? e.emotions : defaults.emotions);

  return {
    summary,
    corepattern: clean(r?.corepattern) || defaults.corepattern,
    themes: uniq(finalThemes, 6),
    emotions: uniq(finalEmotions, 6),
    gentlenextstep: enforcedStep,
    questions,
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Prompt Builder (intent-first; premium adds layered insight)                 */
/* ────────────────────────────────────────────────────────────────────────── */

function buildSystemPrompt(plan: "FREE" | "PREMIUM", domain: Domain, short: boolean, e: EUO): string {
  const isPremium = plan === "PREMIUM";

  const summaryStructure =
    isPremium && !short
      ? `1) "What you're carrying:" — open with a concrete detail + one verbatim anchor
2) "What's really happening:" — the deeper dynamic, still grounded in their words
3) "Deeper direction:" — one forward-facing observation grounded in THIS entry
4) (Premium only) "What this might be touching:" — 2–3 layers (needs/tensions), no diagnosing
5) (Premium only) "Progress marker:" — 1 small thing to notice next time`
      : `1) "What you're carrying:" — open with a concrete detail + one verbatim anchor
2) "What's really happening:" — the deeper dynamic, still grounded in their words`;

  const nextStepStructure =
    isPremium && !short
      ? `"Option A:" (practical, doable today) + "Option B:" (reflective alternative) + "Script line:" (1–2 calm sentences they could actually say/write)`
      : `"Option A:" (practical, doable today) + "Option B:" (reflective alternative)`;

  const shortGuidance = short
    ? `\nSHORT ENTRY: Under 12 words. Be warm and curious — not analytical. Ask questions that invite more, don’t demand.`
    : "";

  const domainHint =
    domain === "GENERAL"
      ? `DOMAIN: GENERAL (unknown topic)
HARD RULE: Do NOT become vague. Use the most specific phrase from the entry as the anchor.
If topic is unclear, treat it as "uncertainty + what it touches (safety / belonging / worth / control)".`
      : `DOMAIN: ${domain}
HARD RULE: Stay inside this domain. Do not borrow lines that sound like other domains.`;

  const sensitivityRules = `SENSITIVITY RULES:
- Never invent events not present in the entry
- No diagnosing; no medical/legal instructions
- If the user explicitly says they do NOT want to “feel better”, do not push reframes that aim at moving on. Witness + meaning + permission instead.`;

  const intentRules = `INTENT-FIRST TONE:
- Intent = ${e.intent}, State = ${e.state}
- If intent is VENTING: reflect + clarify; keep actions minimal
- If intent is DECISION/CLARITY: options + tradeoffs + values
- If intent is REPAIR: accountability + script that repairs without self-shaming
- If intent is GRIEF_PROCESSING: witnessing + ritual/meaning; avoid “fixing”
- If intent is HEALTH_ANXIETY: separate facts vs fears; grounding; encourage appropriate follow-up without giving medical advice
- If intent is CREATIVE_BLOCK: reduce stakes; micro-steps; address fear of judgment`;

  return `You are Havenly — a private journaling companion.
Your job is to make the person feel genuinely seen, with precision, and to help them think better.

CORE RULES:
- Write to "you"
- Use at least ONE verbatim phrase from the entry in the summary (carrying or what's really happening)
- Avoid templates and generic openings
- If the opener could apply to many people, rewrite it using what THIS person wrote

${sensitivityRules}
${intentRules}

OUTPUT STRUCTURE:
summary (labeled lines in order):
${summaryStructure}

corepattern — ONE sentence describing the specific dynamic in THIS entry (not a category label).

gentlenextstep:
${nextStepStructure}

questions — exactly 4. The LAST must start with exactly: "Next time,"
All questions must be specific enough that another entry would produce different questions.

${domainHint}
${shortGuidance}

OUTPUT: Return ONLY valid JSON with double-quoted strings. No markdown.
{
  "summary": "...",
  "corepattern": "...",
  "themes": ["...", "...", "..."],
  "emotions": ["...", "...", "..."],
  "gentlenextstep": "...",
  "questions": ["...", "...", "...", "Next time, ..."]
}`.trim();
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Groq Caller                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

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

/* ────────────────────────────────────────────────────────────────────────── */
/* Main Export                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

export async function generateReflectionFromEntry(input: Input): Promise<Reflection> {
  const apiKey = process.env.GROQAPIKEY || process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQAPIKEY");

  const model = process.env.GROQMODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

  const plan = normalizePlan(input.plan);

  const entryBody = (input.content || "").trim();
  const titleLine = input.title?.trim() ? `Title: ${input.title.trim()}\n` : "";
  const entryText = `${titleLine}Entry:\n${entryBody}`;

  const domain = detectDomain(`${input.title || ""}\n${entryBody}`);
  const short = isShortEntry(entryBody);

  // Build EUO (deterministic)
  const e = buildEUO(entryBody, domain);

  const recentThemes = (input.recentThemes || [])
    .map((s) => String(s).trim())
    .filter(Boolean)
    .slice(0, 6);

  const memoryBlock =
    plan === "PREMIUM" && recentThemes.length
      ? `RECENT PATTERN CONTEXT (use only if clearly supported by this entry; do not overclaim):
${recentThemes.map((t, i) => `${i + 1}) ${t}`).join("\n")}

`
      : "";

  const anchorsBlock = e.anchors.map((a, i) => `ANCHOR ${i + 1}: ${a}`).join("\n");
  const factsBlock = e.facts.length ? `FACTS (no guessing):\n- ${e.facts.join("\n- ")}\n\n` : "";
  const euoBlock = `EUO (deterministic; use for tone and precision):
- Intent: ${e.intent}
- State: ${e.state}
- Needs: ${e.needs.join(", ") || "unknown"}
- Tensions: ${e.tensions.join(", ") || "unknown"}
- Theme hints: ${e.themes.join(", ") || "none"}
- Emotion hints: ${e.emotions.join(", ") || "none"}
- Sensitivities: ${JSON.stringify(e.sensitivities)}

`;

  const userPrompt = `${memoryBlock}${factsBlock}${euoBlock}THE PERSON'S EXACT WORDS — you MUST use at least one ANCHOR verbatim in the summary:
${anchorsBlock}

REMINDER:
- "What you're carrying:" must open with a concrete detail from this entry (not a generic opener).
- Stay in DOMAIN: ${domain}.
- Do not invent details.

${entryText}`.trim();

  const maxTokens = plan === "PREMIUM" ? 1200 : 800;
  const systemPrompt = buildSystemPrompt(plan, domain, short, e);

  const ATTEMPTS = [
    { temperature: plan === "PREMIUM" ? 0.55 : 0.45, note: undefined as string | undefined },
    {
      temperature: 0.28,
      note: `RETRY — previous output failed quality rules. Fix missing labels, use an ANCHOR verbatim in the summary, and stay in DOMAIN: ${domain}. Return ONLY valid JSON.`,
    },
    {
      temperature: 0.18,
      note: `FINAL RETRY — be highly specific. Start with the most concrete thing they wrote. Include an ANCHOR verbatim in carrying or what's really happening. Respect intent/state. Stay in DOMAIN: ${domain}. Return ONLY JSON.`,
    },
  ];

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

    const result = qualityCheck(parsed, e, plan, domain, short);
    if (result.pass) return normalizeReflection(parsed, domain, short, plan, e);

    if (i === ATTEMPTS.length - 1) {
      console.warn(
        "[Havenly] Quality gate failed after 3 attempts. Domain:",
        domain,
        "Reasons:",
        (result as any).reasons
      );
      return normalizeReflection(parsed, domain, short, plan, e);
    }
  }

  // Last resort: deterministic default with anchor injection + premium enforcement
  const defaults = DOMAIN_DEFAULTS[domain];
  const a1 = e.anchors[0] || "what you wrote";
  const base = short ? defaults.shortSummary : defaults.summary;

  let summaryWithAnchor = base.replace(
    "What you're carrying:",
    `What you're carrying: You wrote: ${a1} — and it’s still here with you.`
  );

  if (plan === "PREMIUM" && !short) {
    if (!summaryWithAnchor.includes("Deeper direction:")) {
      summaryWithAnchor += `\nDeeper direction: ${defaults.corepattern}`;
    }
    if (!summaryWithAnchor.includes("What this might be touching:")) {
      summaryWithAnchor += `\nWhat this might be touching: ${e.needs.slice(0, 3).join(", ") || "safety, belonging, worth"}.`;
    }
    if (!summaryWithAnchor.includes("Progress marker:")) {
      summaryWithAnchor += `\nProgress marker: Notice the earliest moment the feeling starts (before it spikes).`;
    }
  }

  // Soft memory echo (premium only; avoid overclaiming)
  if (plan === "PREMIUM" && recentThemes.length) {
    summaryWithAnchor += `\nPattern lens: This may relate to a theme you’ve touched before — "${recentThemes[0]}".`;
  }

  return normalizeReflection(
    {
      summary: summaryWithAnchor,
      corepattern: defaults.corepattern,
      themes: e.themes.length ? e.themes : defaults.themes,
      emotions: e.emotions.length ? e.emotions : defaults.emotions,
      gentlenextstep:
        short ? defaults.shortNextStep : plan === "PREMIUM" ? defaults.nextStepPremium : defaults.nextStepFree,
      questions: short ? defaults.shortQuestions : defaults.questions,
    },
    domain,
    short,
    plan,
    e
  );
}
