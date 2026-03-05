// lib/ai/generateReflection.ts
// Havenly V19.1 — V19 base + 8 bug fixes applied
// Fixes: (1) injectAnchorIntoCarrying only fires on banned lines
//        (2) CREATIVE mustHave includes blank page/staring; domain guard loosened
//        (3) toSecondPerson() restored — always applied to carrying line
//        (4) ensurePremiumStep annotation removed
//        (5) emotions adjective→noun normalizer added
//        (6) smart quote normalization kept in parseModelJson
//        (7) BANNED_SUMMARY_PATTERNS no longer conflicts with defaults
//        (8) Operation order: second-person repair → premium enforcement (no pre-inject)

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
  plan: "FREE" | "PREMIUM" | string;
  recentThemes?: string[];
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

/* ── Plan normalization ──────────────────────────────────────────────────── */

function normalizePlan(p: unknown): "FREE" | "PREMIUM" {
  const s = String(p ?? "").trim().toUpperCase();
  if (s === "PREMIUM" || s.includes("PREMIUM") || s.includes("PRO") || s.includes("UNLIMIT")) {
    return "PREMIUM";
  }
  return "FREE";
}

/* ── Domain Detection ────────────────────────────────────────────────────── */

type WeightedSignal = { re: RegExp; w: number };

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
    { re: /\b(ran|run|running|workout|gym|cardio|lifting|training|exercise)\b/i, w: 1 },
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
  return scores;
}

function emotionalBoost(text: string, domain: Exclude<Domain, "GENERAL">): number {
  const s = text.toLowerCase();
  let boost = 0;
  for (const sig of EMOTIONAL_BOOSTERS[domain]) if (sig.re.test(s)) boost += sig.w;
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

/* ── Domain Defaults ─────────────────────────────────────────────────────── */

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
      "What you're carrying: Something happened in your training that's still with you.\nWhat's really happening: The gap between what your body did and what you felt about it is worth sitting with.",
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
      "What you're carrying: Something from work is sitting with you — quietly, but persistently.\nWhat's really happening: Even a few words can hold a lot of weight when they touch your sense of worth.",
    corepattern: "You're navigating a tension between your professional self-worth and what's being reflected back to you.",
    themes: ["recognition", "boundaries", "self-worth", "communication"],
    emotions: ["frustration", "hurt", "determination", "anxiety"],
    nextStepFree: "Option A: Write down the one thing you wish had gone differently. Option B: Name what you'd want to say if there were no consequences.",
    nextStepPremium: "Option A: Write down the one thing you wish had gone differently. Option B: Name what you'd want to say if there were no consequences. Script line: \"I want to be clear about what I need here, without escalating.\"",
    shortNextStep: "Option A: Finish this sentence — \"What I actually needed in that moment was...\". Option B: Write down one thing you want to be different next time.",
    questions: [
      "What felt most dismissed — your idea, your effort, or your presence?",
      "What would a calm, direct version of you say in one sentence?",
      "What boundary, if stated clearly, would protect you without escalating?",
      "Next time, write down the exact words exchanged and your immediate reaction.",
    ],
    shortQuestions: [
      "What's the one word that best describes how that made you feel?",
      "If a colleague described the same situation, what would you tell them?",
      "What would it look like to protect yourself here without escalating?",
      "Next time, write more — what happened just before, and just after?",
    ],
    mustHave: /\b(work|meeting|colleague|manager|office|team|project|boss|client|performance)\b/i,
    driftKeywords: /\b(partner|wife|husband|girlfriend|boyfriend|workout|running|gym)\b/i,
  },

  RELATIONSHIP: {
    summary:
      "What you're carrying: A gap between you and someone who matters opened up today.\nWhat's really happening: The distance you felt — and what you didn't say — is still there.",
    shortSummary:
      "What you're carrying: A quiet ache around a connection that matters to you.\nWhat's really happening: Something small happened — or didn't happen — and it landed harder than it looked.",
    corepattern: "You're trying to protect your self-respect while staying connected to someone who matters.",
    themes: ["connection", "communication", "needs", "self-worth"],
    emotions: ["hurt", "longing", "confusion", "anger"],
    nextStepFree: "Option A: Name the feeling in one sentence without assigning blame. Option B: Ask yourself what you most needed in that moment.",
    nextStepPremium: "Option A: Name the feeling in one sentence without assigning blame. Option B: Ask yourself what you most needed in that moment. Script line: \"I want to understand what I needed before I decide what to do.\"",
    shortNextStep: "Option A: Finish this sentence — \"What I actually needed was...\". Option B: Notice whether you want to say something, or just to be seen.",
    questions: [
      "What exactly did that moment trigger — anger, shame, fear, or something else?",
      "What would you ask for if you knew you'd be heard without judgment?",
      "What's the most generous interpretation that still respects your feelings?",
      "Next time, paste the exact words that stung and what you did immediately after.",
    ],
    shortQuestions: [
      "What's the feeling underneath the low — is it loneliness, disappointment, or something else?",
      "Who or what came to mind when you wrote this?",
      "What would it feel like to say this feeling out loud to someone safe?",
      "Next time, write two more sentences — what happened before this feeling arrived?",
    ],
    mustHave: /\b(partner|wife|husband|girlfriend|boyfriend|relationship|family|friend|love|date|argu(e|ed|ment)|fight|break.?up)\b/i,
    driftKeywords: /\b(colleague|manager|meeting|workout|gym|running)\b/i,
  },

  MONEY: {
    summary:
      "What you're carrying: There's a financial pressure sitting on you right now.\nWhat's really happening: Money stress is rarely just about money — it touches your sense of safety and control.",
    shortSummary:
      "What you're carrying: Something about money is pressing on you today.\nWhat's really happening: The number isn't just a number — it's connected to how secure you feel.",
    corepattern: "You're managing the gap between what you have, what you need, and what you think that says about you.",
    themes: ["security", "control", "shame", "planning"],
    emotions: ["anxiety", "shame", "overwhelm", "fear"],
    nextStepFree: "Option A: Write down the one financial fact that feels most urgent right now — just the fact, not the spiral. Option B: Name one thing in this situation you actually do have control over.",
    nextStepPremium: "Option A: Write down the one financial fact that feels most urgent right now — just the fact, not the spiral. Option B: Name one action you can take today that reduces the pressure even 5%. Script line: \"I'm dealing with one thing at a time — today's thing is clear.\"",
    shortNextStep: "Option A: Name the feeling underneath the money stress — is it fear, shame, or something else? Option B: Write one sentence about what 'enough' would look like for you.",
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
    mustHave: /\b(money|financial|budget|debt|savings|bills|rent|mortgage|afford|broke|salary|income|spending|bank|paycheck)\b/i,
    driftKeywords: /\b(colleague|manager|partner|wife|husband|workout|gym)\b/i,
  },

  HEALTH: {
    summary:
      "What you're carrying: Your body is asking for your attention right now.\nWhat's really happening: Waiting and not knowing can feel like losing control — even before you have answers.",
    shortSummary:
      "What you're carrying: Something about your health is sitting with you today.\nWhat's really happening: Your body is asking to be heard — and you're listening.",
    corepattern: "You're navigating the space between what you know and what you can't control about your own wellbeing.",
    themes: ["health anxiety", "uncertainty", "body awareness", "control"],
    emotions: ["anxiety", "fear", "uncertainty", "overwhelm"],
    nextStepFree: "Option A: Write down what you actually know right now — separate from what you're afraid of. Option B: Name one thing your body needs today that isn't about fixing anything.",
    nextStepPremium: "Option A: Write what you know (facts) vs what you fear (stories). Option B: Name one gentle thing your body needs today that isn't about fixing. Script line: \"I can hold uncertainty without solving it today.\"",
    shortNextStep: "Option A: Notice where in your body you feel this worry. Name it without judging it. Option B: Write one sentence about what you wish someone understood about how this feels.",
    questions: [
      "What part is most frightening — the results, the waiting, or what it might mean for your life?",
      "What have you been doing to cope with the pain or uncertainty (even if it's imperfect)?",
      "What would you want to walk into the appointment knowing or asking for?",
      "Next time, note what triggered the worry and what helped it settle even slightly.",
    ],
    shortQuestions: [
      "What does your body feel like right now — not what you think about it, just what's actually there?",
      "Is there one small thing your body is asking for today?",
      "What would it feel like to be gentle with yourself about this?",
      "Next time, note what triggered the worry and what helped it settle.",
    ],
    mustHave: /\b(doctor|hospital|diagnosis|symptoms|medication|illness|sick|pain|health|medical|body|anxiety|therapy|mental|test results?)\b/i,
    driftKeywords: /\b(colleague|manager|partner|workout|gym|running|money|budget)\b/i,
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
    mustHave: /\b(identity|who I am|purpose|authentic|real self|mask|performing|version of myself|belong|lost|direction|meaning|transition)\b/i,
    driftKeywords: /\b(colleague|manager|gym|workout|money|doctor|wife|husband|girlfriend|boyfriend)\b/i,
  },

  GENERAL: {
    summary:
      "What you're carrying: You wrote something real down — even if it isn't fully named yet.\nWhat's really happening: The fact that you put it into words means part of you is already trying to understand it.",
    shortSummary:
      "What you're carrying: Something quiet — not loud enough to name yet, but present enough to notice.\nWhat's really happening: You showed up to write, even without words. That's the start of something.",
    corepattern: "You're in the middle of something — not at the beginning, not at the end, just present with it.",
    themes: ["self-awareness", "processing", "presence", "uncertainty"],
    emotions: ["uncertainty", "restlessness", "quiet courage", "hope"],
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

/* ── Banned patterns (FIX 7: no longer conflicts with defaults) ────────────── */

const BANNED_SUMMARY_PATTERNS: RegExp[] = [
  /\ba workplace moment that left a mark\b/i,
  /\bsomething from work got under your skin\b/i,
  /\bsomething happened at work\b/i,
  /\bsomething from work is still with you\b/i,

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
];

/* Cross-domain leakage guard (WRH line) */
const WRH_CROSS_DOMAIN_BANS: Record<Domain, RegExp[]> = {
  CREATIVE: [/\bdistance you felt\b/i, /\bwhat you didn't say\b/i, /\bgap between you\b/i],
  WORK: [], RELATIONSHIP: [], FITNESS: [], MONEY: [], HEALTH: [],
  GRIEF: [], PARENTING: [], IDENTITY: [], GENERAL: [],
};

/* ── Anchor Extraction ───────────────────────────────────────────────────── */

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

  const lines = t.split("\n").map(l => l.trim()).filter(Boolean);
  const joined = lines.join(" ");
  const sentences = joined.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);

  const emotionalSignals =
    /\b(but|just|still|keep|always|never|again|quiet|ache|miss|wish|pretend|perform|nothing|empty|disappear|invisible|gap|distance|wanted|needed|tired|exhausted|fine|okay|underneath|scared|afraid|worried|hopeless|stuck|alone|lost|failed)\b/i;

  for (const s of sentences) {
    if (anchors.length >= 4) break;
    if (emotionalSignals.test(s) && s.length <= 160) add(s);
  }

  if (anchors.length < 2) {
    for (const s of sentences.slice(0, 4)) {
      if (s.length <= 160) add(s);
      if (anchors.length >= 2) break;
    }
  }

  if (anchors.length < 1) add("you wrote this down, which means it matters");
  return anchors.slice(0, 5);
}

/* ── JSON Parsing (FIX 6: smart quote normalization preserved) ──────────── */

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
      if (escaped) { escaped = false; }
      else if (ch === "\\") { escaped = true; }
      else if (ch === '"') { inString = false; }
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth === 0) return s.slice(start, i + 1);
  }
  return null;
}

function parseModelJson<T>(raw: string): T | null {
  // FIX 6: normalize smart quotes before extraction (non-destructive — only on outer level)
  const normalized = raw
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
  const json = extractFirstJsonObject(normalized);
  if (!json) return null;
  try { return JSON.parse(json) as T; }
  catch { return null; }
}

/* ── Matching helpers ────────────────────────────────────────────────────── */

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .replace(/[""]/g, '"')
    .replace(/[\']/g, "'")
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
  const m = summary.match(new RegExp(`${label}\\s*([^\\n]+)`, "i"));
  return (m?.[1] ?? "").trim();
}

/* ── FIX 3: toSecondPerson — always applied to carrying line ────────────── */

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

/* ── FIX 1: injectAnchorIntoCarrying — only fires on BANNED lines ────────── */

function isCarryingLineBanned(line: string): boolean {
  const lower = line.toLowerCase();
  return BANNED_SUMMARY_PATTERNS.some(re => re.test(lower));
}

function injectAnchorIntoCarrying(summary: string, anchors: string[]): string {
  if (!summary.includes("What you're carrying:")) return summary;
  const carrying = extractSummaryLine(summary, "What you're carrying:");

  // FIX 1: only inject if the carrying line is actually a banned/generic template
  if (!isCarryingLineBanned(carrying)) return summary;

  const a = anchors.find(x => normalizeForMatch(x).length >= 8) ?? anchors[0] ?? "";
  const clean = String(a).replace(/^["""]|["""]$/g, "").trim();
  if (!clean) return summary;

  const injected = toSecondPerson(clean);
  const fixed = injected.charAt(0).toUpperCase() + injected.slice(1);

  return summary.replace(
    /What you're carrying:\s*[^\n]+/i,
    `What you're carrying: ${fixed}`
  );
}

/* ── FIX 5: Emotion normalizer ───────────────────────────────────────────── */

const EMOTION_NORMALIZE: Record<string, string> = {
  shameful: "shame", ashamed: "shame", guilty: "guilt", anxious: "anxiety",
  scared: "fear", frightened: "fear", angry: "anger", sad: "sadness",
  tired: "tiredness", exhausted: "exhaustion", hopeful: "hope",
  confused: "confusion", overwhelmed: "overwhelm", frustrated: "frustration",
  lonely: "loneliness", grateful: "gratitude", proud: "pride",
  disappointed: "disappointment", resentful: "resentment", helpless: "helplessness",
  powerless: "powerlessness", worried: "worry", envious: "envy",
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
  const out = qs.map(s => String(s ?? "").trim()).filter(Boolean).slice(0, 4);
  while (out.length < 4) out.push(defaults[out.length] ?? defaults[defaults.length - 1]);
  if (!out[out.length - 1].toLowerCase().startsWith("next time,")) out[out.length - 1] = defaults[3];
  return out.slice(0, 4);
}

function ensurePremiumSummary(summary: string, domain: Domain, anchors: string[], corepattern: string): string {
  let s = summary.trim();

  if (!s.includes("What you're carrying:")) {
    const a = anchors[0] ?? "You wrote something that matters.";
    s = `What you're carrying: ${toSecondPerson(a)}\n` + s;
  }
  if (!s.includes("What's really happening:")) {
    s += `\nWhat's really happening: ${corepattern}`;
  }

  if (!s.includes("Deeper direction:")) {
    const a = anchors.find(x => normalizeForMatch(x).length >= 10) ?? anchors[0] ?? "";
    const clean = String(a).replace(/^["""]|["""]$/g, "").trim();
    const dd = clean.length >= 8
      ? `Deeper direction: The fact that you wrote "${clean}" points to a real need — one small honest action today reduces pressure without forcing certainty.`
      : `Deeper direction: Pick one small, honest action that reduces pressure without forcing certainty.`;
    s = `${s}\n${dd}`;
  }

  // FIX 2: domain guard only fires if BOTH mustHave fails AND driftKeywords fires
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

/* ── FIX 4: ensurePremiumStep — no annotation appended ─────────────────── */

function ensurePremiumStep(step: string, domain: Domain): string {
  let s = step.trim();
  if (!/Option A:/i.test(s) || !/Option B:/i.test(s)) {
    s = DOMAIN_DEFAULTS[domain].nextStepPremium;
  }
  if (!/Script line:/i.test(s)) {
    const scriptByDomain: Record<Domain, string> = {
      WORK: 'Script line: "I want to be clear about what I need here."',
      RELATIONSHIP: 'Script line: "I want to understand what I needed before I respond."',
      FITNESS: 'Script line: "I'm building consistency — recovery counts."',
      MONEY: 'Script line: "I'm dealing with one thing at a time — today's thing is clear."',
      HEALTH: 'Script line: "I can hold uncertainty without solving it today."',
      GRIEF: 'Script line: "I'm allowed to miss this — and I'm allowed to still be here."',
      PARENTING: 'Script line: "I'm sorry I snapped. I love you, and I'm working on it."',
      CREATIVE: 'Script line: "The work doesn't have to be good yet — it just has to exist."',
      IDENTITY: 'Script line: "I'm allowed to be honest about what's true for me."',
      GENERAL: 'Script line: "I don't need the answer yet — I need to stay honest."',
    };
    s = `${s}${s.endsWith(".") ? "" : "."} ${scriptByDomain[domain]}`;
  }
  return s;
}

/* ── Quality Gate ────────────────────────────────────────────────────────── */

type QualityResult = { pass: true } | { pass: false; reasons: string[] };

function qualityCheck(
  parsed: any, anchors: string[], plan: "FREE" | "PREMIUM", domain: Domain, short: boolean
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
    if (!anchorHitInLine(carrying, anchors) && !anchorHitInLine(wrh, anchors)) {
      reasons.push("Missing anchor in carrying/WRH line");
    }
    for (const re of BANNED_SUMMARY_PATTERNS) {
      if (re.test(summary)) { reasons.push("Generic template detected"); break; }
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

  if (domain !== "GENERAL") {
    const summaryOnly = `${carrying} ${wrh} ${extractSummaryLine(summary, "Deeper direction:")}`;
    if (!defaults.mustHave.test(summaryOnly)) reasons.push(`Domain signal missing for ${domain}`);
    if (defaults.driftKeywords.test(summaryOnly)) reasons.push(`Domain drift for ${domain}`);
  }

  for (const ban of WRH_CROSS_DOMAIN_BANS[domain] ?? []) {
    if (ban.test(wrh)) { reasons.push(`Cross-domain leakage in WRH for ${domain}`); break; }
  }

  return reasons.length === 0 ? { pass: true } : { pass: false, reasons };
}

/* ── Normalization (FIX 8: correct operation order) ────────────────────── */

function normalizeReflection(
  r: any, domain: Domain, short: boolean, plan: "FREE" | "PREMIUM", anchors: string[]
): Reflection {
  const defaults = DOMAIN_DEFAULTS[domain];
  const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const cleanArr = (v: unknown, max: number): string[] =>
    Array.isArray(v) ? v.map(x => String(x ?? "").trim()).filter(Boolean).slice(0, max) : [];
  const isPremium = plan === "PREMIUM";

  let summary = clean(r?.summary) || (short ? defaults.shortSummary : defaults.summary);

  if (!short) {
    // FIX 3 + FIX 8: apply second-person repair FIRST, before premium enforcement
    summary = repairCarryingLine(summary);

    // FIX 1: only inject anchor if carrying line is a banned template
    summary = injectAnchorIntoCarrying(summary, anchors);

    // Premium: enforce Deeper direction after repairs are done
    if (isPremium) {
      const core = clean(r?.corepattern) || defaults.corepattern;
      summary = ensurePremiumSummary(summary, domain, anchors, core);
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

  // FIX 4: no annotation
  if (isPremium && !short) gentlenextstep = ensurePremiumStep(gentlenextstep, domain);

  return { summary, corepattern, themes, emotions, gentlenextstep, questions };
}

/* ── Prompt Builder ──────────────────────────────────────────────────────── */

function buildSystemPrompt(plan: "FREE" | "PREMIUM", domain: Domain, short: boolean): string {
  const isPremium = plan === "PREMIUM";

  const summaryStructure =
    isPremium && !short
      ? `1) "What you're carrying:" — open with the person's concrete situation using THEIR words (include 1 short verbatim phrase)\n2) "What's really happening:" — the deeper dynamic (need / fear / value / control), grounded in THIS entry\n3) "Deeper direction:" — one forward-facing observation (a perspective shift + what to try next)`
      : `1) "What you're carrying:" — open with the person's concrete situation using THEIR words\n2) "What's really happening:" — the deeper dynamic, grounded in THIS entry`;

  const nextStepStructure =
    isPremium && !short
      ? `"Option A:" (practical, doable today) and "Option B:" (reflective alternative) and "Script line:" (1–2 calm sentences they could actually say/write)`
      : `"Option A:" (practical, doable today) and "Option B:" (reflective alternative)`;

  const shortGuidance = short
    ? `\nSHORT ENTRY: Under 12 words. Be warm and curious — not analytical. Invite one more sentence.`
    : "";

  const domainHint =
    domain === "GENERAL"
      ? `DOMAIN: GENERAL\nHARD RULE: Do NOT become vague. Use the most specific phrase from the entry.`
      : `DOMAIN: ${domain}\nHARD RULE: Stay inside this domain. Do not borrow language from other domains.`;

  const depthGuidance =
    isPremium && !short
      ? `\nPREMIUM DEPTH:\n- Use a micro-framework implicitly (facts vs fears, needs vs strategies, control vs uncertainty).\n- Themes/emotions: return at least 3 each.\n- All 4 questions must be specific to THIS entry.\n`
      : "";

  return `You are Havenly — a private journaling thinking partner.
Make the person feel genuinely seen, with precision, leaving them clearer than before.

CORE RULES:
- Write to "you" — never "the user" or "this person"
- Never invent events not in the entry
- Use at least ONE verbatim phrase from the entry in the SUMMARY
- Avoid templates, generic openings, and clichés

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
- ANY opener with zero words from the actual entry

${domainHint}${depthGuidance}${shortGuidance}

OUTPUT STRUCTURE:
summary (labeled lines in order):
${summaryStructure}

corepattern — ONE sentence. The specific dynamic in THIS entry.

themes — short phrases. emotions — single words (prefer nouns: shame not shameful, anxiety not anxious).

gentlenextstep:
${nextStepStructure}

questions — exactly 4. The LAST must start with exactly: "Next time,"

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

/* ── Groq Caller ─────────────────────────────────────────────────────────── */

async function callGroq(opts: {
  apiKey: string; model: string; system: string;
  user: string; maxTokens: number; temperature: number;
}): Promise<string> {
  const { apiKey, model, system, user, maxTokens, temperature } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST", signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model, temperature, max_tokens: maxTokens,
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Groq ${res.status}: ${text}`);
    }
    const data: any = await res.json();
    return String(data?.choices?.[0]?.message?.content ?? "");
  } finally { clearTimeout(timer); }
}

/* ── Main Export ─────────────────────────────────────────────────────────── */

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
  const anchors = extractAnchors(entryBody);
  const anchorsBlock = anchors.map((a, i) => `ANCHOR ${i + 1}: ${a}`).join("\n");

  const recentThemes = (input.recentThemes || []).map(s => String(s).trim()).filter(Boolean).slice(0, 5);
  const memoryBlock = recentThemes.length
    ? `RECENT PATTERN CONTEXT (use only if genuinely relevant):\n${recentThemes.map((t, i) => `${i + 1}) ${t}`).join("\n")}\n\n`
    : "";

  const userPrompt = `${memoryBlock}THE PERSON'S EXACT WORDS — use at least one verbatim phrase in your SUMMARY:
${anchorsBlock}

REMINDER: "What you're carrying:" must open with a concrete detail from this entry. Stay in DOMAIN: ${domain}.

${entryText}`.trim();

  const maxTokens = plan === "PREMIUM" ? 1200 : 780;
  const systemPrompt = buildSystemPrompt(plan, domain, short);

  const ATTEMPTS = [
    { temperature: plan === "PREMIUM" ? 0.55 : 0.45, note: undefined as string | undefined },
    {
      temperature: 0.3,
      note: `RETRY — failed quality rules. Fix: use an ANCHOR verbatim in the summary, add Deeper direction + Script line for PREMIUM, stay in DOMAIN: ${domain}. Return ONLY valid JSON.`,
    },
    {
      temperature: 0.2,
      note: `FINAL RETRY — be highly specific. Quote one anchor verbatim. Include Deeper direction + Script line for PREMIUM. DOMAIN: ${domain}. Return ONLY JSON.`,
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
    const result = qualityCheck(parsed, anchors, plan, domain, short);
    if (result.pass) return normalizeReflection(parsed, domain, short, plan, anchors);
    if (i === ATTEMPTS.length - 1) {
      console.warn("[Havenly] Quality gate failed after 3 attempts. Domain:", domain, "Reasons:", (result as any).reasons);
      return normalizeReflection(parsed, domain, short, plan, anchors);
    }
  }

  // Last resort with premium enforcement
  const defaults = DOMAIN_DEFAULTS[domain];
  const base = short ? defaults.shortSummary : defaults.summary;
  let summaryWithAnchor = injectAnchorIntoCarrying(base, anchors);
  if (plan === "PREMIUM" && !short) {
    summaryWithAnchor = ensurePremiumSummary(summaryWithAnchor, domain, anchors, defaults.corepattern);
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
    domain, short, plan, anchors
  );
}
