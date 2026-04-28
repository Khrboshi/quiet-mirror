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
} as const;
