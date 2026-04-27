/**
 * lib/ai/generateReflection.ts
 *
 * Core AI reflection engine for Quiet Mirror.
 *
 * Responsibilities:
 * - Domain detection (WORK, RELATIONSHIP, HEALTH, MONEY, GRIEF, PARENTING,
 *   CREATIVE, IDENTITY, FITNESS, GENERAL) via weighted keyword signals
 * - Groq/Llama prompt construction and response parsing
 * - Quality-gate post-processing: banned opener repair, anchor injection,
 *   emotion normalisation, question generation
 * - Crisis content detection (always checked before sending to AI)
 * - Locale-aware output (passes AI language name to model)
 *
 * Exports:
 *   generateReflectionFromEntry(input) — primary entry point
 *   detectDomain(text)                 — exposed for testing
 *   detectSecondaryDomains(text, primary)
 *   detectCrisisContent(text)
 */

import { CONFIG } from "@/app/lib/config";
import { getAiLanguageName } from "@/app/lib/i18n";

export type Reflection = {
  summary: string;
  corepattern?: string;
  themes: string[];
  emotions: string[];
  gentlenextstep: string;
  questions: string[];
  domain?: Domain;
  secondaryDomains?: Domain[];
};

type Input = {
  title?: string;
  content: string;
  plan: "FREE" | "PREMIUM" | string;
  recentThemes?: string[];
  locale?: string;
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

/* ── Plan normalization ─────────────────────────────────────────────────── */

function normalizePlan(p: unknown): "FREE" | "PREMIUM" {
  const s = String(p ?? "").trim().toUpperCase();
  if (s === "PREMIUM" || s.includes("PREMIUM") || s.includes("PRO") || s.includes("UNLIMIT")) {
    return "PREMIUM";
  }
  return "FREE";
}

/* ── Domain Detection ───────────────────────────────────────────────────── */

type WeightedSignal = { re: RegExp; w: number };

const DOMAIN_SIGNALS: Record<Domain, WeightedSignal[]> = {
  FITNESS: [
    // Exclude "running through" (mental rumination), "running late", "running on empty",
    // "run of bad luck", "ran into" (encountered), "ran through my mind" — these are NOT fitness.
    { re: /\b(ran|run|running|jog(ged)?|sprint(ed)?)\b(?!\s+(through|into|out|late|on empty|of bad|my mind|everything|it all|over))/i, w: 2 },
    { re: /\b(workout|exercise|gym|lifting|cardio)\b/i, w: 2 },
    // "training" only counts when paired with a physical context word — not "I've been training myself to..."
    { re: /\b(training)\b(?=.{0,40}\b(run|gym|race|athlete|sport|fitness|physical|body|strength|endurance)\b)/i, w: 2 },
    { re: /\b(pace|steps?|miles?|kilomet(?:res|ers)?|km|5k|8k|10k)\b/i, w: 2 },
    { re: /\b(sore|rest day|hydration|protein|reps|sets)\b/i, w: 1 },
    // "recovery" only in physical context — not "recovery from grief/divorce/burnout"
    { re: /\b(recovery)\b(?=.{0,40}\b(run|gym|race|athlete|sport|fitness|physical|training|workout|muscle|injury)\b)/i, w: 1 },
  ],
  WORK: [
    { re: /\b(colleague|coworker|manager|boss|team|client)\b/i, w: 2 },
    { re: /\b(meeting|office|project|deadline|presentation)\b/i, w: 2 },
    { re: /\b(work|job|career|promotion|performance.?review)\b/i, w: 2 },
    // Work overload signals — guilt, can't stop, behind
    { re: /\b(work.*piling|piling up|work load|workload|too much work)\b/i, w: 3 },
    { re: /\b(saying yes|can't say no|hard to stop|find it hard to stop|hard to switch off|can't stop working)\b/i, w: 3 },
    { re: /\b(behind on everything|feel behind|falling behind|behind at work|behind on work)\b/i, w: 3 },
    { re: /\b(stayed up|up until|up working|working late|worked late|all night|until 2am|until 1am|until 3am)\b/i, w: 2 },
    { re: /\b(guilty.*leaving|leaving.*guilty|felt guilty.*stop|guilty.*stop)\b/i, w: 3 },
    // FIX Bug1: new signals for implicit work dynamics
    { re: /\b(project lead|project manager|lead on|team lead)\b/i, w: 3 },
    { re: /\b(overlooked|passed over|sidelined|not consulted|nobody asked|no one asked)\b/i, w: 3 },
    { re: /\b(been here|years here|months here|tenure|seniority)\b/i, w: 2 },
    { re: /\b(recognition|credit|contribution|effort|visibility|appreciated|respected)\b/i, w: 2 },
    { re: /\b(found out|told in|learned in|announced|they gave|they chose|they picked)\b/i, w: 2 },
    { re: /\b(coworker|colleague|peer|teammate|my manager|my boss|my team)\b/i, w: 2 },
  ],
  RELATIONSHIP: [
    { re: /\b(partner|wife|husband|girlfriend|boyfriend|spouse)\b/i, w: 3 },
    { re: /\b(relationship|love|date|argu(e|ed|ment)|fight|break.?up)\b/i, w: 2 },
    { re: /\b(family|friend|best friend|parents?|sibling|sister|brother|mum|mom|dad|father|mother)\b/i, w: 2 },
    { re: /\b(invisible|unheard|unseen|disconnected|lonely|taken for granted|drifting apart|growing apart)\b/i, w: 2 },
    { re: /\b(told me|said to me|didn't say|the way (he|she|they)|between us|our relationship)\b/i, w: 2 },
    // Implicit relationship distress signals — replaying, distance, silence
    { re: /\b(keep replaying|replaying it|keep thinking about|can't stop thinking|sitting with me|been sitting with)\b/i, w: 3 },
    { re: /\b(weird distance|strange distance|distance between us|something between us|neither.*addressing|not addressing)\b/i, w: 3 },
    { re: /\b(said the wrong|wrong thing|said something|conversation.*last week|last week.*conversation)\b/i, w: 2 },
    { re: /\b(close friend|good friend|old friend|my friend)\b/i, w: 2 },
  ],
  MONEY: [
    { re: /\b(bank statements?|bank account|can't make rent|can't afford rent|can't pay)\b/i, w: 5 },
    { re: /\b(money|finances?|budget|debt|savings?|bills?|rent|mortgage)\b/i, w: 3 },
    { re: /\b(afford|expensive|broke|salary|income|spending|overdraft|loan)\b/i, w: 2 },
    { re: /\b(financial|bank|credit card|paycheck|cost of living)\b/i, w: 2 },
  ],
  HEALTH: [
    { re: /\b(doctor|hospital|diagnosis|symptoms?|medication|treatment)\b/i, w: 3 },
    { re: /\b(illness|sick|pain|chronic|anxiety|mental health|therapy)\b/i, w: 2 },
    { re: /\b(scan|test results?|appointment|specialist|blood)\b/i, w: 2 },
    { re: /\b(burnout|panic|depress(ed|ion)|insomnia)\b/i, w: 1 },
    // Sleep & mental health signals — common entries that belong in HEALTH
    { re: /\b(can'?t sleep|sleep properly|sleep well|wake up at|waking up at|woke up at|lying awake|wide awake|3am|4am|2am)\b/i, w: 4 },
    { re: /\b(sleep(ing)?|insomnia|tired|exhausted|fatigue|restless)\b(?!.{0,20}\b(workout|training|gym|run|race)\b)/i, w: 2 },
    { re: /\b(racing mind|racing thoughts|brain won'?t stop|can'?t switch off|mind going|rumina)\b/i, w: 3 },
    { re: /\b(anxious|anxiety|panic|overwhelm|burnt out|burnout|breaking point)\b/i, w: 2 },
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
    { re: /\b(blank page|draft|publish|share|audience|staring)\b/i, w: 2 },
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
    { re: /\b(ran|run|running|workout|gym|cardio|lifting|exercise)\b(?!\s+(through|into|out|late|on empty|over))/i, w: 1 },
    { re: /\b(pace|km|miles|5k|10k|8k|reps|sets|pb|personal best)\b/i, w: 1 },
  ],
  MONEY: [
    { re: /\b(shame|embarrass|stress|panic|spiral|overwhelm|hopeless|stuck)\b/i, w: 1 },
    { re: /\b(can't afford|no money|broke|debt|behind|late|overdue)\b/i, w: 1 },
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
    { re: /\b(lost|confused|don't know|unsure|searching|hollow|empty)\b/i, w: 1 },
    { re: /\b(changed|changing|different|anymore|used to|used to be)\b/i, w: 1 },
  ],
};

/* Strong "pressure driver" signals.
   These intentionally outweigh contextual WORK mentions like meeting/coworker
   when the real entry pressure is money / health / identity. */
const PRESSURE_SIGNALS: Partial<Record<Exclude<Domain, "GENERAL">, WeightedSignal[]>> = {
  MONEY: [
    { re: /\b(bank(ing)? app|bank account|checking my bank|numbers|rent|behind on rent|can't afford|money|debt|bills?|overdraft|paycheck|salary)\b/i, w: 5 },
    { re: /\b(financial|broke|can't pay|can't make rent|late payment|loan)\b/i, w: 4 },
  ],
  HEALTH: [
    { re: /\b(doctor|diagnosis|test results?|scan|symptoms?|pain|health|body|blood work|appointment|specialist)\b/i, w: 5 },
    { re: /\b(illness|sick|panic attack|chest tight|couldn't breathe|health anxiety)\b/i, w: 4 },
    // Sleep-specific pressure signals — high confidence HEALTH entries
    { re: /\b(can'?t sleep|haven'?t slept|sleep properly|wake up at \d|waking up at \d|lying awake|wide awake at)\b/i, w: 6 },
    { re: /\b(racing mind|racing thoughts|brain (just )?starts? (running|going)|can'?t switch off|rumina)\b/i, w: 5 },
    { re: /\b(six weeks|weeks? (of|without) sleep|months? (of|without) sleep)\b/i, w: 3 },
  ],
  IDENTITY: [
    { re: /\b(who I am|what kind of person|don't recognize myself|version of myself|performing competence|performing|mask|fake|fraud|pretending|authentic|self-worth)\b/i, w: 5 },
    // Flexible: "I don't know what I want", "I genuinely don't know what I actually want anymore"
    { re: /\bi\s+(genuinely\s+|really\s+|honestly\s+)?don'?t\s+know\s+what\s+i\s+(actually\s+|even\s+|really\s+)?want\b/i, w: 4 },
    { re: /\bdon'?t know who i am\b|\bnot myself\b|\bbecoming someone i don'?t respect\b/i, w: 4 },
    // "I couldn't tell you what I need/want" — key IDENTITY signal from Entry #5
    { re: /\bcouldn'?t tell you what i\s+(need|want|feel|am)\b/i, w: 5 },
    // "I've spent so long being [role] for everyone else"
    { re: /\bspent so long being\b|\bbeing the person who\b|\bholding everything together\b/i, w: 4 },
    // "I can tell you what X needs but not what I need"
    { re: /\b(tell you (exactly )?what\s+\w+\s+needs|know what\s+\w+\s+needs).{0,60}(what i need|my own needs)\b/i, w: 5 },
  ],
  PARENTING: [
    { re: /\b(my son|my daughter|my child|my kid|snapped at (him|her|them)|yelled at (him|her|them)|look on (his|her|their) face)\b/i, w: 5 },
  ],
  GRIEF: [
    { re: /\b(i miss (him|her|them)|passed away|died|loss|funeral|anniversary|grief)\b/i, w: 5 },
  ],
  CREATIVE: [
    { re: /\b(blank page|novel|document for the novel|haven't written|used to love writing|draft|create|creative block)\b/i, w: 5 },
  ],
  RELATIONSHIP: [
    { re: /\b(we had a fight|we argued|he left|she left|they left|walking away|gave up on (me|us)|doesn't love|fell out of love|cheated|affair|betrayed)\b/i, w: 5 },
    { re: /\b(not talking|stopped talking|haven't spoken|she ended|he ended|they ended)\b/i, w: 4 },
    // Implicit relationship rupture — distance, replaying, something unsaid
    { re: /\b(weird distance|strange between us|keep replaying|replaying.*conversation|can't stop thinking about.*said|been sitting with me)\b/i, w: 4 },
    { re: /\b(said the wrong thing|said something wrong|the wrong thing|something I said|something I did)\b/i, w: 3 },
    { re: /\b(neither.*addressing|not addressing it|both.*pretending|neither.*talking)\b/i, w: 4 },
  ],
  // FIX Bug1: WORK pressure signals for implicit workplace dynamics
  WORK: [
    { re: /\b(project lead|project manager|lead on the|team lead|gave the (lead|project|role) to)\b/i, w: 5 },
    { re: /\b(been here (for )?\d|years here|\d years.{0,20}(work|job|company|here))\b/i, w: 4 },
    { re: /\b(nobody asked|no one asked|wasn'?t consulted|not (asked|told|included)|found out (in|at) the meeting)\b/i, w: 4 },
    { re: /\b(overlooked|passed over|skipped over|not chosen|they chose|they picked|went to (him|her|them) instead)\b/i, w: 4 },
  ],
};

function scoreDomain(text: string): Record<Domain, number> {
  const s = text.toLowerCase();
  const scores: Record<Domain, number> = {
    FITNESS: 0, WORK: 0, RELATIONSHIP: 0, MONEY: 0,
    HEALTH: 0, GRIEF: 0, PARENTING: 0, CREATIVE: 0, IDENTITY: 0, GENERAL: 0,
  };

  for (const [domain, signals] of Object.entries(DOMAIN_SIGNALS) as [Domain, WeightedSignal[]][]) {
    let sum = 0;
    for (const sig of signals) if (sig.re.test(s)) sum += sig.w;
    scores[domain] = sum;
  }

  for (const [domain, signals] of Object.entries(PRESSURE_SIGNALS) as [Exclude<Domain, "GENERAL">, WeightedSignal[]][]) {
    for (const sig of signals) {
      if (sig.re.test(s)) scores[domain] += sig.w;
    }
  }

  return scores;
}

function emotionalBoost(text: string, domain: Exclude<Domain, "GENERAL">): number {
  const s = text.toLowerCase();
  let boost = 0;
  for (const sig of EMOTIONAL_BOOSTERS[domain]) if (sig.re.test(s)) boost += sig.w;
  return boost;
}

function detectPrimaryPressureDomain(text: string): Domain | null {
  const s = text.toLowerCase();

  const priority: [Domain, number][] = [];
  for (const [domain, signals] of Object.entries(PRESSURE_SIGNALS) as [Exclude<Domain, "GENERAL">, WeightedSignal[]][]) {
    let sum = 0;
    for (const sig of signals) if (sig.re.test(s)) sum += sig.w;
    if (sum > 0) priority.push([domain, sum]);
  }

  priority.sort((a, b) => b[1] - a[1]);
  if (!priority.length) return null;

  const [top, second] = priority;
  if (!top) return null;
  if ((second?.[1] ?? 0) >= top[1]) return null;

  return top[0];
}

export function detectDomain(text: string): Domain {
  const pressure = detectPrimaryPressureDomain(text);
  if (pressure) return pressure;

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

export function detectSecondaryDomains(text: string, primary: Domain): Domain[] {
  const scores = scoreDomain(text);
  return (Object.entries(scores) as [Domain, number][])
    .filter(([d, s]) => d !== "GENERAL" && d !== primary && s >= 3)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([d]) => d);
}

function isShortEntry(text: string): boolean {
  return text.trim().split(/\s+/).length < 12;
}

/* ── Domain Defaults ────────────────────────────────────────────────────── */

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
      "What you're carrying: Something that happened with your body is still with you.\nWhat's really happening: The gap between what your body did and what you felt about it is worth sitting with.",
    shortSummary:
      "What you're carrying: A quiet signal from your body asking to be noticed.\nWhat's really happening: You showed up — and that's the part worth sitting with before asking what comes next.",
    corepattern: "You're learning to read the difference between pushing toward something and pushing away from discomfort.",
    themes: ["consistency", "recovery", "self-respect", "motivation"],
    emotions: ["uncertainty", "determination", "tiredness", "pride"],
    nextStepFree: "Option A: Choose one recovery action today (sleep, hydration, easy walk) and treat it as training. Option B: Define tomorrow's effort as \"easy\" or \"hard\" before you start.",
    nextStepPremium: "Option A: Choose one recovery action today (sleep, hydration, easy walk) and treat it as training. Option B: Define tomorrow's effort as \"easy\" or \"hard\" before you start. Script line: \"I'm building consistency — recovery is part of my plan.\"",
    shortNextStep: "Option A: Notice one physical sensation right now and name it without judging it. Option B: Write one sentence about what showing up costs you lately.",
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
    mustHave: /\b(ran|run|running|workout|training|exercise|recovery|rest|hydration|pace|cardio|\d+\s*km|\d+\s*k)\b/i,
    driftKeywords: /\b(colleague|coworker|manager|meeting|office|partner|wife|husband|girlfriend|boyfriend)\b/i,
  },

  WORK: {
    summary:
      "What you're carrying: Something from work is still sitting with you.\nWhat's really happening: The way it landed says something about what you need to feel respected.",
    shortSummary:
      "What you're carrying: A work moment that's still sitting with you.\nWhat's really happening: Even small moments at work can say something about what we need.",
    corepattern: "The gap between what you contributed and what was recognized is where the feeling lives.",
    themes: ["recognition", "visibility", "respect", "professional worth"],
    emotions: ["frustration", "hurt", "self-doubt", "anger"],
    nextStepFree: "Option A: Write down what you wish had happened instead — specifically. Option B: Name the one person at work who actually sees your contribution.",
    nextStepPremium: "Option A: Write down the one thing you wish had gone differently. Option B: Name what you'd want to say if there were no consequences. Script line: \"I want to be clear about what I need here, without escalating.\"",
    shortNextStep: "Option A: Write one sentence about what you actually needed from that situation. Option B: Name whether this is about one incident or a pattern.",
    questions: [
      "What felt most personal about what happened — the specific thing, or what it implied about you?",
      "What do you wish had been recognized or respected about your contribution?",
      "What would a calm, direct response to this look like — in one sentence?",
      "Next time, note whether this is a pattern or an isolated incident — and what the difference means.",
    ],
    shortQuestions: [
      "Is this about this specific moment, or something you've been noticing for a while?",
      "What would feel like a fair outcome here?",
      "What do you need most right now — to be heard, to act, or to let it go?",
      "Next time, write about what you wish you'd said — and whether you still could.",
    ],
    mustHave: /\b(work|job|office|meeting|colleague|coworker|manager|boss|team|client|project|career|promotion|deadline|presentation|overlooked|passed over|recognition|lead|seniority)\b/i,
    driftKeywords: /\b(workout|gym|doctor|diagnosis|rent|bank|mortgage)\b/i,
  },

  RELATIONSHIP: {
    summary:
      "What you're carrying: Something in this connection is still sitting with you.\nWhat's really happening: The distance you felt — and what you didn't say — is still there.",
    shortSummary:
      "What you're carrying: A moment in a relationship that hasn't settled.\nWhat's really happening: What didn't get said is often what matters most.",
    corepattern: "The gap between being present and being seen is where the longing lives.",
    themes: ["connection", "visibility", "distance", "intimacy"],
    emotions: ["loneliness", "longing", "disconnection", "hurt"],
    nextStepFree: "Option A: Name the feeling in one sentence without assigning blame. Option B: Ask yourself what you most needed in that moment.",
    nextStepPremium: "Option A: Name the feeling in one sentence without assigning blame. Option B: Ask yourself what you most needed in that moment. Script line: \"I want to understand what I needed before I decide what to do.\"",
    shortNextStep: "Option A: Write one honest sentence about what you needed. Option B: Notice whether this is about this moment or a longer pattern.",
    questions: [
      "What were you most hoping for in that moment — connection, acknowledgment, or something else?",
      "What did you hold back from saying, and why?",
      "What would feeling genuinely seen look like in this relationship?",
      "Next time, note what you're carrying into the interaction before it starts.",
    ],
    shortQuestions: [
      "What would you have needed to feel less invisible in that moment?",
      "Is this a pattern you've noticed before in this relationship?",
      "What would 'enough' feel like here — not perfect, just enough?",
      "Next time, write about what you actually wanted to say — and what stopped you.",
    ],
    mustHave: /\b(partner|wife|husband|girlfriend|boyfriend|relationship|friend|family|him|her|them|together|dinner|invisible|distance|disconnect)\b/i,
    driftKeywords: /\b(workout|gym|money|budget|doctor|diagnosis|project|meeting|manager)\b/i,
  },

  MONEY: {
    summary:
      "What you're carrying: A financial pressure that's touching more than just the numbers.\nWhat's really happening: Money stress is rarely just about money — it touches your sense of safety and control.",
    shortSummary:
      "What you're carrying: Something about your finances is pressing on you.\nWhat's really happening: The pressure behind the numbers is usually about more than money.",
    corepattern: "The anxiety isn't about the number — it's about what the number represents.",
    themes: ["financial stress", "security", "control", "shame"],
    emotions: ["anxiety", "shame", "frustration", "fear"],
    nextStepFree: "Option A: Write down the specific financial fact that feels most urgent — just the fact, not the spiral. Option B: Name one action that would reduce the pressure even slightly.",
    nextStepPremium: "Option A: Write down the one financial fact that feels most urgent right now — just the fact, not the spiral. Option B: Name one action you can take today that reduces the pressure even 5%. Script line: \"I'm dealing with one thing at a time — today's thing is clear.\"",
    shortNextStep: "Option A: Is this about a specific number, or the feeling behind it? Write one sentence. Option B: What would feel like enough safety right now — not solved, just safer?",
    questions: [
      "What's the specific fear underneath this — running out, falling behind, or being judged?",
      "What's one small thing you could do today that would move toward, not away from, the problem?",
      "What would 'stabilized' look like in the next 7 days — not solved, just stabilized?",
      "Next time, write down the exact thought that triggered the spiral and what followed.",
    ],
    shortQuestions: [
      "Is this about a specific number, or the feeling behind it?",
      "What would feel like enough safety right now — not solved, just safer?",
      "What would you tell someone you care about who was in this exact situation?",
      "Next time, note whether the feeling is about the present, the past, or the future.",
    ],
    mustHave: /\b(money|financial|budget|debt|savings|bills|rent|mortgage|afford|broke|salary|income|spending|bank|paycheck|numbers)\b/i,
    driftKeywords: /\b(workout|gym|doctor|diagnosis)\b/i,
  },

  HEALTH: {
    summary:
      "What you're carrying: Your body or mind has been under sustained pressure and you're feeling it.\nWhat's really happening: This isn't just tiredness — it's what happens when the nervous system has been running on alert for too long.",
    shortSummary:
      "What you're carrying: A quiet signal from your body or mind asking to be heard.\nWhat's really happening: You're noticing it — and that's already something.",
    corepattern: "You're navigating the space between what you know and what you can't control about your own wellbeing.",
    themes: ["sleep", "mental load", "body awareness", "self-criticism"],
    emotions: ["anxiety", "exhaustion", "frustration", "overwhelm"],
    nextStepFree: "Option A: Write down what you actually know right now — separate from what you fear. Option B: Name one thing your body needs today that isn't about fixing or performing.",
    nextStepPremium: "Option A: Write what you know (facts) vs what you fear (stories) — two columns, one line each. Option B: Name one gentle thing your body needs today that isn't about fixing. Script line: \"I can hold uncertainty without solving it today.\"",
    shortNextStep: "Option A: Notice where in your body you feel this. Name it without judging it. Option B: Write one sentence about what you wish someone understood about how this feels.",
    questions: [
      "What does the exhaustion feel like in your body right now — is it closer to heaviness, tightness, or emptiness?",
      "When you say you've already failed the day before it starts, what would 'not failing' actually look like?",
      "What is your mind reviewing at 3am — and what does it most need to hear?",
      "Next time, note what your first thought is when you wake — and whether it's a fact or a fear.",
    ],
    shortQuestions: [
      "What does your body feel like right now — not what you think about it, just what's actually there?",
      "Is there one small thing your body is asking for today?",
      "What would it feel like to be gentle with yourself about this?",
      "Next time, note what triggered the worry and what helped it settle.",
    ],
    mustHave: /\b(doctor|hospital|diagnosis|symptoms|medication|illness|sick|pain|health|medical|body|anxiety|therapy|mental|test results?|sleep|sleeping|insomnia|wake up|waking|tired|exhausted|racing mind|racing thoughts|burnout|panic|3am|4am|2am)\b/i,
    driftKeywords: /\b(workout|gym|rent|bank|money|debt)\b/i,
  },

  GRIEF: {
    summary:
      "What you're carrying: You're holding a grief that doesn't follow a straight line.\nWhat's really happening: Missing someone doesn't diminish over time the way people say — it changes shape.",
    shortSummary:
      "What you're carrying: Something about loss is with you today.\nWhat's really happening: Grief has its own timing — and today it surfaced.",
    corepattern: "You're learning to carry something that doesn't go away — and finding out what that means for who you are now.",
    themes: ["loss", "memory", "identity", "time"],
    emotions: ["grief", "longing", "sadness", "tenderness"],
    nextStepFree: "Option A: Write one thing you want to remember about what you lost — something specific, small, and true. Option B: Let yourself feel what came up without trying to move past it today.",
    nextStepPremium: "Option A: Write one specific memory in sensory detail (what you saw/heard). Option B: Write one sentence of what you wish you could say. Script line: \"I'm allowed to miss this — and I'm allowed to still be here.\"",
    shortNextStep: "Option A: Just sit with the feeling for a moment before you do anything. Option B: Write one sentence about what you're missing today.",
    questions: [
      "What triggered this today — something you saw, heard, or remembered?",
      "What do you most want people to understand about this loss?",
      "Is there something you never got to say — and is there a way to say it now, even privately?",
      "Next time, write about a specific memory — what it looked like, sounded like, felt like.",
    ],
    shortQuestions: [
      "What came up for you today — a memory, a feeling, or something unexpected?",
      "Is there anyone in your life right now who holds this loss with you?",
      "What would feel like the gentlest thing you could do for yourself today?",
      "Next time, write about one specific thing you miss — not in general, but in detail.",
    ],
    mustHave: /\b(grief|loss|lost|died|death|passed|miss|missing|gone|mourning|remember|anniversary)\b/i,
    driftKeywords: /\b(colleague|manager|workout|gym|money|budget)\b/i,
  },

  PARENTING: {
    summary:
      "What you're carrying: A parenting moment is sitting heavily with you.\nWhat's really happening: The hardest part of parenting is caring this much — and not always knowing if it's enough.",
    shortSummary:
      "What you're carrying: Something about your child or your role as a parent is pressing on you.\nWhat's really happening: The fact that it matters to you this much is already part of the answer.",
    corepattern: "You're holding the gap between the parent you want to be and the human limits you're working within.",
    themes: ["guilt", "repair", "self-doubt", "exhaustion"],
    emotions: ["guilt", "love", "overwhelm", "sadness"],
    nextStepFree: "Option A: Write down one moment today where you showed up for your child — even imperfectly. Option B: Name what you actually need right now to be a more present parent.",
    nextStepPremium: "Option A: Write a 2-sentence repair you could say (no excuses, just ownership + care). Option B: Identify the trigger that pushed you past your limit. Script line: \"I'm sorry I snapped. You didn't deserve that. I love you.\"",
    shortNextStep: "Option A: Sit with the feeling before deciding what it means about you as a parent. Option B: Write one sentence about what your child actually needs from you — not what you think you failed to give.",
    questions: [
      "What do you think your child needed from you in that moment when it went wrong?",
      "If you could redo one minute, what would you do differently — specifically?",
      "What was happening right before you reached your limit (stress, fatigue, fear)?",
      "Next time, what is one early sign that you're close to snapping — and what could you do then?",
    ],
    shortQuestions: [
      "Is this about what actually happened, or what you're afraid it means?",
      "What's one thing your child knows about being loved by you?",
      "What would 'good enough' look like today — not perfect, just enough?",
      "Next time, note the moment before the guilt arrived — what was happening?",
    ],
    mustHave: /\b(kid|kids|child|children|son|daughter|baby|toddler|teen|parent|parenting|motherhood|fatherhood)\b/i,
    driftKeywords: /\b(colleague|manager|workout|gym|money|partner|husband|wife)\b/i,
  },

  CREATIVE: {
    summary:
      "What you're carrying: A creative block is sitting with you right now.\nWhat's really happening: Creative blocks are rarely about lack of ideas — usually they're about fear of what the work will say.",
    shortSummary:
      "What you're carrying: Your creative energy is somewhere complicated right now.\nWhat's really happening: The resistance is information — it's worth listening to before pushing through.",
    corepattern: "You're navigating the gap between who you are and what you make — and the fear that one reflects on the other.",
    themes: ["creative block", "self-doubt", "identity", "process"],
    emotions: ["frustration", "insecurity", "disappointment", "longing"],
    nextStepFree: "Option A: Make something small and deliberately imperfect today — not for anyone, just to move. Option B: Write down what you're actually afraid will happen if you make the work and it's seen.",
    nextStepPremium: "Option A: Do a 10-minute \"bad draft\" sprint and stop. Option B: Write the exact sentence you fear is true about you as a creator, then challenge it with one counterexample. Script line: \"I'm allowed to make a rough first version — that's how the work becomes real.\"",
    shortNextStep: "Option A: Do five minutes of the creative work without judging it. Option B: Write about the last time making something felt easy — what was different?",
    questions: [
      "What does the blank page represent to you right now — failure, exposure, or expectation?",
      "What would a smaller, lower-stakes version of this project look like?",
      "What is one thing you can make today that doesn't need to be good — only real?",
      "Next time, write down the first thought you had when you sat down to create — what was it?",
    ],
    shortQuestions: [
      "What does 'being creative' feel like in your body right now — tight, flat, heavy?",
      "Is there a version of this project that feels manageable — smaller, lower stakes?",
      "What would you make if nobody would ever see it?",
      "Next time, note whether the block arrived before or after you started.",
    ],
    mustHave: /\b(writing|write|drawing|painting|music|art|design|creative|project|novel|song|poem|blog|draft|blank page|creating|making|staring)\b/i,
    driftKeywords: /\b(colleague|manager|partner|gym|money|doctor|wife|husband|girlfriend|boyfriend)\b/i,
  },

  IDENTITY: {
    summary:
      "What you're carrying: A question about who you are is sitting with you.\nWhat's really happening: Identity questions are uncomfortable because they matter — and because they don't resolve quickly.",
    shortSummary:
      "What you're carrying: Something about who you are or what you want is feeling unclear.\nWhat's really happening: The fact that you're asking is already a shift.",
    corepattern: "You're in a transition between who you were and who you're becoming — and sitting in that gap is the hardest part.",
    themes: ["identity", "authenticity", "purpose", "change"],
    emotions: ["confusion", "overwhelm", "uncertainty", "longing"],
    nextStepFree: "Option A: Write down three things that have always been true about you — not achievements, but qualities. Option B: Name the version of yourself you're trying to move away from.",
    nextStepPremium: "Option A: Write 3 values that feel non-negotiable (not goals). Option B: Name one role you're tired of performing and what it protects you from. Script line: \"I'm allowed to be honest about what's true for me.\"",
    shortNextStep: "Option A: Write one sentence about what feels most 'you' right now — even if it's small. Option B: Notice whether this question feels like a crisis or a becoming.",
    questions: [
      "Where do you feel like you're performing a version of yourself — and for whom?",
      "What do you think you're afraid would happen if you stopped performing?",
      "What is one choice this week that would be more aligned with what's true for you?",
      "Next time, write about a specific moment when you felt most like yourself — what was happening?",
    ],
    shortQuestions: [
      "Is there one word that feels true about who you are right now — even uncomfortably?",
      "What have you been giving up to fit the version of yourself others expect?",
      "What would it feel like to not know the answer to this — and be okay with that?",
      "Next time, write about what you want — not what you think you should want.",
    ],
    mustHave: /\b(identity|who I am|purpose|authentic|real self|mask|performing|version of myself|belong|lost|direction|meaning|transition|pretending|fake|fraud|holding everything together|don'?t know what i want|couldn'?t tell you what i need)\b/i,
    driftKeywords: /\b(gym|workout|doctor|diagnosis|symptoms)\b/i,
  },

  GENERAL: {
    summary:
      "What you're carrying: Something present here — not fully formed yet, but real enough to write down.\nWhat's really happening: The fact that you named it means part of you is already trying to understand it.",
    shortSummary:
      "What you're carrying: A quiet signal — not loud enough to name yet, but present enough to notice.\nWhat's really happening: You showed up to write, even without words. That's the start of something.",
    corepattern: "You're in the middle of something — not at the beginning, not at the end, just present with it.",
    themes: ["self-awareness", "processing", "presence", "uncertainty"],
    emotions: ["uncertainty", "restlessness", "frustration", "exhaustion"],
    nextStepFree: "Option A: Write one more sentence — what's the feeling underneath the first one? Option B: Ask yourself: is this about something that happened, something expected, or something missing?",
    nextStepPremium: "Option A: Write the clearest fact you know from this entry, then the clearest need it points to. Option B: Identify what this touches (safety / belonging / worth / control). Script line: \"I don't need the answer yet — I just need to stay honest about what's here.\"",
    shortNextStep: "Option A: Sit with it for 60 seconds and notice if a word arrives. Option B: Write one more line — it doesn't have to make sense.",
    questions: [
      "What is the most specific part of this you don't want to look at — and why?",
      "If this feeling had a job, what would it be trying to protect you from?",
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

/* ── Banned patterns ────────────────────────────────────────────────────── */

const BANNED_SUMMARY_PATTERNS: RegExp[] = [
  /\ba workplace moment that left a mark\b/i,
  /\bthere'?s a financial pressure sitting on you\b/i,
  /\ba financial pressure sitting on you\b/i,
  /\ba creative block is sitting with you\b/i,
  /\ba parenting moment is sitting heavily\b/i,
  /\ba grief that doesn't follow a straight line\b/i,
  /\byour body is asking for your attention\b/i,
  /\ba question about who you are is sitting\b/i,
  /\bsomething from work got under your skin\b/i,
  /\bsomething happened at work\b/i,
  /\bsomething from work is still (with|sitting)\b/i,
  /\bsomething in this connection\b/i,
  /\ba gap between you and someone\b/i,
  /\ba connection that matters\b/i,
  /\bsomething is sitting with you\b/i,
  /\bsomething you haven't fully named\b/i,
  /\bsomething quiet\b/i,
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
  // FIX Bug2: additional patterns observed in testing
  /\byou wrote something real down\b/i,
  /\bthe fact that you put it into words\b/i,
  /\bsomething from work is still\b/i,
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

/* ── Crisis Detection ───────────────────────────────────────────────────── */

const CRISIS_SIGNALS: RegExp[] = [
  /\b(suicid|kill myself|end my life|take my (own )?life)\b/i,
  /\b(want to die|wish I (was|were) dead|better off dead|better off without me)\b/i,
  /\b(don't want to (be here|live|exist)|can't go on|no (point|reason) (in|to) (living|being here))\b/i,
  /\b(self[- ]harm|cutting myself|hurt(ing)? myself|harming myself)\b/i,
  /\b(not want to wake up|hope I don't wake|wish I (wouldn't|didn't) wake)\b/i,
  /\b(end it all|end the pain (forever|permanently)|no way out)\b/i,
];

export function detectCrisisContent(text: string): boolean {
  const s = (text || "").toLowerCase();
  return CRISIS_SIGNALS.some((re) => re.test(s));
}

/* ── Positive Entry Detection ───────────────────────────────────────────── */

const POSITIVE_SIGNALS =
  /\b(finally|so proud|really proud|really happy|so happy|amazing|incredible|wonderful|best day|great news|promotion|got the job|offer letter|accepted|got in|passed my|achieved|accomplished|celebrated|celebrate|thrilled|excited about|joy|overjoyed|blessed|relieved|made it|succeeded|nailed it|big win|huge win|milestone|breakthrough|breakthrough|couldn't believe it|couldn't stop smiling|grateful for|full of gratitude|feeling grateful|feel grateful)\b/i;

const NEGATIVE_SIGNALS =
  /\b(stressed|anxious|worried|sad|angry|frustrated|hurt|lost|failed|scared|afraid|hopeless|stuck|overwhelmed|ashamed|depressed|exhausted|panic|lonely|empty|dread|hate|awful|terrible|miserable|destroyed|crying|cried|broke down)\b/i;

function isPositiveEntry(text: string): boolean {
  const positiveCount = (text.match(POSITIVE_SIGNALS) || []).length;
  const negativeCount = (text.match(NEGATIVE_SIGNALS) || []).length;
  return positiveCount >= 2 && positiveCount > negativeCount * 1.5;
}

/* ── Bullet Preprocessing ───────────────────────────────────────────────── */

// Normalizes bullet-point and numbered list entries into prose sentences
// so anchor extraction works correctly on structured entries.
function preprocessBullets(text: string): string {
  const lines = text.split("\n");
  const processed = lines.map((line) => {
    const trimmed = line.trim();
    // Match bullet lines: -, •, *, –, →, ·, ▪
    const bulletMatch = trimmed.match(/^[-•*–→·▪]\s+(.+)$/);
    if (bulletMatch) {
      const content = bulletMatch[1].trim();
      return /[.!?]$/.test(content) ? content : `${content}.`;
    }
    // Match numbered lists: "1. " or "1) "
    const numberedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (numberedMatch) {
      const content = numberedMatch[1].trim();
      return /[.!?]$/.test(content) ? content : `${content}.`;
    }
    return line;
  });
  return processed.join("\n");
}

/* ── Anchor Extraction ──────────────────────────────────────────────────── */

function extractAnchors(entry: string): string[] {
  const t = preprocessBullets(entry.trim());
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

  const lines = t.split("\n").map((l) => l.trim()).filter(Boolean);
  const joined = lines.join(" ");
  const sentences = joined.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);

  const emotionalSignals =
    /\b(but|just|still|keep|always|never|again|quiet|ache|miss|wish|pretend|perform|nothing|empty|disappear|invisible|gap|distance|wanted|needed|tired|exhausted|fine|okay|underneath|scared|afraid|worried|hopeless|stuck|alone|lost|failed|ashamed|embarrassed|glass|proof|almost|numb|off|wrong|can't name)\b/i;

  for (const s of sentences) {
    if (anchors.length >= 4) break;
    if (emotionalSignals.test(s) && s.length <= 180) add(s);
  }

  if (anchors.length < 2) {
    for (const s of sentences.slice(0, 4)) {
      if (s.length <= 180) add(s);
      if (anchors.length >= 2) break;
    }
  }

  if (anchors.length < 1) add("you came here and put this into words");
  return anchors.slice(0, 5);
}

/* ── JSON Parsing ───────────────────────────────────────────────────────── */

function extractFirstJsonObject(raw: string): string | null {
  const s = raw.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, "$1").trim();
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
      else if (ch === "\"") inString = false;
      continue;
    }
    if (ch === "\"") {
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
  const normalized = raw
    .replace(/[\u201c\u201d]/g, "\"")
    .replace(/[\u2018\u2019]/g, "'");

  const json = extractFirstJsonObject(normalized);
  if (!json) return null;

  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/* ── Matching helpers ───────────────────────────────────────────────────── */

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .replace(/[""]/g, "\"")
    .replace(/['']/g, "'")
    .replace(/[^a-z0-9'"\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function anchorHitInLine(line: string, anchors: string[]): boolean {
  const ln = normalizeForMatch(line);
  for (const a of anchors) {
    const aa = normalizeForMatch(a.replace(/^["""]|["""]$/g, ""));
    if (aa.length >= 8 && ln.includes(aa)) return true;
  }
  return false;
}

function extractSummaryLine(summary: string, label: string): string {
  const safe = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = summary.match(new RegExp(`${safe}\\s*([^\\n]+)`, "i"));
  return (m?.[1] ?? "").trim();
}

/* ── Second-person repair ───────────────────────────────────────────────── */

function toSecondPerson(s: string): string {
  return s
    .replace(/^I've\b/, "You've")
    .replace(/^I'm\b/, "You're")
    .replace(/^I'd\b/, "You'd")
    .replace(/^I'll\b/, "You'll")
    .replace(/^I was\b/, "You were")
    .replace(/^I am\b/, "You are")
    .replace(/^I\b/, "You")
    .replace(/\bI'm\b/g, "you're")
    .replace(/\bI've\b/g, "you've")
    .replace(/\bI'd\b/g, "you'd")
    .replace(/\bI'll\b/g, "you'll")
    .replace(/\bI don't\b/gi, "you don't")
    .replace(/\bI just\b/gi, "you just")
    .replace(/\bI keep\b/gi, "you keep")
    .replace(/\bI still\b/gi, "you still")
    .replace(/\bI know\b/gi, "you know")
    .replace(/\bI feel\b/gi, "you feel")
    .replace(/\bI have\b/gi, "you have")
    .replace(/\bI was\b/gi, "you were")
    .replace(/\bI am\b/gi, "you are")
    .replace(/\bI can't\b/gi, "you can't")
    .replace(/\bI won't\b/gi, "you won't")
    .replace(/\bI should\b/gi, "you should")
    .replace(/\bI would\b/gi, "you would")
    .replace(/\bI could\b/gi, "you could")
    .replace(/\bI need\b/gi, "you need")
    .replace(/\bI want\b/gi, "you want")
    .replace(/\bI told\b/gi, "you told")
    .replace(/\bI said\b/gi, "you said")
    .replace(/\bI did\b/gi, "you did")
    .replace(/\bI went\b/gi, "you went")
    .replace(/\bI came\b/gi, "you came")
    .replace(/\bI got\b/gi, "you got")
    .replace(/\bI noticed\b/gi, "you noticed")
    .replace(/\bI skipped\b/gi, "you skipped")
    .replace(/\bI ran\b/gi, "you ran")
    .replace(/\bI tried\b/gi, "you tried")
    .replace(/\bI started\b/gi, "you started")
    .replace(/\bI stopped\b/gi, "you stopped")
    .replace(/\bI thought\b/gi, "you thought")
    .replace(/\bI realized\b/gi, "you realized")
    .replace(/\bI found\b/gi, "you found")
    .replace(/\bI lost\b/gi, "you lost")
    .replace(/\bI missed\b/gi, "you missed")
    .replace(/\bI never\b/gi, "you never")
    .replace(/\bI used to\b/gi, "you used to")
    .replace(/\bI\b(?=[^'\w])/g, "you")
    .replace(/\bmy\b/g, "your")
    .replace(/\bmine\b/g, "yours")
    .replace(/\bmyself\b/g, "yourself")
    .replace(/\b(drain|thank|ask|hear|see|notice|help|stop|push|pull|hurt|love|need|want|ignore|dismiss|leave|forget|tell|show|remind|support)\s+me\b/gi, "$1 you")
    .replace(/\bme\b(?=\s*[,.\-—])/g, "you")
    .replace(/\bme\s*$/g, "you");
}

function repairCarryingLine(summary: string): string {
  if (!summary.includes("What you're carrying:")) return summary;
  const m = summary.match(/What you're carrying:\s*([^\n]+)/);
  if (!m) return summary;

  const val = m[1].trim();
  const converted = toSecondPerson(val);
  const fixed = converted.charAt(0).toUpperCase() + converted.slice(1);
  if (fixed === val) return summary;

  return summary.replace(/What you're carrying:\s*[^\n]+/, `What you're carrying: ${fixed}`);
}

/* ── Anchor injection ───────────────────────────────────────────────────── */

function isCarryingLineBanned(line: string): boolean {
  const lower = line.toLowerCase();
  return BANNED_SUMMARY_PATTERNS.some((re) => re.test(lower));
}

function injectAnchorIntoCarrying(summary: string, anchors: string[]): string {
  if (!summary.includes("What you're carrying:")) return summary;

  const carrying = extractSummaryLine(summary, "What you're carrying:");

  // FIX Bug2: always inject if carrying line is banned, regardless of where it came from
  if (!isCarryingLineBanned(carrying)) return summary;

  // FIX Bug3: prefer emotionally vivid anchor over first anchor
  const vividAnchor = selectVividAnchor(anchors);
  const a = vividAnchor ?? anchors.find((x) => normalizeForMatch(x).length >= 8) ?? anchors[0] ?? "";
  const clean = String(a).replace(/^["""]|["""]$/g, "").trim();
  if (!clean) return summary;

  const injected = toSecondPerson(clean);
  const fixed = injected.charAt(0).toUpperCase() + injected.slice(1);

  return summary.replace(/What you're carrying:\s*[^\n]+/i, `What you're carrying: ${fixed}`);
}

/* ── Vivid phrase selection ─────────────────────────────────────────────── */
// FIX Bug3: score each anchor for emotional vividness. Metaphors, quoted phrases,
// and sentences with strong feeling words score higher than neutral factual openers.

const VIVID_PHRASE_SIGNALS: RegExp[] = [
  // Metaphors / unusual constructions
  /behind glass/i,
  /handed (a|the) mask/i,
  /proof of something/i,
  /almost picked up the phone/i,
  /feel off/i,
  /slightly wrong/i,
  /can'?t name it/i,
  /just numb/i,
  /keep shrinking/i,
  /voice went quiet/i,
  // Emotional loaded words that indicate a vivid sentence
  /\b(invisible|ashamed|terrified|hollow|fractur|shatter|breaking|sinking|shrinking|drowning|numb|ache|aching)\b/i,
  // Quoted phrases (already caught as anchors, but boost them)
  /^["""]/,
  // Sentences with "I" doing something visceral
  /\b(almost|nearly|barely|couldn'?t|just kept|kept thinking|kept seeing|stood there)\b/i,
];

function scoreAnchorVividness(anchor: string): number {
  let score = 0;
  for (const re of VIVID_PHRASE_SIGNALS) {
    if (re.test(anchor)) score++;
  }
  // Quotes get an extra bump
  if (/^["""]/.test(anchor)) score += 2;
  return score;
}

function selectVividAnchor(anchors: string[]): string | null {
  if (!anchors.length) return null;
  const scored = anchors.map((a) => ({ a, s: scoreAnchorVividness(a) }));
  scored.sort((x, y) => y.s - x.s);
  // Only prefer a vivid anchor over the first anchor if it actually scored
  return scored[0].s > 0 ? scored[0].a : null;
}

/* ── Emotion normalization ──────────────────────────────────────────────── */

const EMOTION_NORMALIZE: Record<string, string> = {
  shameful: "shame",
  ashamed: "shame",
  guilty: "guilt",
  anxious: "anxiety",
  scared: "fear",
  frightened: "fear",
  angry: "anger",
  sad: "sadness",
  tired: "tiredness",
  exhausted: "exhaustion",
  hopeful: "hope",
  confused: "confusion",
  overwhelmed: "overwhelm",
  frustrated: "frustration",
  lonely: "loneliness",
  grateful: "gratitude",
  proud: "pride",
  disappointed: "disappointment",
  resentful: "resentment",
  helpless: "helplessness",
  powerless: "powerlessness",
  worried: "worry",
  envious: "envy",
};

function normalizeEmotion(e: string): string {
  const k = e.trim().toLowerCase();
  return EMOTION_NORMALIZE[k] ?? e.trim();
}

function topUpUnique(list: string[], fallback: string[], min: number, max: number): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  const push = (v: string) => {
    const norm = normalizeEmotion(v);
    const k = normalizeForMatch(norm);
    if (!k || seen.has(k)) return;
    seen.add(k);
    out.push(norm);
  };

  for (const v of list) push(v);
  for (const v of fallback) {
    if (out.length >= min) break;
    push(v);
  }

  return out.slice(0, Math.max(min, Math.min(max, 99)));
}

function ensureFourQuestions(qs: string[], domain: Domain, short: boolean): string[] {
  const defaults = short ? DOMAIN_DEFAULTS[domain].shortQuestions : DOMAIN_DEFAULTS[domain].questions;
  const out = qs.map((s) => String(s ?? "").trim()).filter(Boolean).slice(0, 4);
  while (out.length < 4) out.push(defaults[out.length] ?? defaults[defaults.length - 1]);
  if (!out[out.length - 1].toLowerCase().startsWith("next time,")) out[out.length - 1] = defaults[3];
  return out.slice(0, 4);
}

function ensurePremiumSummary(
  summary: string,
  domain: Domain,
  anchors: string[],
  corepattern: string,
  secondaryDomains: Domain[]
): string {
  let s = summary.trim();

  if (!s.includes("What you're carrying:")) {
    const a = anchors[0] ?? "You wrote something that matters.";
    s = `What you're carrying: ${toSecondPerson(a)}\n${s}`;
  }
  if (!s.includes("What's really happening:")) {
    s += `\nWhat's really happening: ${corepattern}`;
  }

  if (!s.includes("Deeper direction:")) {
    const mixedHint =
      secondaryDomains.length > 0
        ? " What you're carrying may also be colliding with pressure from other areas of your life."
        : "";

    const domainDD: Record<Domain, string> = {
      WORK: `Deeper direction: The need underneath this isn't about the task — it's about respect. One clear, calm conversation is worth ten accommodations made in silence.${mixedHint}`,
      RELATIONSHIP: `Deeper direction: What you didn't say is still shaping the distance. Naming what you needed — even just to yourself — is the first honest move.${mixedHint}`,
      FITNESS: `Deeper direction: Your body's resistance is data, not failure. What it's asking for is probably simpler than what you're demanding of it.${mixedHint}`,
      MONEY: `Deeper direction: The anxiety isn't about the number — it's about what the number represents. Separating the fact from the story is the first move.${mixedHint}`,
      HEALTH: `Deeper direction: Sitting with uncertainty is its own form of courage. The body keeps score of what the mind is carrying — and right now yours is asking for rest, not answers.${mixedHint}`,
      GRIEF: `Deeper direction: You're not supposed to be over this. Carrying it differently over time isn't the same as letting it go — and that's okay.${mixedHint}`,
      PARENTING: `Deeper direction: The gap between the parent you want to be and the moment you had is where growth happens. One simple repair — said without excuses — means more than you think.${mixedHint}`,
      CREATIVE: `Deeper direction: The block isn't about the work — it's about what you think the work will say about you. Making something imperfect today is the only way through.${mixedHint}`,
      IDENTITY: `Deeper direction: You don't need to know who you're becoming — you need to notice which version of yourself costs the most energy to maintain. Start there.${mixedHint}`,
      GENERAL: "Deeper direction: The clearest fact in what you wrote is the thing most worth staying with. Name it in one plain sentence before deciding what to do next.",
    };

    s = `${s}\n${domainDD[domain]}`;
  }

  const defaults = DOMAIN_DEFAULTS[domain];
  if (domain !== "GENERAL") {
    const carrying = extractSummaryLine(s, "What you're carrying:");
    const wrh = extractSummaryLine(s, "What's really happening:");
    const dd = extractSummaryLine(s, "Deeper direction:");
    const summaryOnly = `${carrying} ${wrh} ${dd}`;
    const mustHaveFails = !defaults.mustHave.test(summaryOnly);
    const driftFires = defaults.driftKeywords.test(summaryOnly);

    if (mustHaveFails && driftFires) {
      const base = defaults.summary;
      const repaired = injectAnchorIntoCarrying(`${base}\nDeeper direction: ${corepattern}`, anchors);
      return repaired;
    }
  }

  return s;
}

function ensurePremiumStep(step: string, domain: Domain): string {
  let s = step.trim();
  if (!/Option A:/i.test(s) || !/Option B:/i.test(s)) {
    s = DOMAIN_DEFAULTS[domain].nextStepPremium;
  }

  if (!/Script line:/i.test(s)) {
    const scriptByDomain: Record<Domain, string> = {
      WORK: `Script line: "I want to be clear about what I need here."`,
      RELATIONSHIP: `Script line: "I want to understand what I needed before I respond."`,
      FITNESS: `Script line: "I'm building consistency — recovery counts."`,
      MONEY: `Script line: "I'm dealing with one thing at a time — today's thing is clear."`,
      HEALTH: `Script line: "I can hold uncertainty without solving it today."`,
      GRIEF: `Script line: "I'm allowed to miss this — and I'm allowed to still be here."`,
      PARENTING: `Script line: "I'm sorry I snapped. I love you, and I'm working on it."`,
      CREATIVE: `Script line: "The work doesn't have to be good yet — it just has to exist."`,
      IDENTITY: `Script line: "I'm allowed to be honest about what's true for me."`,
      GENERAL: `Script line: "I don't need the answer yet — I need to stay honest."`,
    };
    s = `${s}${s.endsWith(".") ? "" : "."} ${scriptByDomain[domain]}`;
  }

  return s;
}

/* ── Quality Gate ───────────────────────────────────────────────────────── */

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

  if (!summary.includes("What you're carrying:")) reasons.push('Missing "What you\'re carrying:"');
  if (!summary.includes("What\'s really happening:") && !summary.includes("What's really happening:")) {
    reasons.push('Missing "What\'s really happening:"');
  }

  const carrying = extractSummaryLine(summary, "What you're carrying:");
  const wrh = extractSummaryLine(summary, "What's really happening:");

  if (!short) {
    if (!anchorHitInLine(carrying, anchors) && !anchorHitInLine(wrh, anchors)) {
      reasons.push("Missing anchor in carrying/WRH line");
    }
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

  const minLen = short ? 80 : plan === "PREMIUM" ? 240 : 150;
  if (summary.length < minLen) reasons.push(`Summary too short (${summary.length} < ${minLen})`);
  if (!/Option A:/i.test(nextStep)) reasons.push("Missing Option A");
  if (!/Option B:/i.test(nextStep)) reasons.push("Missing Option B");

  const minArr = plan === "PREMIUM" ? 3 : 2;
  if (themes.length < minArr) reasons.push(`themes: need ${minArr}, got ${themes.length}`);
  if (emotions.length < minArr) reasons.push(`emotions: need ${minArr}, got ${emotions.length}`);
  if (questions.length < 2) reasons.push(`questions: need 2, got ${questions.length}`);

  const lastQ = String(questions[questions.length - 1] ?? "");
  if (!lastQ.toLowerCase().startsWith("next time,")) reasons.push('Last question must start with "Next time,"');

  const corepattern = String(parsed?.corepattern ?? "").trim();
  // Bug #14 fix: ban third-person corepattern — must always address "you", never "the person"
  if (corepattern && /\bthe person\b|\bthis person\b|\bthe user\b/i.test(corepattern)) {
    reasons.push('Corepattern uses third person ("the person") — must use "you"');
  }
  if (
    corepattern &&
    !/\b(is|are|was|were|has|have|had|do|does|did|can|could|will|would|should|may|might|feel|feels|shows|shapes|drives|means|reveals|creates|keeps|holds|sits|lives|runs|makes|takes|turns|points|touches|pulls|pushes|navigates|manages|carries|defines|reflects)\b/i.test(corepattern)
  ) {
    reasons.push("Corepattern appears to be a fragment — needs a verb");
  }

  const BANNED_QUESTION_PATTERNS = [
    /prioritize your emotional well-being/i,
    /how can you prepare yourself/i,
    /feel more (grounded|prepared|ready)/i,
    /help you feel more prepared/i,
    /take care of yourself/i,
    /how are you taking care of/i,
    /how (are|were) you (coping|managing|dealing) with/i,
    /practice self-care/i,
    /what could be causing your (pain|symptoms)/i,
    /what do you think (is|could be) causing/i,
    /how can you better (manage|cope|handle)/i,
    /what steps can you take to/i,
    /what (are )?some (specific )?steps (you could|to)/i,
    /what (are )?some strategies/i,
    /small,? achievable goals/i,
    /specific support or resources/i,
    /seek out (to help|support)/i,
    /reconnecting with your own desires/i,
    /address your financial situation/i,
    /what (strategies|techniques|tools) (can|could|might) you/i,
    /how (can|could|might) you (better|more effectively)/i,
    // FIX Bug #4: advice-giving patterns observed in testing
    /\bset a (small |tiny )?(boundary|limit)\b/i,
    /\btell (one|a|someone|your) person the real\b/i,
    /\bwhat would it (look|feel) like to set\b/i,
    /\bhow (can|could|might) you set (a |some )?(boundary|limit)\b/i,
    /\bwhat (boundaries|limits) (could|can|might|should) you\b/i,
    /\bwhat (specific )?actions? (can|could|should|might) you take\b/i,
    // FIX: additional generic patterns observed in testing
    /what are some (specific )?(actions|things|ways)/i,
    /reignite your creative spark/i,
    /honor (his|her|their|your) memory in a way/i,
    // Productivity / task-list advice masquerading as reflection
    /list all the things (that are|that feel|currently)/i,
    /identify one small task (you can|to) complete/i,
    /clear some mental space/i,
    /make a list of/i,
    /write down (a list|all the|everything)/i,
    /prioritize (your tasks|the tasks|what needs)/i,
    /break (it|this|that) (down into|into smaller)/i,
  ];

  for (const q of questions) {
    const qs = String(q);
    for (const ban of BANNED_QUESTION_PATTERNS) {
      if (ban.test(qs)) {
        reasons.push(`Generic/harmful question pattern detected: "${qs.slice(0, 60)}"`);
        break;
      }
    }
  }

  if (domain !== "GENERAL") {
    const summaryOnly = `${carrying} ${wrh} ${extractSummaryLine(summary, "Deeper direction:")}`;
    if (!defaults.mustHave.test(summaryOnly)) reasons.push(`Domain signal missing for ${domain}`);
    if (defaults.driftKeywords.test(summaryOnly)) reasons.push(`Domain drift for ${domain}`);
  }

  for (const ban of WRH_CROSS_DOMAIN_BANS[domain] ?? []) {
    if (ban.test(wrh)) {
      reasons.push(`Cross-domain leakage in WRH for ${domain}`);
      break;
    }
  }

  return reasons.length === 0 ? { pass: true } : { pass: false, reasons };
}

/* ── Normalization ──────────────────────────────────────────────────────── */

function normalizeReflection(
  r: any,
  domain: Domain,
  secondaryDomains: Domain[],
  short: boolean,
  plan: "FREE" | "PREMIUM",
  anchors: string[]
): Reflection {
  const defaults = DOMAIN_DEFAULTS[domain];
  const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const cleanArr = (v: unknown, max: number): string[] =>
    Array.isArray(v) ? v.map((x) => String(x ?? "").trim()).filter(Boolean).slice(0, max) : [];

  const isPremium = plan === "PREMIUM";

  let summary = clean(r?.summary) || (short ? defaults.shortSummary : defaults.summary);

  if (!short) {
    summary = repairCarryingLine(summary);
    // FIX Bug2: injectAnchorIntoCarrying now fires on any banned opener
    summary = injectAnchorIntoCarrying(summary, anchors);

    if (isPremium) {
      const core = clean(r?.corepattern) || defaults.corepattern;
      summary = ensurePremiumSummary(summary, domain, anchors, core, secondaryDomains);
    }
  }

  const corepattern = clean(r?.corepattern) || defaults.corepattern;
  const minArr = isPremium ? 3 : 2;
  const themes = topUpUnique(cleanArr(r?.themes, 6), defaults.themes, minArr, 6);
  const emotions = topUpUnique(cleanArr(r?.emotions, 6), defaults.emotions, minArr, 6);
  const questions = ensureFourQuestions(cleanArr(r?.questions, 6), domain, short);

  let gentlenextstep =
    clean(r?.gentlenextstep) ||
    (short ? defaults.shortNextStep : isPremium ? defaults.nextStepPremium : defaults.nextStepFree);

  if (isPremium && !short) gentlenextstep = ensurePremiumStep(gentlenextstep, domain);

  return {
    summary,
    corepattern,
    themes,
    emotions,
    gentlenextstep,
    questions,
    domain,
    secondaryDomains,
  };
}

/* ── Prompt Builder ─────────────────────────────────────────────────────── */

function buildSystemPrompt(
  plan: "FREE" | "PREMIUM",
  domain: Domain,
  secondaryDomains: Domain[],
  short: boolean,
  positive: boolean = false,
  locale: string = "en"
): string {
  const isPremium = plan === "PREMIUM";
  const mixed = secondaryDomains.length > 0;

  const targetLanguage    = getAiLanguageName(locale);
  const languageInstruction = targetLanguage
    ? `
LANGUAGE RULE: You MUST respond entirely in ${targetLanguage}. Every field — summary, corepattern, themes, emotions, gentlenextstep, questions — must be written in ${targetLanguage}. Do not use English anywhere in your response.
`
    : "";

  const summaryStructure =
    isPremium && !short
      ? `1) "What you're carrying:" — open with the person's concrete situation using THEIR words (include 1 short verbatim phrase)\n2) "What's really happening:" — the deeper dynamic (need / fear / value / control), grounded in THIS entry\n3) "Deeper direction:" — one forward-facing observation (a perspective shift + what to try next)`
      : `1) "What you're carrying:" — open with the person's concrete situation using THEIR words\n2) "What's really happening:" — the deeper dynamic, grounded in THIS entry`;

  const nextStepStructure =
    isPremium && !short
      ? `"Option A:" (practical, doable today) and "Option B:" (reflective alternative) and "Script line:" (1-2 calm sentences they could actually say/write)`
      : `"Option A:" (practical, doable today) and "Option B:" (reflective alternative)`;

  const shortGuidance = short
    ? `\nSHORT ENTRY: Under 12 words. Be warm and curious — not analytical. Invite one more sentence.`
    : "";

  const domainSpecific: Partial<Record<Domain, string>> = {
    HEALTH: `DOMAIN: HEALTH
HARD RULE: This covers medical concerns AND mental health AND sleep/exhaustion entries.
For sleep entries: questions must reference the specific pattern (3am wake-ups, racing mind, the failure feeling) — not generic health advice.
For medical entries: stay with the fear and uncertainty — don't give medical advice.
BANNED question patterns: "what could be causing your symptoms" (self-diagnosis), "how can you prepare yourself" (advice-y), "prioritize your emotional well-being", "take care of yourself", "manage your health", "set a bedtime routine", "try sleep hygiene".`,
    GRIEF: `DOMAIN: GRIEF\nHARD RULE: Never suggest moving on or finding closure. Grief questions should deepen connection to the person/thing lost — not push toward resolution.`,
    PARENTING: `DOMAIN: PARENTING\nHARD RULE: The carrying line MUST use a specific detail from this entry (son, yelled, the look on his face, failing him). 'A parenting moment is sitting with you' is BANNED.`,
    CREATIVE: `DOMAIN: CREATIVE\nHARD RULE: The carrying line MUST use a specific detail from this entry (blank page, novel, staring, used to love writing, proof of something). 'A creative block is sitting with you' is BANNED. The phrase "proof of something I'm failing at" or similar must appear if present in the entry.`,
    IDENTITY: `DOMAIN: IDENTITY\nHARD RULE: Use the person's exact language — "performing", "version of myself", "pretending", "fake", "fraud", etc.`,
    MONEY: `DOMAIN: MONEY\nHARD RULE: The carrying line MUST use a specific detail from this entry (rent, bank account, paycheck to paycheck, numbers, tired of pretending). Do NOT open with 'There's a financial pressure'. Questions must stay reflective, not advisory.`,
    WORK: `DOMAIN: WORK\nHARD RULE: The carrying line MUST use a specific detail from this entry (the specific person's name if mentioned, the specific situation — project lead, overlooked, nobody asked, three years). 'Something from work is still sitting with you' is BANNED. Use the person's exact words.`,
    RELATIONSHIP: `DOMAIN: RELATIONSHIP\nHARD RULE: Use the person's exact sensory or metaphorical language (e.g. "behind glass", "watching from the outside", "completely invisible"). This exact phrase MUST appear in the reflection if it's in the entry.`,
    GENERAL: domain === "GENERAL" && positive
      ? `DOMAIN: GENERAL — POSITIVE ENTRY\nHARD RULE: This entry is celebratory or grateful. Do NOT probe for hidden darkness or deeper pain. Reflect the win or gratitude back warmly and specifically. Use THEIR words. Ask what this moment means to them or what made it possible — not what's wrong underneath it.`
      : `DOMAIN: GENERAL\nHARD RULE: Do NOT become vague. Use the most specific phrase from the entry — 'feel off', 'slightly wrong', 'can't name it' — whatever they wrote. 'You wrote something real down' is BANNED.`,
  };

  const secondaryText = mixed
    ? `\nSECONDARY DOMAINS ALSO PRESENT: ${secondaryDomains.join(", ")}.\nUse them only as supporting pressure — do not let them replace the primary emotional center.`
    : "";

  const domainHint =
    domainSpecific[domain] ??
    `DOMAIN: ${domain}\nHARD RULE: Stay inside this domain. Do not borrow language from other domains unless clearly present.`;

  const depthGuidance =
    isPremium && !short
      ? `\nPREMIUM DEPTH:\n- Use a micro-framework implicitly (facts vs fears, needs vs strategies, control vs uncertainty).\n- Themes/emotions: return at least 3 each.\n- All 4 questions must be specific to THIS entry.\n`
      : "";

  return `You are ${CONFIG.aiPersonaName} — a private journaling thinking partner.
Make the person feel genuinely seen, with precision, leaving them clearer than before.
${languageInstruction}
CORE RULES:
- Write to "you" — never "the user", "this person", or "the person"
- corepattern MUST start with "You" — never "The person's mind" or "This person"
- Never invent events not in the entry
- Use at least ONE verbatim phrase from the entry in the SUMMARY
- Avoid templates, generic openings, and cliches
- Prioritize the PRIMARY pressure driver over contextual mentions
- Example: if money is the real pressure and work is only where it leaks out, this is MONEY, not WORK

ANTI-TEMPLATE TEST: If the opener could apply to 5 different people, rewrite it using what THIS person wrote.

BANNED openers (forbidden in any form):
- "Something from work" / "A workplace moment"
- "Something in this connection" / "A gap between you and someone"
- "Something is sitting with you" / "Something you haven't fully named"
- "Something happened in training" / "Pride mixed with fatigue"
- "There's a financial weight" / "Your body or mind is asking"
- "You're in grief" / "Something about loss"
- "Something about parenting" / "Something about your child"
- "Something about your creative work" / "Your creative energy"
- "A question about who you are" / "Something about who you are"
- "You wrote something real down" / "The fact that you put it into words"
- ANY opener with zero words from the actual entry

${domainHint}${secondaryText}${depthGuidance}${shortGuidance}

OUTPUT STRUCTURE:
summary (labeled lines in order):
${summaryStructure}

corepattern — ONE sentence. The specific dynamic in THIS entry.
CRITICAL: Must be meaningfully DIFFERENT from "What's really happening" — shorter, more distilled, the one-line takeaway. Do NOT restate or paraphrase the WRH line. If WRH explains the mechanism, corepattern names the underlying tension in 10 words or fewer.

themes — short phrases. emotions — single words (prefer nouns: shame not shameful, anxiety not anxious).

gentlenextstep:
${nextStepStructure}

questions — exactly 4.
- Q1–Q3: ONLY explore inner experience — what the person feels, notices, wonders, remembers. Never suggest actions.
- Q1–Q3: NEVER use "set a boundary", "tell someone", "take a step", "try this", "consider doing"
- Q3: must NOT presuppose a solution — ask what the person observes, not what they plan
- Q4: MUST start with exactly "Next time," — no exceptions

OUTPUT: Return ONLY valid JSON. No markdown, no preamble.
{
  "summary": "...",
  "corepattern": "...",
  "themes": ["...", "...", "..."],
  "emotions": ["...", "...", "..."],
  "gentlenextstep": "...",
  "questions": ["...", "...", "...", "Next time, ..."]
}`.trim();
}

/* ── Groq Caller ────────────────────────────────────────────────────────── */

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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
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

/* ── Main Export ────────────────────────────────────────────────────────── */

export async function generateReflectionFromEntry(input: Input): Promise<Reflection> {
  const apiKey = process.env.GROQAPIKEY || process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQAPIKEY");

  // FIX: updated default model to llama-4-scout-17b-16e-instruct
  const model = process.env.GROQMODEL || "llama-4-scout-17b-16e-instruct";
  const plan = normalizePlan(input.plan);
  const locale = (input.locale ?? "en").trim() || "en";

  const entryBody = (input.content || "").trim();
  const titleLine = input.title?.trim() ? `Title: ${input.title.trim()}\n` : "";
  const entryText = `${titleLine}Entry:\n${entryBody}`;

  const detectedDomain = detectDomain(`${input.title || ""}\n${entryBody}`);
  const positive = isPositiveEntry(`${input.title || ""} ${entryBody}`);
  // If entry is clearly celebratory/grateful, override to GENERAL so positive system prompt fires
  // Exception: grief and health entries can contain positive moments without being positive entries
  const domain: Domain = (positive && detectedDomain !== "GRIEF" && detectedDomain !== "HEALTH")
    ? "GENERAL"
    : detectedDomain;
  const secondaryDomains = detectSecondaryDomains(`${input.title || ""}\n${entryBody}`, domain);
  const short = isShortEntry(entryBody);
  const anchors = extractAnchors(entryBody);
  const anchorsBlock = anchors.map((a, i) => `ANCHOR ${i + 1}: ${a}`).join("\n");

  const recentThemes = (input.recentThemes || []).map((s) => String(s).trim()).filter(Boolean).slice(0, 5);
  const memoryBlock = recentThemes.length
    ? `RECENT PATTERN CONTEXT (use only if genuinely relevant):\n${recentThemes.map((t, i) => `${i + 1}) ${t}`).join("\n")}\n\n`
    : "";

  // FIX Bug3: expanded DOMAIN_ANCHOR_SIGNALS with vivid/metaphorical phrase patterns
  const DOMAIN_ANCHOR_SIGNALS: Partial<Record<Domain, RegExp>> = {
    MONEY: /\b(bank|rent|afford|money|debt|paycheck|salary|broke|financial|bills?|savings?|numbers|pretending|managing)\b/i,
    HEALTH: /\b(pain|doctor|test|diagnosis|scared|sick|illness|symptoms?|body|health|blood|nine days|phone rings|clench|wake up|waking|3am|4am|sleep|running through|already failed|racing|can'?t switch|lying awake)\b/i,
    GRIEF: /\b(died|death|miss|passed|gone|grief|loss|funeral|remember|almost picked up|call me|saturdays)\b/i,
    PARENTING: /\b(son|daughter|kid|child|yelled|snapped|broke me|failing|parent|look on his face|look on her face|eight)\b/i,
    CREATIVE: /\b(blank page|writing|novel|draw|music|block|staring|draft|proof|used to love|forty minutes)\b/i,
    IDENTITY: /\b(performing|version of myself|who I am|underneath|lost|mask|pretending|fake|fraud|exhausted by)\b/i,
    WORK: /\b(work|coworker|manager|meeting|office|presentation|client|team|project lead|overlooked|nobody asked|Marcus|three years|six months)\b/i,
    RELATIONSHIP: /\b(partner|wife|husband|boyfriend|girlfriend|relationship|fight|distance|behind glass|invisible|dinner|smiling|nodding)\b/i,
    GENERAL: /\b(feel off|slightly wrong|can'?t name|just off|don'?t know|something wrong|numb|not quite)\b/i,
  };

  const domainAnchorRe = DOMAIN_ANCHOR_SIGNALS[domain];

  // FIX Bug3: select bestAnchor using vivid scoring, not just first domain match
  const vividAnchor = selectVividAnchor(anchors);
  const domainAnchor = domainAnchorRe
    ? (anchors.find((a) => domainAnchorRe.test(a)) ?? null)
    : null;

  // Priority: vivid phrase > domain signal > first anchor
  const vividScore = vividAnchor ? scoreAnchorVividness(vividAnchor) : 0;
  const bestAnchor = vividScore >= 2
    ? (vividAnchor ?? domainAnchor ?? anchors[0] ?? "")
    : (domainAnchor ?? vividAnchor ?? anchors[0] ?? "");

  const carryingStarter = (() => {
    const clean = toSecondPerson(bestAnchor.replace(/^["""]|["""]$/g, "").trim());
    if (!clean || clean.length < 8) return "";
    return clean;
  })();

  const carryingInstruction = carryingStarter
    ? `COMPLETE THIS CARRYING LINE (do not change the start, complete naturally in 1 sentence):
"What you're carrying: ${carryingStarter}..."`
    : `"What you're carrying:" must open with a concrete detail from this entry.`;

  const QUESTION_STEMS: Partial<Record<Domain, string[]>> = {
    MONEY: [
      "What does the financial pressure feel like in your body right now — is it closer to fear or shame?",
      "When you say you're tired of pretending you're managing, what are you actually hiding from?",
      "What would it feel like to tell one person the real number?",
    ],
    PARENTING: [
      "When you think about the look on his face, what do you most wish he'd understood in that moment?",
      "What was happening in you just before you yelled — what were you already carrying?",
      "What would a repair look like that you could actually say out loud?",
    ],
    CREATIVE: [
      "When you say writing started feeling like proof — proof of what, exactly?",
      "What was different about the last time writing felt easy and alive?",
      "What would you make today if it could never be read by anyone?",
    ],
    IDENTITY: [
      "Which version of yourself do you perform most — and what does it protect you from?",
      "When you say you don't know what's underneath, is that frightening or relieving?",
      "What's one small choice this week that would be more true to you?",
    ],
    GRIEF: [
      "What does almost picking up the phone tell you about what you still need from him?",
      "When you say you didn't expect to feel it this hard again, what is it about today that caught you off guard?",
      "What's one specific thing you want to remember right now — not in general, but in detail?",
    ],
    HEALTH: [
      "What part of waiting feels the hardest — the not knowing, or what the answer might mean?",
      "What do you actually know for certain right now, separate from what you fear?",
      "What would you want to say to the doctor that you haven't said yet?",
    ],
    WORK: [
      "What felt most personal about this — the specific thing that happened, or what it implied about your value?",
      "What do you wish had been recognized or respected about your contribution?",
      "What would a direct, calm response to this situation look like — in one sentence?",
    ],
    RELATIONSHIP: [
      "What were you most hoping for in that moment — to be seen, to be included, or something else?",
      "What did you hold back from saying — and what stopped you?",
      "What would feeling genuinely present with him look like — not perfect, just real?",
    ],
    GENERAL: [
      "What's the most specific part of 'feeling off' — is it in your body, your thoughts, or your sense of things?",
      "If this feeling had a name — not 'off', but a real name — what would it be?",
      "What would help right now — to be distracted, to sit with it, or to understand it?",
    ],
  };

  const stems = (!short && QUESTION_STEMS[domain]) ? QUESTION_STEMS[domain]! : [];
  const stemsBlock = stems.length
    ? `\nSTARTING POINTS for your questions (use these as Q1-Q3 seeds, adapt to fit — Q4 must start "Next time,"):
${stems.map((s, i) => `Q${i + 1} seed: "${s}"`).join("\n")}`
    : "";

  const secondaryBlock = secondaryDomains.length
    ? `\nSECONDARY DOMAINS PRESENT: ${secondaryDomains.join(", ")}.\nUse them only as supporting context. The primary emotional center must stay in ${domain}.`
    : "";

  const userPrompt = `${memoryBlock}THE PERSON'S EXACT WORDS — use at least one verbatim phrase in your SUMMARY:
${anchorsBlock}

${carryingInstruction}${stemsBlock}${secondaryBlock}

Stay in PRIMARY DOMAIN: ${domain}.

${entryText}`.trim();

  const maxTokens = plan === "PREMIUM" ? 1200 : 780;
  const systemPrompt = buildSystemPrompt(plan, domain, secondaryDomains, short, positive, locale);

  const ATTEMPTS = [
    { temperature: plan === "PREMIUM" ? 0.55 : 0.45, note: undefined as string | undefined },
    {
      temperature: 0.3,
      note: `RETRY — failed quality rules. Fix: use an ANCHOR verbatim in the summary, add Deeper direction + Script line for PREMIUM, stay in PRIMARY DOMAIN: ${domain}. Use secondary domains only as support. Return ONLY valid JSON.`,
    },
    {
      temperature: 0.2,
      note: `FINAL RETRY — be highly specific. Quote one anchor verbatim. Include Deeper direction + Script line for PREMIUM. PRIMARY DOMAIN: ${domain}. SECONDARY: ${secondaryDomains.join(", ") || "none"}. Return ONLY JSON.`,
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
      console.warn(`[Quiet Mirror] Attempt ${i + 1} threw:`, err);
      continue;
    }

    const parsed = parseModelJson<any>(raw);
    if (!parsed) continue;

    bestParsed = parsed;
    const result = qualityCheck(parsed, anchors, plan, domain, short);

    if (result.pass) {
      return normalizeReflection(parsed, domain, secondaryDomains, short, plan, anchors);
    }

    if (i === ATTEMPTS.length - 1) {
      console.warn("[Quiet Mirror] Quality gate failed after 3 attempts. Domain:", domain, "Reasons:", (result as any).reasons);
      return normalizeReflection(parsed, domain, secondaryDomains, short, plan, anchors);
    }
  }

  const defaults = DOMAIN_DEFAULTS[domain];
  const base = short ? defaults.shortSummary : defaults.summary;

  // FIX Bug2: injectAnchorIntoCarrying always fires on banned openers at the fallback level too
  let summaryWithAnchor = injectAnchorIntoCarrying(base, anchors);
  if (plan === "PREMIUM" && !short) {
    summaryWithAnchor = ensurePremiumSummary(summaryWithAnchor, domain, anchors, defaults.corepattern, secondaryDomains);
  }

  return normalizeReflection(
    {
      summary: summaryWithAnchor,
      corepattern: defaults.corepattern,
      themes: defaults.themes,
      emotions: defaults.emotions,
      gentlenextstep: short ? defaults.shortNextStep : plan === "PREMIUM" ? defaults.nextStepPremium : defaults.nextStepFree,
      questions: short ? defaults.shortQuestions : defaults.questions,
    },
    domain,
    secondaryDomains,
    short,
    plan,
    anchors
  );
}
