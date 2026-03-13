import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Fraunces", "Georgia", "serif"],
        body:    ["var(--font-body)",    "DM Sans",  "system-ui", "sans-serif"],
        sans:    ["var(--font-body)",    "DM Sans",  "system-ui", "sans-serif"],
      },
      colors: {
        // ─── Consolidated Havenly brand palette ───────────────────────────
        // Working accent is emerald-500 (#10b981) used throughout the codebase.
        // hvn-mint (#3ee7b0) is reserved for future brand refresh if needed.
        hvn: {
          mint:       "#3ee7b0",
          "mint-dim": "#2bc99a",
          bg:         "#020617",
          elevated:   "#02091a",
          soft:       "#0b1220",
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.65s ease-out forwards",
        "fade-in":    "fadeIn 0.5s ease-out forwards",
      },
      keyframes: {
        fadeInUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
