/**
 * app/lib/marketing.ts
 *
 * Shared EN source values for positioning phrases that appear in multiple
 * i18n keys across en.ts.
 *
 * WHY THIS EXISTS
 * ───────────────
 * Several marketing/trust phrases (e.g. "No ads — subscription supported")
 * appear in 3–5 different translation keys. If the phrasing ever needs to
 * change (legally or editorially), a single edit here propagates to every
 * key that references it — rather than requiring a multi-key hunt across
 * en.ts. Non-English locale files translate these inline (as they always
 * have) and are unaffected.
 *
 * WHAT GOES HERE
 * ──────────────
 * Only atomic phrases that (a) appear verbatim in 2+ keys in en.ts, and
 * (b) represent positioning/trust copy that should never drift between keys.
 * UI labels that happen to be identical are NOT extracted here.
 *
 * WHAT DOES NOT GO HERE
 * ──────────────────────
 * Full sentences that embed these phrases (those are in en.ts, composed
 * using the constants below). Brand name, pricing, and payment copy remain
 * in config.ts, pricing.ts, and payment.ts respectively.
 */

export const MARKETING = {
  /**
   * Short "no ads" label — used standalone in trust badges and closing lines.
   * Full composite form: `${MARKETING.noAds} — ${MARKETING.subscriptionSupported}`
   */
  noAds: "No ads",

  /**
   * Revenue model descriptor — used standalone as a card label and in composite trust lines.
   */
  subscriptionSupported: "Subscription supported",

  /**
   * Composite trust phrase combining the two above — the most common form.
   * Referenced directly to avoid manual concatenation at each call site.
   */
  noAdsSubscriptionSupported: "No ads — subscription supported",

  /**
   * AI training claim — short form for badges and compact bullet lists.
   * Use this in icon-badge rows, CTA trust lines, or anywhere the subject
   * "Entries" would feel redundant (e.g. alongside other badge-style items).
   */
  neverTrainsAI: "Never trains AI models",

  /**
   * AI training claim — sentence form for prose trust blocks.
   * Use this when the phrase stands alone or follows a full sentence,
   * where "Entries" provides clarity about what is not being trained on.
   */
  entriesNeverTrainAI: "Entries never train AI models",

  /**
   * Privacy by default — short form used in trust badges.
   */
  privateByDefault: "Private by default",

  // ── Privacy trust line ──────────────────────────────────────────────────
  /**
   * Canonical privacy trust sentence — appears in footer.privacyAssurance
   * and requirePremium.trustLine.
   * Update here once; both keys update automatically.
   *
   * Note: upgradeFull.proofPrivacy is a different, shorter sentence
   * ("Only you can see this. Never shared, never used to train AI.") and
   * is intentionally kept separate.
   */
  privacyTrustLine:
    "Your entries are private, never shared, and never used to train AI models.",

  // ── Proof card illustrative data ────────────────────────────────────────
  // These demo values appear identically in homeBelowFold and upgradeFull.
  // They are intentionally illustrative (not real user data) — update both
  // pages by editing here.

  /** Bar label 1 — most prominent pattern signal in the proof card. */
  proofBar1: "Emotional load",
  /** Bar label 2 */
  proofBar2: "Responsibility for others",
  /** Bar label 3 */
  proofBar3: "Overwhelm / exhaustion",
  /** Bar label 4 — rising signal */
  proofBar4: "Clarity (\u2191 rising)",
  /** Stat label 1 — shown below the 14/22 number */
  proofStat1: "entries with\nemotional load",
  /** Stat label 2 — shown below the 3wks number */
  proofStat2: "pattern has\nbeen building",
  /**
   * The illustrative AI-generated insight quote in the proof card.
   * Used in both the homepage proof section and the upgrade page proof card.
   *
   * Display forms:
   * - homeBelowFold.proofQuote wraps this in Unicode curly quotes (\u201c…\u201d)
   *   for the pull-quote display style.
   * - upgradeFull.proofQuote and card3Quote use it bare (prose context).
   */
  proofQuote:
    "You often sound most overwhelmed when you feel responsible for keeping everything steady for everyone else \u2014 and rarely give yourself the same patience.",

  // ── Insight card section tags ────────────────────────────────────────────
  // Six section titles used identically in homeBelowFold and upgradeFull.
  insightTag1: "What shows up most",
  insightTag2: "What keeps returning",
  insightTag3: "What may be driving it",
  insightTag4: "What is shifting",
  insightTag5: "Your weekly mirror",
  insightTag6: "A question worth sitting with",
} as const;
