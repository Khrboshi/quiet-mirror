import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Matches the prefers-color-scheme approach in globals.css
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        // Quiet Mirror brand palette — soft, muted, introspective
        mirror: {
          50:  "#f5f7ff",
          100: "#ebf0ff",
          200: "#d6e0ff",
          300: "#b8c9ff",
          400: "#8b9dff",
          500: "#7689f5",
          600: "#5b6de8",
          700: "#4a5bcc",
          800: "#3d4da5",
          900: "#354482",
        },
        quiet: {
          50:  "#f8f7fb",
          100: "#f0eef6",
          200: "#e0dded",
          300: "#cbc4e0",
          400: "#b1a5cf",
          500: "#9a8dc0",
          600: "#8676ae",
          700: "#72639a",
          800: "#5f5480",
          900: "#4f4669",
        },
        // CSS-variable-backed colors (auto-switch dark ↔ light)
        qm: {
          bg:            "var(--qm-bg)",
          elevated:      "var(--qm-bg-elevated)",
          soft:          "var(--qm-bg-soft)",
          card:          "var(--qm-bg-card)",
          primary:       "var(--qm-text-primary)",
          secondary:     "var(--qm-text-secondary)",
          muted:         "var(--qm-text-muted)",
          faint:         "var(--qm-text-faint)",
          accent:        "var(--qm-accent)",
          "accent-hover":"var(--qm-accent-hover)",
          "accent-soft": "var(--qm-accent-soft)",
          "accent-border":"var(--qm-accent-border)",
          "accent-2":    "var(--qm-accent-2)",
          "accent-2-soft":"var(--qm-accent-2-soft)",
          "border-subtle":"var(--qm-border-subtle)",
          "border-card": "var(--qm-border-card)",

          // ── Semantic status tokens ─────────────────────────────────────
          // One alias per meaning. Change globals.css → updates everywhere.
          "positive":        "var(--qm-positive)",
          "positive-strong": "var(--qm-positive-strong)",
          "positive-hover":  "var(--qm-positive-hover)",
          "positive-soft":   "var(--qm-positive-soft)",
          "positive-border": "var(--qm-positive-border)",
          "positive-muted":  "var(--qm-positive-muted)",
          "positive-bg":     "var(--qm-positive-bg)",

          "premium":         "var(--qm-premium)",
          "premium-strong":  "var(--qm-premium-strong)",
          "premium-hover":   "var(--qm-premium-hover)",
          "premium-soft":    "var(--qm-premium-soft)",
          "premium-border":  "var(--qm-premium-border)",
          "premium-muted":   "var(--qm-premium-muted)",
          "premium-bg":      "var(--qm-premium-bg)",

          "danger":          "var(--qm-danger)",
          "danger-strong":   "var(--qm-danger-strong)",
          "danger-hover":    "var(--qm-danger-hover)",
          "danger-soft":     "var(--qm-danger-soft)",
          "danger-border":   "var(--qm-danger-border)",
          "danger-muted":    "var(--qm-danger-muted)",
          "danger-bg":       "var(--qm-danger-bg)",

          "warning":         "var(--qm-warning)",
          "warning-strong":  "var(--qm-warning-strong)",
          "warning-hover":   "var(--qm-warning-hover)",
          "warning-soft":    "var(--qm-warning-soft)",
          "warning-border":  "var(--qm-warning-border)",
          "warning-muted":   "var(--qm-warning-muted)",
          "warning-bg":      "var(--qm-warning-bg)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Fraunces", "Georgia", "serif"],
        body:    ["var(--font-body)", "DM Sans", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in":     "fadeIn 0.5s ease-out forwards",
        "fade-in-up":  "fadeInUp 0.65s ease-out forwards",
        "slide-down":  "slideDown 0.2s ease-out",
        dropdown:      "dropdownFadeSlide 0.22s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        dropdownFadeSlide: {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
