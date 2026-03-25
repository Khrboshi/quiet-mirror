import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Quiet Mirror brand palette — soft, muted, introspective
        mirror: {
          50: "#f5f7ff",
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
          50: "#f8f7fb",
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
      },
      fontFamily: {
        display: ["var(--font-display)", "Fraunces", "Georgia", "serif"],
        body: ["var(--font-body)", "DM Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
