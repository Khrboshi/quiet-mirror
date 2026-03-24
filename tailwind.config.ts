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
        // ─── Quiet Mirror evidence-based palette ──────────────────────────
        // Periwinkle blue  #7c9fff — trust, calm (54% global brand preference)
        // Soft violet      #9b8fd4 — creativity, introspection, self-exploration
        // Deep navy bg     #0b1120 — safety, privacy, reduced eye strain
        // Sources: Vivid Creative 2025, UXmatters 2024, Gel Press 2025
        //
        // emerald-* → mapped to periwinkle blue so all existing CTAs update
        // violet-*  → mapped to soft violet for insight / reflection copy
        emerald: {
          300: "#b8caff",
          400: "#97b1ff",
          500: "#7c9fff",
          600: "#6186f0",
          700: "#4a6de0",
          800: "#3455c8",
          900: "#2040a8",
          950: "#132580",
        },
        violet: {
          300: "#c4b8f0",
          400: "#b0a0e8",
          500: "#9b8fd4",
          600: "#8070bc",
          700: "#6655a4",
          800: "#4d3e8c",
          900: "#362a74",
        },
        slate: {
          950: "#0b1120",
          900: "#0f1830",
        },
        hvn: {
          bg:       "#0b1120",
          elevated: "#0f1830",
          soft:     "#131e38",
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
