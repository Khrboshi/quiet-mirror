/**
 * Quiet Mirror Design System — Colors
 *
 * CSS variable references (for Tailwind / inline styles):
 *   colors.bg.primary  → "var(--qm-bg)"
 *
 * Resolved hex values (for charts, canvas, SVGs in JS):
 *   resolvedDark.bg.primary → "#0a0d1a"
 *
 * At runtime in the browser you can also use:
 *   getResolvedColor("--qm-accent")  → "#8b9dff"
 */

/* ── CSS variable references (work everywhere in React) ── */
export const colors = {
  bg: {
    primary:  "var(--qm-bg)",
    elevated: "var(--qm-bg-elevated)",
    soft:     "var(--qm-bg-soft)",
    card:     "var(--qm-bg-card)",
  },
  text: {
    primary:   "var(--qm-text-primary)",
    secondary: "var(--qm-text-secondary)",
    muted:     "var(--qm-text-muted)",
    faint:     "var(--qm-text-faint)",
  },
  accent: {
    primary: "var(--qm-accent)",
    hover:   "var(--qm-accent-hover)",
    soft:    "var(--qm-accent-soft)",
    border:  "var(--qm-accent-border)",
  },
  secondary: {
    primary: "var(--qm-accent-2)",
    soft:    "var(--qm-accent-2-soft)",
  },
  border: {
    subtle: "var(--qm-border-subtle)",
    card:   "var(--qm-border-card)",
  },
  shadow: {
    soft: "var(--qm-shadow-soft)",
    card: "var(--qm-shadow-card)",
    lift: "var(--qm-shadow-card-lift)",
  },
} as const;

/* ── Resolved hex values for programmatic use (charts, canvas) ── */
export const resolvedDark = {
  bg:      { primary: "#0a0d1a", elevated: "#0f121f", soft: "#141828", card: "#181c2e" },
  text:    { primary: "#e8ebf5", secondary: "#bcc3db", muted: "#8089a8", faint: "#5a6178" },
  accent:  { primary: "#8b9dff", hover: "#a1b1ff" },
  accent2: { primary: "#9a8dc0" },
} as const;

export const resolvedLight = {
  bg:      { primary: "#faf9f7", elevated: "#ffffff", soft: "#f2f0ed", card: "#fdfcfb" },
  text:    { primary: "#1c1916", secondary: "#4a453f", muted: "#706b63", faint: "#9d968d" },
  accent:  { primary: "#5b6de8", hover: "#4a5bcc" },
  accent2: { primary: "#8676ae" },
} as const;

/* ── Tailwind class mapping for dynamic className assembly ── */
export const colorClasses = {
  bg: {
    primary:  "bg-qm-bg",
    elevated: "bg-qm-elevated",
    soft:     "bg-qm-soft",
    card:     "bg-qm-card",
  },
  text: {
    primary:   "text-qm-primary",
    secondary: "text-qm-secondary",
    muted:     "text-qm-muted",
    faint:     "text-qm-faint",
  },
  accent: {
    primary: "text-qm-accent",
    bg:      "bg-qm-accent",
    bgSoft:  "bg-qm-accent-soft",
    border:  "border-qm-accent",
  },
  border: {
    subtle: "border-qm-subtle",
    card:   "border-qm-card",
  },
} as const;

/**
 * Resolve a CSS custom property to its computed value at runtime.
 * Useful for chart libraries (Chart.js, D3, Recharts) that need hex/rgb strings.
 *
 * @example getResolvedColor("--qm-accent") → "#8b9dff"
 */
export function getResolvedColor(cssVar: string): string {
  if (typeof window === "undefined") {
    // SSR fallback — return dark mode value
    const fallbacks: Record<string, string> = {
      "--qm-bg": "#0a0d1a",
      "--qm-accent": "#8b9dff",
      "--qm-accent-hover": "#a1b1ff",
      "--qm-text-primary": "#e8ebf5",
      "--qm-text-secondary": "#bcc3db",
      "--qm-text-muted": "#8089a8",
    };
    return fallbacks[cssVar] ?? "#8b9dff";
  }
  return getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
}
