// app/lib/colors.ts
// Single source of truth for Quiet Mirror colours in JavaScript contexts.
//
// WHY THIS FILE EXISTS
// --------------------
// globals.css defines --qm-* CSS custom properties that Tailwind and inline
// styles consume directly. Most of the time `var(--qm-accent)` in a className
// or style prop is the right approach and this file is not needed.
//
// This file is for the cases where a raw colour value is required:
//   • Canvas / SVG drawing APIs (Recharts, D3, Chart.js, native canvas)
//   • Colour values passed as props to third-party chart libraries
//   • Anywhere getComputedStyle would otherwise be called manually
//   • Runtime colour math (opacity, mixing, animation)
//
// USAGE
// -----
// 1. Inline style string (preferred for React components):
//      style={{ color: QM.accent }}        // → "var(--qm-accent)"
//
// 2. Resolved hex value for canvas/chart libs (runs in browser only):
//      const hex = getCssColor("--qm-accent")    // → "#8b9dff" (dark mode)
//      const hex = getCssColor("accent")          // same — prefix optional
//
// 3. Data-vis palette (domain → colour):
//      QM.dv.work   // → "var(--qm-dv-work)"
//      getCssColor(QM.dv.work)  // → resolved hex
//
// KEEPING IN SYNC
// ---------------
// When you add or change a CSS variable in globals.css, add the matching
// entry here. The value must be `"var(--qm-YOUR-KEY)"` — nothing else.
// The CSS file remains the one source of actual colour values.

// ── CSS variable reference strings ───────────────────────────────────────────

export const QM = {
  // ── Backgrounds ────────────────────────────────────────────────────────────
  bg:          "var(--qm-bg)",
  bgElevated:  "var(--qm-bg-elevated)",
  bgSoft:      "var(--qm-bg-soft)",
  bgCard:      "var(--qm-bg-card)",
  bgGlass80:   "var(--qm-bg-glass-80)",
  bgGlass95:   "var(--qm-bg-glass-95)",

  // ── Text ───────────────────────────────────────────────────────────────────
  textPrimary:   "var(--qm-text-primary)",
  textSecondary: "var(--qm-text-secondary)",
  textMuted:     "var(--qm-text-muted)",
  textFaint:     "var(--qm-text-faint)",

  // ── Accent (periwinkle blue / royal blue) ──────────────────────────────────
  accent:        "var(--qm-accent)",
  accentHover:   "var(--qm-accent-hover)",
  accentSoft:    "var(--qm-accent-soft)",
  accentBorder:  "var(--qm-accent-border)",

  // ── Accent 2 (soft violet) ─────────────────────────────────────────────────
  accent2:       "var(--qm-accent-2)",
  accent2Soft:   "var(--qm-accent-2-soft)",

  // ── Signal warm (amber / gold) ─────────────────────────────────────────────
  signalWarm:       "var(--qm-signal-warm)",
  signalWarmBg:     "var(--qm-signal-warm-bg)",
  signalWarmBorder: "var(--qm-signal-warm-border)",

  // ── Borders & shadows ──────────────────────────────────────────────────────
  borderSubtle: "var(--qm-border-subtle)",
  borderCard:   "var(--qm-border-card)",
  shadowSoft:   "var(--qm-shadow-soft)",
  shadowCard:   "var(--qm-shadow-card)",
  shadowLift:   "var(--qm-shadow-card-lift)",

  // ── Semantic status — Positive (emerald) ───────────────────────────────────
  positive:       "var(--qm-positive)",
  positiveStrong: "var(--qm-positive-strong)",
  positiveHover:  "var(--qm-positive-hover)",
  positiveSoft:   "var(--qm-positive-soft)",
  positiveBorder: "var(--qm-positive-border)",
  positiveMuted:  "var(--qm-positive-muted)",
  positiveBg:     "var(--qm-positive-bg)",

  // ── Semantic status — Premium (violet) ─────────────────────────────────────
  premium:       "var(--qm-premium)",
  premiumStrong: "var(--qm-premium-strong)",
  premiumHover:  "var(--qm-premium-hover)",
  premiumSoft:   "var(--qm-premium-soft)",
  premiumBorder: "var(--qm-premium-border)",
  premiumMuted:  "var(--qm-premium-muted)",
  premiumBg:     "var(--qm-premium-bg)",

  // ── Semantic status — Danger (red) ─────────────────────────────────────────
  danger:       "var(--qm-danger)",
  dangerStrong: "var(--qm-danger-strong)",
  dangerHover:  "var(--qm-danger-hover)",
  dangerSoft:   "var(--qm-danger-soft)",
  dangerBorder: "var(--qm-danger-border)",
  dangerMuted:  "var(--qm-danger-muted)",
  dangerBg:     "var(--qm-danger-bg)",

  // ── Semantic status — Warning (amber) ──────────────────────────────────────
  warning:       "var(--qm-warning)",
  warningStrong: "var(--qm-warning-strong)",
  warningHover:  "var(--qm-warning-hover)",
  warningSoft:   "var(--qm-warning-soft)",
  warningBorder: "var(--qm-warning-border)",
  warningMuted:  "var(--qm-warning-muted)",
  warningBg:     "var(--qm-warning-bg)",

  // ── Data-visualisation semantic palette ────────────────────────────────────
  // One colour per emotional/life domain — used in charts, tags, and highlights.
  // These are intentionally distinct and do NOT change between light/dark mode.
  dv: {
    positive: "var(--qm-dv-positive)", // calm, hope, gratitude, joy
    work:     "var(--qm-dv-work)",     // work, curiosity, clarity
    love:     "var(--qm-dv-love)",     // love, relationship, connection
    health:   "var(--qm-dv-health)",   // health, anxiety, stress
    grief:    "var(--qm-dv-grief)",    // grief, confusion, doubt
    growth:   "var(--qm-dv-growth)",   // parenting, growth
    creative: "var(--qm-dv-creative)", // creative, shame, guilt
    identity: "var(--qm-dv-identity)", // identity, transformation
    fitness:  "var(--qm-dv-fitness)",  // fitness, energy
    fear:     "var(--qm-dv-fear)",     // fear, anger, panic
  },
} as const;

// ── Domain → colour map ───────────────────────────────────────────────────────
// Matches the domain names used in generateReflection.ts. Use this when you
// have a domain string from the AI response and need its display colour.

export type Domain = keyof typeof DOMAIN_COLOR;

export const DOMAIN_COLOR = {
  GENERAL:      QM.dv.positive,
  WORK:         QM.dv.work,
  RELATIONSHIP: QM.dv.love,
  HEALTH:       QM.dv.health,
  GRIEF:        QM.dv.grief,
  PARENTING:    QM.dv.growth,
  CREATIVE:     QM.dv.creative,
  IDENTITY:     QM.dv.identity,
  FITNESS:      QM.dv.fitness,
  MONEY:        QM.dv.positive,
};

// ── Runtime CSS variable resolver ─────────────────────────────────────────────
// Returns the actual computed colour value (hex or rgba) for a given CSS
// variable. Call this inside chart render callbacks, canvas draw functions,
// or any context that cannot accept "var(--qm-*)" strings.
//
// Safe to call from useEffect or event handlers — never during SSR.
//
// @param variable  CSS variable name, with or without "--qm-" prefix.
//                  Also accepts a full "var(--qm-*)" string.
// @param element   Element to read from (defaults to document.documentElement)
// @returns         The resolved colour string, or the input unchanged if called
//                  outside the browser.
//
// Example:
//   const accentHex = getCssColor("--qm-accent")      // "#8b9dff"
//   const accentHex = getCssColor("accent")            // same
//   const accentHex = getCssColor(QM.accent)           // same

export function getCssColor(variable: string, element?: Element): string {
  if (typeof window === "undefined") return variable;

  // Normalise: strip var(...) wrapper, ensure leading --
  let key = variable.trim();
  if (key.startsWith("var(") && key.endsWith(")")) {
    key = key.slice(4, -1).trim();
  }
  if (!key.startsWith("--")) {
    key = key.startsWith("qm-") ? `--${key}` : `--qm-${key}`;
  }

  const target = element ?? document.documentElement;
  const value = getComputedStyle(target).getPropertyValue(key).trim();
  // Return the original variable reference if the CSS variable is missing
  // so callers receive a safe fallback rather than a silent empty string.
  return value || variable;
}

// ── Convenience: resolve the full DOMAIN_COLOR map to actual hex values ───────
// Useful when initialising a chart library that needs all colours upfront.
//
// Example:
//   const resolved = resolveDomainColors()
//   // { WORK: "#60a5fa", RELATIONSHIP: "#f472b6", ... }

export function resolveDomainColors(element?: Element): Record<string, string> {
  return Object.fromEntries(
    Object.entries(DOMAIN_COLOR).map(([domain, cssVar]) => [
      domain,
      getCssColor(cssVar, element),
    ])
  );
}
