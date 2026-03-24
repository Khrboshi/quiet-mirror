// app/lib/config.ts
// Single source of truth for all site-wide constants.
// To rebrand: update the values below — every title, metadata, email,
// AI persona, and UI string updates automatically in one pass.

export const CONFIG = {
  // ── Brand ────────────────────────────────────────────────────────────────
  /** The product name shown in titles, metadata, and the navbar */
  appName: "Havenly",

  /** Short tagline used in page titles e.g. "Havenly — The Journal That Listens" */
  tagline: "The Journal That Listens",

  /** One-line description used in meta description tags */
  description:
    "Write what's weighing on you. Get a gentle reflection back. Start seeing what keeps returning. Free to start.",

  /** Short OG description (keep under 100 chars) */
  ogDescription:
    "Write what's weighing on you. Get a gentle reflection back. Start seeing what keeps returning.",

  // ── Contact ──────────────────────────────────────────────────────────────
  /** Support email shown to users everywhere in the app */
  supportEmail: "havenly.support@gmail.com",

  // ── Email / Newsletter ───────────────────────────────────────────────────
  /** Newsletter name shown in EmailCapture component and email templates */
  newsletterName: "Havenly Letters",

  /** From address used in all outgoing emails (must match verified Resend domain) */
  emailFromAddress: "Havenly <onboarding@resend.dev>",

  /** Subject line for newsletter confirmation email */
  emailConfirmSubject: "You're in — Havenly Letters",

  // ── AI Persona ───────────────────────────────────────────────────────────
  /** Name the AI uses to identify itself in all system prompts */
  aiPersonaName: "Havenly",

  // ── URLs ─────────────────────────────────────────────────────────────────
  /** Public site URL — falls back to Vercel preview URL */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://havenly-2-1.vercel.app",
} as const;

// Derived helpers — built from the constants above, not hardcoded
export const BRAND = {
  /** Full page title format: "Havenly — The Journal That Listens" */
  fullTitle: `${CONFIG.appName} — ${CONFIG.tagline}`,

  /** Template for sub-pages: "Page Name | Havenly" */
  titleTemplate: `%s | ${CONFIG.appName}`,
} as const;
