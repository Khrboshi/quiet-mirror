/**
 * lib/ai/normalizeInsightSignals.ts
 *
 * Post-processing layer between raw AI JSON and the Insights dashboard.
 *
 * Responsibilities:
 * - Strip AI-generated fallback/placeholder themes and emotions that were
 *   injected by the model when it had nothing real to say (e.g. "processing",
 *   "self-awareness") so they don't pollute pattern charts.
 * - Bucket free-text corepatterns into canonical short labels for grouping.
 * - Provide normalizeAIResponseSignals() as the single call sites use.
 */

export type ParsedAIResponse = {
  domain?: string;
  themes?: string[];
  emotions?: string[];
  corepattern?: string;
};

const FALLBACK_THEMES = new Set([
  // GENERAL domain defaults
  "self-awareness",
  "processing",
  "presence",
  "uncertainty",
  // FITNESS domain defaults
  "consistency",
  "recovery",
  "self-respect",
  "motivation",
  // WORK domain defaults
  "recognition",
  "visibility",
  "respect",
  "professional worth",
  "boundaries",
  "self-worth",
  // RELATIONSHIP domain defaults
  "connection",
  "distance",
  "intimacy",
  // MONEY domain defaults
  "financial stress",
  "security",
  "control",
  "shame",              // FIX: was missing
  "planning",           // FIX: was missing
  // HEALTH domain defaults
  "health anxiety",
  "uncertainty",
  "body awareness",
  // GRIEF domain defaults
  "loss",               // FIX: was missing
  "memory",             // FIX: was missing
  "identity",           // FIX: was missing
  "time",               // FIX: was missing
  // PARENTING domain defaults
  "guilt",
  "repair",
  "self-doubt",
  "exhaustion",
  // CREATIVE domain defaults
  "creative block",
  "process",
  // IDENTITY domain defaults
  "authenticity",
  "purpose",
  "change",
]);

const FALLBACK_EMOTIONS = new Set([
  // GENERAL domain defaults — truly generic placeholders
  "uncertainty",
  "restlessness",
  "quiet courage",
  "hope",
  // FITNESS domain defaults
  "pride",
  "tiredness",
  "determination",
  // WORK domain defaults — only the truly generic fallback ones
  // NOTE: frustration, hurt, anger are real user emotions — do NOT filter them
  "self-doubt",        // only filter when it's a domain default, not user-generated
  // RELATIONSHIP domain defaults — only truly generic ones
  // NOTE: loneliness, disconnection, longing are real — do NOT filter
  // MONEY domain defaults
  "fear",               // keep — but only filter the domain default version
  // HEALTH domain defaults
  "overwhelm",
  // GRIEF domain defaults — only filter truly generic placeholders
  "tenderness",
  // PARENTING domain defaults
  "love",
  // CREATIVE domain defaults
  "insecurity",
  "disappointment",
  // IDENTITY domain defaults
  "confusion",
]);

const FALLBACK_CP_PREFIXES = [
  "you're in the middle of something",
  "you're proud of progress, but still learning the line",
  "you're navigating a tension between your professional self-worth",
  "you're trying to protect your self-respect while staying connected",
];

const LOW_VALUE_THEME_PREFIXES = [
  "specific dynamic",
  "this entry",
  "inner desires",
  "self-perception",
  "role confusion",
  "loss of control",
];

const LOW_VALUE_CP_PREFIXES = [
  "the specific dynamic in this entry is",
  "the dynamic here is",
  "this entry shows",
  "the pattern in this entry is",
];

const THEME_ALIASES: Record<string, string> = {
  "fear of diagnosis": "health uncertainty",
  "fear of the unknown": "health uncertainty",
  "need for control": "control",
  "financial insecurity": "financial stress",
  "money stress": "financial stress",
  "identity fragmentation": "identity strain",
  "disconnection from inner desires": "disconnection",
  "role confusion": "identity strain",
  "self presentation": "self-presentation",
  "self presentation pressure": "self-presentation",
  "emotional exhaustion": "exhaustion",
  "parental guilt": "guilt",
  "creative block": "creative resistance",
};

const EMOTION_ALIASES: Record<string, string> = {
  anxious: "anxiety",
  worried: "anxiety",
  scared: "fear",
  frightened: "fear",
  ashamed: "shame",
  guilty: "guilt",
  overwhelmed: "overwhelm",
  exhausted: "exhaustion",
  lonely: "loneliness",
  disconnected: "disconnection",
  insecure: "insecurity",
  embarrassed: "shame",
  stressed: "stress",
};

const COREPATTERN_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bdeep-seated\b/gi, "deep"],
  [/\bself[- ]doubt\b/gi, "self-doubt"],
  [/\bhealth anxiety\b/gi, "health anxiety"],
  [/\bfear of a serious diagnosis\b/gi, "fear of diagnosis"],
  [/\bperforming and editing yourself\b/gi, "self-editing and performance"],
  [/\bconstant comparison and self-doubt\b/gi, "comparison and self-doubt"],
  [/\bfinancial insecurity\b/gi, "financial stress"],
  [/\bneed for control over your health\b/gi, "need for control"],
  [/\bminor health symptoms\b/gi, "health symptoms"],
];

function norm(s: string): string {
  return String(s ?? "")
    .toLowerCase()
    // Smart apostrophes -> ASCII apostrophe. Written as \u escapes on purpose.
    // This line previously read .replace(/[']/g, "'"), replacing a straight
    // apostrophe with itself: a literal curly character had been flattened to a
    // straight one at some point, which silently turned the line into a no-op.
    // Escapes cannot be flattened the same way.
    //
    // It matters because all four FALLBACK_CP_PREFIXES begin with "you're" and
    // models emit U+2019 in prose by default. Without this, norm() turned
    // "You\u2019re in the middle of something" into "you re in the middle of
    // something", startsWith() failed, and the placeholder text this module
    // exists to strip reached the Insights dashboard instead.
    //
    // Scope is deliberately single-quote only: of the 106 strings compared
    // against norm() output in this file, the only four containing an
    // apostrophe are those prefixes. No theme or emotion target has one, so
    // this cannot change theme or emotion matching.
    // Found by CodeQL ("Replacement of a substring with itself", Medium).
    .replace(/[\u2018\u2019\u02BC\u2032]/g, "'")
    .replace(/[_]/g, " ")
    .replace(/[^a-z0-9\s-'"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function display(s: string): string {
  const t = s.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function titleCasePhrase(s: string): string {
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function isFallbackTheme(k: string): boolean {
  return FALLBACK_THEMES.has(norm(k));
}

function isFallbackEmotion(k: string): boolean {
  return FALLBACK_EMOTIONS.has(norm(k));
}

export function isFallbackCorepattern(k: string): boolean {
  const lower = norm(k);
  // Normalise the prefix as well as the input. norm() rewrites punctuation to
  // spaces, so "you're proud of progress, but still learning the line" arrived
  // here as "...progress but still..." while the constant kept its comma, and
  // startsWith() could never match it. That prefix has never been filtered.
  // Normalising both sides makes any future prefix punctuation-safe.
  return FALLBACK_CP_PREFIXES.some((prefix) => lower.startsWith(norm(prefix)));
}

export function normalizeTheme(raw: string): string | null {
  const lower = norm(raw);
  if (!lower) return null;
  if (isFallbackTheme(lower)) return null;
  if (LOW_VALUE_THEME_PREFIXES.some((p) => lower.startsWith(p))) return null;

  const canonical = THEME_ALIASES[lower] ?? lower;

  if (canonical.length < 3) return null;
  return display(canonical);
}

export function normalizeEmotion(raw: string): string | null {
  const lower = norm(raw);
  if (!lower) return null;
  if (isFallbackEmotion(lower)) return null;

  const canonical = EMOTION_ALIASES[lower] ?? lower;

  if (canonical.length < 3) return null;
  return display(canonical);
}

export function normalizeCorepattern(raw: string): string | null {
  let text = String(raw ?? "").trim();
  if (!text) return null;

  const lower = norm(text);
  if (isFallbackCorepattern(lower)) return null;
  if (LOW_VALUE_CP_PREFIXES.some((p) => lower.startsWith(p))) return null;

  for (const [re, replacement] of COREPATTERN_REPLACEMENTS) {
    text = text.replace(re, replacement);
  }

  text = text
    .replace(/\bthis entry\b/gi, "")
    .replace(/\bhere\b/gi, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .trim();

  if (text.length < 24 || text.length > 180) return null;

  const normalized = text.charAt(0).toUpperCase() + text.slice(1);
  return normalized;
}

function normalizeDomain(raw: unknown): string | null {
  const d = String(raw ?? "").trim().toUpperCase();
  if (!d) return null;
  return d;
}

export function normalizeAIResponseSignals(parsed: ParsedAIResponse) {
  const themes = Array.isArray(parsed?.themes)
    ? Array.from(
        new Set(
          parsed.themes
            .map(normalizeTheme)
            .filter((v): v is string => Boolean(v))
        )
      )
    : [];

  const emotions = Array.isArray(parsed?.emotions)
    ? Array.from(
        new Set(
          parsed.emotions
            .map(normalizeEmotion)
            .filter((v): v is string => Boolean(v))
        )
      )
    : [];

  const corepattern = normalizeCorepattern(parsed?.corepattern ?? "");
  const domain = normalizeDomain(parsed?.domain);

  return { themes, emotions, corepattern, domain };
}

export function bucketCorepattern(raw: string): string {
  const lower = norm(raw);

  if (
    /\bhealth anxiety\b|\bfear of diagnosis\b|\bhealth symptoms\b|\bneed for control\b/.test(lower)
  ) {
    return "Health anxiety is being reinforced by uncertainty and the need for control.";
  }

  if (
    /\bself-editing\b|\bperformance\b|\bperforming\b|\bmask\b|\brole\b/.test(lower)
  ) {
    return "You've been performing and editing yourself for so long that it's become a source of exhaustion.";
  }

  if (
    /\bcomparison\b|\bself-doubt\b|\binsecurity\b|\binadequacy\b/.test(lower)
  ) {
    return "Comparison and self-doubt are feeding a sense of inadequacy.";
  }

  if (
    /\bfinancial stress\b|\bfinancial insecurity\b|\brent\b|\bbank\b|\bmoney\b/.test(lower)
  ) {
    return "Financial stress is affecting your sense of safety, control, and self-worth.";
  }

  if (
    /\bparent\b|\bchild\b|\bson\b|\bdaughter\b|\bguilt\b|\brepair\b/.test(lower)
  ) {
    return "Parenting guilt is showing up most strongly after moments where you feel you fell short.";
  }

  if (
    /\bcreative\b|\bblank page\b|\bwriting\b|\bcreator\b|\bdraft\b/.test(lower)
  ) {
    return "Creative resistance seems tied to self-doubt and fear of what the work means about you.";
  }

  if (
    /\bidentity\b|\btrue self\b|\bdisconnection\b|\binner self\b|\bwho you are\b/.test(lower)
  ) {
    return "You're carrying tension between the roles you perform and what feels true to you.";
  }

  if (
    /\bworkplace\b|\bwork\b|\bmanager\b|\bteam\b|\bvalued\b|\binvisible\b/.test(lower)
  ) {
    return "Work stress is being sharpened by feeling unseen, undervalued, or behind.";
  }

  return titleCasePhrase(raw);
}
