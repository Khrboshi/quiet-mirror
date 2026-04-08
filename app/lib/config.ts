// app/lib/config.ts — audited 2026-04-08
// Single source of truth for all site-wide constants.
// To rebrand: update the values below — every title, metadata, email,
// AI persona, and UI string updates automatically in one pass.

export const CONFIG = {
  // ── Brand ────────────────────────────────────────────────────────────────
  /** The product name shown in titles, metadata, and the navbar */
  appName: "Quiet Mirror",

  /** Short tagline used in page titles e.g. "Quiet Mirror — The Journal That Reads Underneath" */
  tagline: "The Journal That Reads Underneath",

  /** One-line description used in meta description tags */
  description:
    "Write what's weighing on you. Get a gentle reflection back. Start seeing the patterns you've been too close to name. Free to start.",

  /** Short OG description (keep under 100 chars) */
  ogDescription:
    "Write honestly. Get a gentle reflection back. See the patterns shaping your life.",

  // ── Contact ──────────────────────────────────────────────────────────────
  /** Support email shown to users everywhere in the app */
  supportEmail: "hello@quietmirror.me",

  // ── Email / Newsletter ───────────────────────────────────────────────────
  /** Newsletter name shown in EmailCapture component and email templates */
  newsletterName: "Quiet Mirror Letters",

  /** From address used in all outgoing emails (must match verified Resend domain) */
  emailFromAddress: "Quiet Mirror <hello@quietmirror.me>",

  /** Subject line for newsletter confirmation email */
  emailConfirmSubject: "You're in — Quiet Mirror Letters",

  // ── AI Persona ───────────────────────────────────────────────────────────
  /** Name the AI uses to identify itself in all system prompts */
  aiPersonaName: "Quiet Mirror",

  // ── Theme colours ─────────────────────────────────────────────────────────
  /** PWA / browser chrome colour in dark mode */
  themeColorDark:  "#0b1120",

  /** PWA / browser chrome colour in light mode */
  themeColorLight: "#f5f0eb",

  // ── URLs ─────────────────────────────────────────────────────────────────
  /** Public site URL — falls back to Vercel preview URL */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://quietmirror.me",
} as const;

// Derived helpers — built from the constants above, not hardcoded
export const BRAND = {
  /** Full page title format: "Quiet Mirror — The Journal That Reads Underneath" */
  fullTitle: `${CONFIG.appName} — ${CONFIG.tagline}`,

  /** Template for sub-pages: "Page Name | Quiet Mirror" */
  titleTemplate: `%s | ${CONFIG.appName}`,
} as const;
