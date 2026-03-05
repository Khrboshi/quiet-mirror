// lib/ai/generateReflection.ts
// Havenly V18 — Phase 3: Universal topic coverage
// Domains: WORK, RELATIONSHIP, FITNESS, MONEY, HEALTH, GRIEF, PARENTING, CREATIVE, IDENTITY, GENERAL
// Architecture: formula-based prompts + deterministic post-processor guarantees specificity

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

// ─── Domain Detection ─────────────────────────────────────────────────────────

const DOMAIN_SIGNALS: Record<Domain, RegExp[]> = {
  FITNESS: [
    /\b(ran|run|running|jog(ged)?|sprint(ed)?)\b/,
    /\b(workout|training|exercise|gym|lifting|cardio)\b/,
    /\b(pace|steps?|miles?|kilometres?|km|5k|8k|10k)\b/,
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
  MONEY: [
    /\b(money|finances?|budget|debt|savings?|bills?|rent|mortgage)\b/,
    /\b(afford|expensive|broke|salary|income|spending|overdraft|loan)\b/,
    /\b(financial|bank|credit card|paycheck|cost of living)\b/,
  ],
  HEALTH: [
    /\b(doctor|hospital|diagnosis|symptoms?|medication|treatment)\b/,
    /\b(illness|sick|pain|chronic|anxiety|mental health|therapy)\b/,
    /\b(scan|test results?|appointment|specialist|blood)\b/,
    /\b(body|health|medical|condition|disorder|burnout)\b/,
  ],
  GRIEF: [
    /\b(grief|grieving|loss|lost|died|death|passed away|funeral)\b/,
    /\b(miss|missing|gone|no longer|remember|memories)\b/,
    /\b(mourning|bereavement|anniversary|memorial)\b/,
  ],
  PARENTING: [
    /\b(kid|kids|child|children|son|daughter|baby|toddler|teen)\b/,
    /\b(parenting|parent|motherhood|fatherhood|school|homework)\b/,
    /\b(bedtime|tantrums?|behaviour|discipline|daycare)\b/,
  ],
  CREATIVE: [
    /\b(writing|drawing|painting|music|art|design|creative|creativity)\b/,
    /\b(project|portfolio|novel|song|screenplay|poem|blog)\b/,
    /\b(block|stuck|inspired|creating|making|building|coding)\b/,
  ],
  IDENTITY: [
    /\b(who I am|who am I|identity|purpose|meaning|direction)\b/,
    /\b(belong|belonging|lost|found|authentic|real self|mask)\b/,
    /\b(values?|belief|change|transition|quarter.?life|mid.?life)\b/,
    /\b(perform|performing|pretend|version of myself|showing up)\b/,
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
    /\b(ran|run|running|workout|gym|cardio|lifting|training|exercise)\b/,
    /\b(pace|km|miles|5k|10k|8k|reps|sets|pb|personal best)\b/,
  ],
  MONEY: [
    /\b(shame|embarrass|stress|panic|spiral|overwhelm|hopeless|stuck)\b/,
    /\b(can't afford|no money|broke|debt|behind|late|overdue)\b/,
  ],
  HEALTH: [
    /\b(scared|terrified|anxious|worried|uncertain|diagnosis|results)\b/,
    /\b(chronic|daily|constant|can't|unable|struggling|managing)\b/,
  ],
  GRIEF: [
    /\b(cried|crying|tears|heartbreak|ache|miss|longing|hollow|empty)\b/,
    /\b(anniversary|remembered|thought of|dreamed|photo|voice)\b/,
  ],
  PARENTING: [
    /\b(guilt|failing|bad parent|overwhelmed|exhausted|snapped|yelled)\b/,
    /\b(worried|scared|proud|frustrated|helpless|lost)\b/,
  ],
  CREATIVE: [
    /\b(blocked|stuck|nothing|empty|can't|pointless|worthless|comparison)\b/,
    /\b(inspiration|flow|finally|breakthrough|proud|finished)\b/,
  ],
  IDENTITY: [
    /\b(lost|confused|don't know|unsure|searching|hollow|empty)\b/,
    /\b(changed|changing|different|anymore|used to|used to be)\b/,
  ],
};

function scoreDomain(text: string): Record<Domain, number> {
  const s = text.toLowerCase();
  const scores: Record<Domain, number> = {
    FITNESS: 0, WORK: 0, RELATIONSHIP: 0, MONEY: 0,
    HEALTH: 0, GRIEF: 0, PARENTING: 0, CREATIVE: 0, IDENTITY: 0, GENERAL: 0,
  };
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

// ─── Domain Defaults ──────────────────────────────────────────────────────────

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
    corepattern: "You're learning to read the difference between pushing toward something and pushing away from discomfort.",
    themes: ["consistency", "recovery", "self-respect", "motivation"],
    emotions: ["uncertainty", "determination", "tiredness"],
    nextStepFree: "Option A: Choose one recovery action today (sleep, hydration, easy walk) and treat it as training. Option B: Define tomorrow's effort as \"easy\" or \"hard\" before you start.",
    nextStepPremium: "Option A: Choose one recovery action today (sleep, hydration, easy walk) and treat it as training. Option B: Define tomorrow's effort as \"easy\" or \"hard\" before you start. Script line: \"I'm building consistency, and recovery is part of the plan.\"",
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
    mustHave: /\b(ran|run|running|workout|training|exercise|recovery|rest|hydration|pace|cardio|\d+\s*km|\d+\s*k)\b/,
    driftKeywords: /\b(colleague|coworker|manager|meeting|office|partner|wife|husband|girlfriend|boyfriend)\b/,
  },

  WORK: {
    summary:
      "What you're carrying: Something from work is still with you.\nWhat's really happening: The way it landed says something about what you need to feel respected.",
    shortSummary:
      "What you're carrying: Something from work is sitting with you — quietly, but persistently.\nWhat's really happening: Even a few words can hold a lot of weight when they touch your sense of worth.",
    corepattern: "You're navigating a tension between your professional self-worth and what's being reflected back to you.",
    themes: ["recognition", "boundaries", "self-worth"],
    emotions: ["frustration", "hurt", "determination"],
    nextStepFree: "Option A: Write down the one thing you wish had gone differently. Option B: Name what you'd want to say if there were no consequences.",
    nextStepPremium: "Option A: Write down the one thing you wish had gone differently. Option B: Name what you'd want to say if there were no consequences. Script line: \"I need to be clear about what I need here.\"",
    shortNextStep: "Option A: Finish this sentence — \"What I actually needed in that moment was...\". Option B: Write down one thing you want to be different next time.",
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
      "What you're carrying: A gap between you and someone who matters opened up today.\nWhat's really happening: The distance you felt — and what you didn't say — is still there.",
    shortSummary:
      "What you're carrying: A quiet ache around a connection that matters to you.\nWhat's really happening: Something small happened — or didn't happen — and it landed harder than it looked.",
    corepattern: "You're trying to protect your self-respect while staying connected to someone who matters.",
    themes: ["connection", "visibility", "self-worth"],
    emotions: ["hurt", "longing", "confusion"],
    nextStepFree: "Option A: Name the feeling in one sentence without assigning blame. Option B: Ask yourself what you most needed in that moment.",
    nextStepPremium: "Option A: Name the feeling in one sentence without assigning blame. Option B: Ask yourself what you most needed in that moment. Script line: \"I want to understand this before I respond.\"",
    shortNextStep: "Option A: Finish this sentence — \"What I actually needed was...\". Option B: Notice whether you want to say something, or just to be seen.",
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

  MONEY: {
    summary:
      "What you're carrying: There's a financial weight sitting on you right now.\nWhat's really happening: Money stress is rarely just about money — it touches your sense of safety and control.",
    shortSummary:
      "What you're carrying: Something about money is pressing on you today.\nWhat's really happening: The number isn't just a number — it's connected to how secure you feel.",
    corepattern: "You're managing the gap between what you have, what you need, and what you think that says about you.",
    themes: ["security", "control", "shame", "planning"],
    emotions: ["anxiety", "shame", "overwhelm"],
    nextStepFree: "Option A: Write down the one financial fact that feels most urgent right now — just the fact, not the spiral. Option B: Name one thing in this situation you actually do have control over.",
    nextStepPremium: "Option A: Write down the one financial fact that feels most urgent right now — just the fact, not the spiral. Option B: Name one thing in this situation you actually do have control over. Script line: \"I'm dealing with one thing at a time — this is today's thing.\"",
    shortNextStep: "Option A: Name the feeling underneath the money stress — is it fear, shame, or something else? Option B: Write one sentence about what 'enough' would look like for you.",
    questions: [
      "What's the specific fear underneath this — running out, falling behind, or being judged?",
      "What's one small thing you could do today that would move toward, not away from, the problem?",
      "When did money last feel manageable — what was different then?",
      "Next time, write down the exact thought that triggered the spiral and what followed.",
    ],
    shortQuestions: [
      "Is this about a specific number, or the feeling behind it?",
      "What would feel like enough safety right now — not solved, just safer?",
      "What would you tell someone you care about who was in this exact situation?",
      "Next time, note whether the feeling is about the present, the past, or the future.",
    ],
    mustHave: /\b(money|financial|budget|debt|savings|bills|rent|mortgage|afford|broke|salary|income|spending)\b/,
    driftKeywords: /\b(colleague|manager|partner|wife|husband|workout|gym)\b/,
  },

  HEALTH: {
    summary:
      "What you're carrying: Your body or mind is asking for your attention right now.\nWhat's really happening: Health uncertainty has a way of pulling everything else into its orbit.",
    shortSummary:
      "What you're carrying: Something about your health is sitting with you today.\nWhat's really happening: Your body is asking to be heard — and you're listening.",
    corepattern: "You're navigating the space between what you know and what you can't control about your own wellbeing.",
    themes: ["uncertainty", "body awareness", "self-care", "control"],
    emotions: ["anxiety", "fear", "frustration"],
    nextStepFree: "Option A: Write down what you actually know right now — separate from what you're afraid of. Option B: Name one thing your body needs today that isn't about fixing anything.",
    nextStepPremium: "Option A: Write down what you actually know right now — separate from what you're afraid of. Option B: Name one thing your body needs today that isn't about fixing anything. Script line: \"I can hold what I don't know yet — I don't have to resolve it today.\"",
    shortNextStep: "Option A: Notice where in your body you feel this worry. Name it without judging it. Option B: Write one sentence about what you wish someone understood about how this feels.",
    questions: [
      "What's the specific fear — the diagnosis, the uncertainty, or losing control of your life?",
      "Is there anything your body is telling you right now that you've been pushing past?",
      "Who in your life knows how this has been affecting you — and who doesn't?",
      "Next time, write down what changed since you last felt okay in your body.",
    ],
    shortQuestions: [
      "What does your body feel like right now — not what you think about it, just what's actually there?",
      "Is there one small thing your body is asking for today?",
      "What would it feel like to be gentle with yourself about this?",
      "Next time, note what triggered the worry and what helped it settle.",
    ],
    mustHave: /\b(doctor|hospital|diagnosis|symptoms|medication|illness|sick|pain|health|medical|body|anxiety|therapy|mental)\b/,
    driftKeywords: /\b(colleague|manager|partner|workout|gym|running|money|budget)\b/,
  },

  GRIEF: {
    summary:
      "What you're carrying: You're in grief — and it doesn't follow a straight line.\nWhat's really happening: Missing someone or something doesn't diminish over time the way people say. It just changes shape.",
    shortSummary:
      "What you're carrying: Something about loss is with you today.\nWhat's really happening: Grief has its own timing — and today it surfaced.",
    corepattern: "You're learning to carry something that doesn't go away — and finding out what that means for who you are now.",
    themes: ["loss", "memory", "identity", "time"],
    emotions: ["grief", "longing", "sadness"],
    nextStepFree: "Option A: Write one thing you want to remember about what you lost — something specific, small, and true. Option B: Let yourself feel what came up without trying to move past it today.",
    nextStepPremium: "Option A: Write one thing you want to remember about what you lost — something specific, small, and true. Option B: Let yourself feel what came up without trying to move past it today. Script line: \"I'm allowed to miss this — and I'm allowed to still be here.\"",
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
    mustHave: /\b(grief|loss|lost|died|death|passed|miss|missing|gone|mourning|remember)\b/,
    driftKeywords: /\b(colleague|manager|workout|gym|money|budget)\b/,
  },

  PARENTING: {
    summary:
      "What you're carrying: Something about parenting is sitting heavily right now.\nWhat's really happening: The hardest part of parenting is caring this much — and not always knowing if it's enough.",
    shortSummary:
      "What you're carrying: Something about your child or your role as a parent is pressing on you.\nWhat's really happening: The fact that it matters to you this much is already part of the answer.",
    corepattern: "You're holding the gap between the parent you want to be and the human limits you're working within.",
    themes: ["guilt", "self-doubt", "unconditional love", "exhaustion"],
    emotions: ["guilt", "love", "overwhelm"],
    nextStepFree: "Option A: Write down one moment today where you showed up for your child — even imperfectly. Option B: Name what you actually need right now to be a more present parent.",
    nextStepPremium: "Option A: Write down one moment today where you showed up for your child — even imperfectly. Option B: Name what you actually need right now to be a more present parent. Script line: \"I'm doing this the best I can — and my best is enough for today.\"",
    shortNextStep: "Option A: Sit with the feeling before deciding what it means about you as a parent. Option B: Write one sentence about what your child actually needs from you — not what you think you failed to give.",
    questions: [
      "What's the story you're telling yourself about what this moment means for your child?",
      "What would you tell a close friend who described this exact situation?",
      "What do you actually need right now — not as a parent, but as a person?",
      "Next time, write what happened right before you reached your limit and what would have helped.",
    ],
    shortQuestions: [
      "Is this about what actually happened, or what you're afraid it means?",
      "What's one thing your child knows about being loved by you?",
      "What would 'good enough' look like today — not perfect, just enough?",
      "Next time, note the moment before the guilt arrived — what was happening?",
    ],
    mustHave: /\b(kid|kids|child|children|son|daughter|baby|toddler|teen|parent|parenting|motherhood|fatherhood)\b/,
    driftKeywords: /\b(colleague|manager|workout|gym|money|partner|husband|wife)\b/,
  },

  CREATIVE: {
    summary:
      "What you're carrying: Something about your creative work is stuck or uncertain right now.\nWhat's really happening: Creative blocks are rarely about lack of ideas — usually they're about fear of what the work will say.",
    shortSummary:
      "What you're carrying: Your creative energy is somewhere complicated right now.\nWhat's really happening: The resistance is information — it's worth listening to before pushing through.",
    corepattern: "You're navigating the gap between who you are and what you make — and the fear that one reflects on the other.",
    themes: ["creative block", "self-doubt", "identity", "process"],
    emotions: ["frustration", "self-doubt", "longing"],
    nextStepFree: "Option A: Make something small and deliberately imperfect today — not for anyone, just to move. Option B: Write down what you're actually afraid will happen if you make the work and it's seen.",
    nextStepPremium: "Option A: Make something small and deliberately imperfect today — not for anyone, just to move. Option B: Write down what you're actually afraid will happen if you make the work and it's seen. Script line: \"The work doesn't have to be good yet — it just has to exist.\"",
    shortNextStep: "Option A: Do five minutes of the creative work without judging it. Option B: Write about the last time making something felt easy — what was different?",
    questions: [
      "What are you actually afraid the work will reveal about you?",
      "When did this feel fun rather than loaded — what was different about that time?",
      "Is this block about the work itself, or about who might see it?",
      "Next time, write down the first thought you had when you sat down to create — what was it?",
    ],
    shortQuestions: [
      "What does 'being creative' feel like in your body right now — tight, flat, heavy?",
      "Is there a version of this project that feels manageable — smaller, lower stakes?",
      "What would you make if nobody would ever see it?",
      "Next time, note whether the block arrived before or after you started.",
    ],
    mustHave: /\b(writing|drawing|painting|music|art|design|creative|project|novel|song|poem|blog|creative block|creating|making)\b/,
    driftKeywords: /\b(colleague|manager|partner|gym|money|doctor)\b/,
  },

  IDENTITY: {
    summary:
      "What you're carrying: A question about who you are or who you're becoming is sitting with you.\nWhat's really happening: Identity questions are uncomfortable because they matter — and because they don't resolve quickly.",
    shortSummary:
      "What you're carrying: Something about who you are or what you want is feeling unclear.\nWhat's really happening: The fact that you're asking is already a shift.",
    corepattern: "You're in a transition between who you were and who you're becoming — and sitting in that gap is the hardest part.",
    themes: ["identity", "authenticity", "purpose", "change"],
    emotions: ["confusion", "longing", "uncertainty"],
    nextStepFree: "Option A: Write down three things that have always been true about you — not achievements, but qualities. Option B: Name the version of yourself you're trying to move away from.",
    nextStepPremium: "Option A: Write down three things that have always been true about you — not achievements, but qualities. Option B: Name the version of yourself you're trying to move away from. Script line: \"I don't have to know who I'm becoming yet — I just have to keep moving toward what's true.\"",
    shortNextStep: "Option A: Write one sentence about what feels most 'you' right now — even if it's small. Option B: Notice whether this question feels like a crisis or a becoming.",
    questions: [
      "When did you last feel like yourself — what were you doing?",
      "What are you performing for other people that you're tired of maintaining?",
      "What would you do differently if you stopped worrying about how it looks?",
      "Next time, write about a specific moment when you felt most like yourself — what was happening?",
    ],
    shortQuestions: [
      "Is there one word that feels true about who you are right now — even uncomfortably?",
      "What have you been giving up to fit the version of yourself others expect?",
      "What would it feel like to not know the answer to this — and be okay with that?",
      "Next time, write about what you want — not what you think you should want.",
    ],
    mustHave: /\b(identity|who I am|purpose|authentic|real self|mask|performing|version of myself|belong|lost|direction|meaning|transition)\b/i,
    driftKeywords: /\b(colleague|manager|gym|workout|money|doctor)\b/,
  },

  GENERAL: {
    summary:
      "What you're carrying: Something you haven't fully named yet — but it's real enough to write down.\nWhat's really happening: The fact that you put it into words means part of you is already trying to understand it.",
    shortSummary:
      "What you're carrying: Something quiet — not loud enough to name yet, but present enough to notice.\nWhat's really happening: You showed up to write, even without words. That's the start of something.",
    corepattern: "You're in the middle of something — not at the beginning, not at the end, just present with it.",
    themes: ["self-awareness", "processing", "presence"],
    emotions: ["uncertainty", "restlessness", "quiet courage"],
    nextStepFree: "Option A: Write one more sentence — what's the feeling underneath the first one? Option B: Ask yourself: is this about something that happened, something expected, or something missing?",
    nextStepPremium: "Option A: Write one more sentence — what's the feeling underneath the first one? Option B: Ask yourself: is this about something that happened, something expected, or something missing? Script line: \"I don't need to have the answer — I just need to stay with the question.\"",
    shortNextStep: "Option A: Sit with it for 60 seconds and notice if a word arrives. Option B: Write one more line — it doesn't have to make sense.",
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

// ─── Banned Summary Openers ───────────────────────────────────────────────────

const BANNED_SUMMARY_OPENERS = [
  // WORK
  "a workplace moment that left a mark",
  "something from work got under your skin",
  "something happened at work",
  "something from work is still with you",
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
  // MONEY
  "there's a financial weight",
  "something about money is pressing",
  // HEALTH
  "your body or mind is asking",
  "something about your health",
  // GRIEF
  "you're in grief",
  "something about loss is with you",
  // PARENTING
  "something about parenting is sitting",
  "something about your child",
  // CREATIVE
  "something about your creative work",
  "your creative energy is somewhere",
  // IDENTITY
  "a question about who you are",
  "something about who you are",
  // Cross-domain
  "something happened today that",
  "today was one of those days",
  "a moment felt important",
  "something left a mark",
  "something worth sitting with",
];

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

  // 1. Quoted phrases — highest signal
  for (const m of t.matchAll(/["""]([^"""]{4,90})["""]/g)) {
    add(`"${m[1]}"`);
    if (anchors.length >= 3) break;
  }

  // 2. Join soft line breaks, then split only on sentence-ending punctuation
  const lines = t.split("\n").map(l => l.trim()).filter(Boolean);
  const joined = lines.join(" ");
  const sentences = joined.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);

  // Emotionally vivid sentences first
  const emotionalSignals = /\b(but|just|still|keep|always|never|again|somehow|quiet|ache|miss|wish|pretend|perform|smile|nod|sat|floor|nothing|empty|disappear|invisible|mask|mirror|watching|gap|distance|wanted|needed|tired|exhausted|fine|okay|somewhere|underneath|scared|afraid|worried|hopeless|stuck|alone|lost|failed|wrong)\b/i;

  for (const s of sentences) {
    if (anchors.length >= 4) break;
    if (emotionalSignals.test(s) && s.length <= 150) add(s);
  }

  // 3. Fill with opening sentences if still short
  if (anchors.length < 2) {
    for (const s of sentences.slice(0, 4)) {
      if (s.length <= 150) add(s);
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
    if (!hasAnchor) reasons.push("Missing verbatim anchor from entry");

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

// ─── Carrying Line Repair (post-processor) ────────────────────────────────────
// If the model's "What you're carrying:" is generic/banned,
// replace it deterministically from the entry's own anchor phrases.

function toSecondPerson(s: string): string {
  return s
    .replace(/^I've\b/, "You've")
    .replace(/^I'm\b/, "You're")
    .replace(/^I'd\b/, "You'd")
    .replace(/^I'll\b/, "You'll")
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
    .replace(/\bmy\b/g, "your")
    .replace(/\bmine\b/g, "yours")
    .replace(/\bmyself\b/g, "yourself")
    .replace(/\b(drain|thank|ask|hear|see|notice|help|stop|push|pull|hurt|love|need|want|ignore|dismiss|leave|forget|tell|show|remind|support)\s+me\b/gi, "$1 you")
    .replace(/\bme\b(?=\s*[,.\-—])/g, "you")
    .replace(/\bme\s*$/g, "you");
}

function repairCarryingLine(summary: string, anchors: string[], domain: Domain): string {
  if (!summary.includes("What you're carrying:")) return summary;

  const carryingMatch = summary.match(/What you're carrying:\s*([^\n]+)/);
  if (!carryingMatch) return summary;
  const carryingValue = carryingMatch[1].trim().toLowerCase();

  const isBanned = BANNED_SUMMARY_OPENERS.some(b => carryingValue.includes(b));
  if (!isBanned) return summary;

  const anchor = anchors[0] || anchors[1] || "";
  const cleanAnchor = anchor.replace(/^[""]|[""]$/g, "").trim();

  // Domain-specific fallback wrappers (used when anchor isn't a standalone sentence)
  const domainCarrying: Record<Domain, string> = {
    WORK:         `You ${cleanAnchor.toLowerCase().startsWith("you ") ? cleanAnchor.slice(3) : cleanAnchor} — and the silence afterward is still with you.`,
    RELATIONSHIP: `You ${cleanAnchor.toLowerCase().startsWith("you ") ? cleanAnchor.slice(3) : cleanAnchor} — and what you didn't say is still there.`,
    FITNESS:      `You ${cleanAnchor.toLowerCase().startsWith("you ") ? cleanAnchor.slice(3) : cleanAnchor} — and part of you is still sitting with what that means.`,
    MONEY:        `You ${cleanAnchor.toLowerCase().startsWith("you ") ? cleanAnchor.slice(3) : cleanAnchor} — and the weight of that isn't just numbers.`,
    HEALTH:       `You ${cleanAnchor.toLowerCase().startsWith("you ") ? cleanAnchor.slice(3) : cleanAnchor} — and your body is asking to be heard.`,
    GRIEF:        `You ${cleanAnchor.toLowerCase().startsWith("you ") ? cleanAnchor.slice(3) : cleanAnchor} — and that absence is still very present.`,
    PARENTING:    `You ${cleanAnchor.toLowerCase().startsWith("you ") ? cleanAnchor.slice(3) : cleanAnchor} — and what that brought up is still with you.`,
    CREATIVE:     `You ${cleanAnchor.toLowerCase().startsWith("you ") ? cleanAnchor.slice(3) : cleanAnchor} — and the creative block is telling you something.`,
    IDENTITY:     `You ${cleanAnchor.toLowerCase().startsWith("you ") ? cleanAnchor.slice(3) : cleanAnchor} — and the question underneath that is still open.`,
    GENERAL:      `You ${cleanAnchor.toLowerCase().startsWith("you ") ? cleanAnchor.slice(3) : cleanAnchor} — and that's what's underneath everything else right now.`,
  };

  let newCarrying: string;
  const isSentence = cleanAnchor.length > 20 &&
    /^(I |You |Skipped|Ran|Wrote|Said|Did|Felt|Kept|Came|Slept|Noticed|Nobody|We |The |There |It |Today|This )/i.test(cleanAnchor);

  if (isSentence) {
    const converted = toSecondPerson(cleanAnchor);
    newCarrying = converted.charAt(0).toUpperCase() + converted.slice(1);
  } else {
    newCarrying = domainCarrying[domain];
  }

  return summary.replace(
    /What you're carrying:\s*[^\n]+/,
    `What you're carrying: ${newCarrying}`
  );
}

// ─── Normalization ────────────────────────────────────────────────────────────

function normalizeReflection(
  r: any,
  domain: Domain,
  short: boolean,
  anchors: string[] = []
): Reflection {
  const defaults = DOMAIN_DEFAULTS[domain];
  const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const cleanArr = (v: unknown, max: number): string[] =>
    Array.isArray(v) ? v.map(x => String(x ?? "").trim()).filter(Boolean).slice(0, max) : [];

  const questions = ensureFourQuestions(cleanArr(r?.questions, 6), domain, short);
  const rawSummary = clean(r?.summary) || (short ? defaults.shortSummary : defaults.summary);
  const summary = short ? rawSummary : repairCarryingLine(rawSummary, anchors, domain);

  return {
    summary,
    corepattern: clean(r?.corepattern) || defaults.corepattern,
    themes: cleanArr(r?.themes, 6).length ? cleanArr(r.themes, 6) : defaults.themes,
    emotions: cleanArr(r?.emotions, 6).length ? cleanArr(r.emotions, 6) : defaults.emotions,
    gentlenextstep: clean(r?.gentlenextstep) || (short ? defaults.shortNextStep : defaults.nextStepFree),
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
    ? `1) "What you're carrying:" — the person's specific emotional situation right now\n  2) "What's really happening:" — the deeper dynamic, named using THEIR words\n  3) "Deeper direction:" — one forward-facing observation grounded in THIS entry`
    : `1) "What you're carrying:" — the person's specific emotional situation right now\n  2) "What's really happening:" — the deeper dynamic, named using THEIR words`;

  const nextStepStructure = isPremium && !short
    ? `"Option A:" (practical, doable today) and "Option B:" (reflective alternative) and "Script line:" (1-2 calm sentences the person could actually say or write)`
    : `"Option A:" (practical, doable today) and "Option B:" (reflective alternative)`;

  const domainGuidance: Record<Domain, string> = {
    WORK: `DOMAIN: WORK
"What you're carrying:" — open with the specific thing that happened: the task, the person, the moment, the silence.
FORMULA: "You [specific action from entry] — and [what the person felt/did in response]."
HARD RULE: Must contain at least one concrete detail from this entry (a person, action, or response).
Do NOT use: "Something from work", "A workplace moment", or any generic opener.`,

    RELATIONSHIP: `DOMAIN: RELATIONSHIP
"What you're carrying:" — name who is involved and what specifically happened or didn't happen.
FORMULA: "You and [who] [what happened] — and [what was left unsaid or unfelt]."
HARD RULE: If person used a vivid phrase — use it. "Wanted not needed", "miles apart" — these belong in your response.
Do NOT use: "Something in this connection", "A gap between you and someone".`,

    FITNESS: `DOMAIN: FITNESS
"What you're carrying:" — name exactly what happened with the body or routine.
FORMULA: "You [specific action: skipped/ran/completed X] — and [specific emotional response]."
EMOTION RULE: Skipped → guilt/avoidance/exhaustion. NEVER pride. Completed but empty → emptiness/flatness.
BANNED: "Pride mixed with fatigue", "Something happened in training today".`,

    MONEY: `DOMAIN: MONEY / FINANCIAL STRESS
"What you're carrying:" — name the specific financial situation or fear from this entry.
FORMULA: "You [specific situation: can't pay X / received Y / looked at Z] — and [what that triggered]."
HARD RULE: Financial stress always touches safety and shame — name which one is louder in this entry.
Do NOT use: "There's a financial weight", "Something about money".`,

    HEALTH: `DOMAIN: HEALTH / BODY / MENTAL HEALTH
"What you're carrying:" — name the specific health concern, symptom, or fear from this entry.
FORMULA: "You [specific situation: received X / noticed Y / have been managing Z] — and [what that's actually like to live with]."
HARD RULE: Distinguish between physical illness, mental health, and health anxiety — the tone differs for each.
Do NOT use: "Your body or mind is asking", "Something about your health".`,

    GRIEF: `DOMAIN: GRIEF / LOSS
"What you're carrying:" — name what was lost and what today specifically surfaced.
FORMULA: "You [what triggered the grief today] — and [the specific way missing them/it feels right now]."
HARD RULE: Be specific. "You miss them" is too generic. "You heard a song that sounded like them" is not.
Grief is not linear — do not suggest moving on. Do not frame it as something to solve.`,

    PARENTING: `DOMAIN: PARENTING
"What you're carrying:" — name the specific parenting moment or fear from this entry.
FORMULA: "You [specific moment: snapped/worried/watched X] — and [what that made you feel about yourself as a parent]."
HARD RULE: Always separate the action from the character — a hard parenting moment does not make someone a bad parent.
Do NOT use: "Something about parenting", "Something about your child".`,

    CREATIVE: `DOMAIN: CREATIVE WORK / CREATIVE BLOCK
"What you're carrying:" — name the specific creative struggle or project from this entry.
FORMULA: "You [specific creative situation: can't start X / finished Y but / been avoiding Z] — and [what that's making you think about yourself]."
HARD RULE: Creative blocks are usually about fear of judgment or identity — name the fear, not just the block.
Do NOT use: "Something about your creative work", "Your creative energy".`,

    IDENTITY: `DOMAIN: IDENTITY / SELF / TRANSITION
"What you're carrying:" — name the specific identity question or shift the person is navigating.
FORMULA: "You [specific realisation or question from entry] — and [what that uncertainty feels like to sit with]."
HARD RULE: Use the person's exact words for who they feel they are or aren't. "Performing", "version of myself", "lost" — use their language.
Do NOT use: "A question about who you are", "Something about who you are".`,

    GENERAL: `DOMAIN: GENERAL (topic doesn't fit other domains)
"What you're carrying:" — open with the person's most specific or vivid phrase from the entry.
FORMULA: "You [specific thing they described doing/feeling/noticing] — and [the emotional truth underneath it]."
HARD RULE: The most unusual phrase the person used MUST appear verbatim in your summary or corepattern.
BANNED: "Something is sitting with you", "Something you haven't fully named", "Something important is asking".`,
  };

  const shortGuidance = short
    ? `\nSHORT ENTRY: Under 12 words. Be warm and curious — not analytical. Brief and open. Questions invite more, don't demand.`
    : "";

  return `You are Havenly — a private journaling companion that reflects back what people write with warmth, clarity, and precision.

YOUR ONLY JOB: Make the person feel genuinely seen — not processed through a template.
Test: when they read this, they should think "yes, that's exactly what I meant" — not "this could be for anyone."

CORE RULES:
- Write to "you" — never "the user" or "this person"
- "What you're carrying:" must open with the specific situation from this entry
- "What's really happening:" must echo the person's own words
- Every Option A and Option B must be specific to THIS entry
- Never invent events not in the entry

ANTI-TEMPLATE RULE: Before writing "What you're carrying:", ask: could this opener apply to 5 different entries in this domain? If yes — it's a template. Start over with what's actually in this entry.

BANNED openers (forbidden in any form):
- "A workplace moment that left a mark" / "Something from work"
- "Something in this connection" / "Something in this relationship"
- "Something is sitting with you" / "Something you haven't fully named"
- "Something happened in training" / "Pride mixed with fatigue"
- "There's a financial weight" / "Your body or mind is asking"
- "A question about who you are" / "Something about [any domain]"
- ANY "What you're carrying:" that contains zero words from the actual entry

${domainGuidance[domain]}
${shortGuidance}

TONE: Grounded, calm, perceptive. Like a trusted friend who notices things. Not clinical, not preachy, not flattering.

REQUIRED OUTPUT STRUCTURE:
summary — in this exact labeled order:
${summaryStructure}

corepattern — ONE sentence. The underlying dynamic. Specific to this entry. Not a category label.

gentlenextstep:
${nextStepStructure}
Both options must be concrete and doable today. Different from each other. Different from the questions.

questions — exactly 4. The LAST must start with exactly: "Next time,"
All 4 must be specific enough that a different entry would produce different questions.

OUTPUT: Return ONLY valid JSON with double-quoted strings. No markdown, no preamble.
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
  apiKey: string; model: string; system: string;
  user: string; maxTokens: number; temperature: number;
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

  const domain = detectDomain(`${input.title || ""}\n${entryBody}`);
  const short = isShortEntry(entryBody);
  const anchors = extractAnchors(entryBody);

  const anchorsBlock = anchors.map((a, i) => `ANCHOR ${i + 1}: ${a}`).join("\n");

  const recentThemes = (input.recentThemes || [])
    .map(s => String(s).trim()).filter(Boolean).slice(0, 5);

  const memoryBlock = recentThemes.length
    ? `RECENT PATTERN CONTEXT (use only if genuinely relevant):\n${recentThemes.map((t, i) => `${i + 1}) ${t}`).join("\n")}\n\n`
    : "";

  const userPrompt = `${memoryBlock}THE PERSON'S EXACT WORDS — use at least one verbatim in your summary:
${anchorsBlock}

REMINDER: "What you're carrying:" must open with a concrete detail from this entry.
Bad: "What you're carrying: Something from work got under your skin."
Good: "What you're carrying: You finished the whole report alone, nobody asked you to, and nobody thanked you either."

${entryText}`.trim();

  const maxTokens = input.plan === "PREMIUM" ? 1100 : 750;
  const systemPrompt = buildSystemPrompt(input.plan, domain, short);

  const ATTEMPTS = [
    { temperature: input.plan === "PREMIUM" ? 0.55 : 0.45, note: undefined as string | undefined },
    {
      temperature: 0.3,
      note: `RETRY — "What you're carrying:" was rejected as generic. Open with what SPECIFICALLY happened in this entry. Use at least one ANCHOR phrase verbatim. Domain: ${domain}. Return ONLY valid JSON.`,
    },
    {
      temperature: 0.2,
      note: `FINAL ATTEMPT — "What you're carrying:" has failed twice for being generic. Start with the most specific thing the person wrote. Domain: ${domain}. The person's exact words are in the ANCHORS above. Return ONLY valid JSON.`,
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
    if (result.pass) return normalizeReflection(parsed, domain, short, anchors);

    if (i === ATTEMPTS.length - 1) {
      console.warn("[Havenly] Quality gate failed after 3 attempts. Domain:", domain, "Reasons:", (result as any).reasons);
      return normalizeReflection(parsed, domain, short, anchors);
    }
  }

  // ─── Last resort: default template with anchor injected ───────────────────
  const defaults = DOMAIN_DEFAULTS[domain];
  const a1 = anchors[0] || "what you wrote";
  const isPremium = input.plan === "PREMIUM";
  const baseSummary = short ? defaults.shortSummary : defaults.summary;
  const continuityLine = recentThemes.length
    ? `This echoes a theme you have touched before: ${recentThemes[0]}.` : "";

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
      gentlenextstep: short ? defaults.shortNextStep : isPremium ? defaults.nextStepPremium : defaults.nextStepFree,
      questions: short ? defaults.shortQuestions : defaults.questions,
    },
    domain, short, anchors
  );
}
