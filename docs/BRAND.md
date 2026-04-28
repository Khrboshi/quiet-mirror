# Brand & Marketing — Quiet Mirror

> **This is your editorial layer.**
> To change how Quiet Mirror is positioned, described, or sold — start here.
> Each section maps every decision to the exact file and key where it lives.
> Edit the source key; the change propagates everywhere that key is used automatically.
>
> **What this file is:** a human-readable brief + a map.
> **What this file is not:** the source of truth. The code files below it are.

---

## Contents

1. [Brand constants](#1-brand-constants)
2. [Pricing & payment](#2-pricing--payment)
3. [Voice & tone](#3-voice--tone)
4. [Core positioning](#4-core-positioning)
5. [Homepage hero](#5-homepage-hero)
6. [Trust signals](#6-trust-signals)
7. [Is / Is not](#7-is--is-not)
8. [Premium — what it promises](#8-premium--what-it-promises)
9. [Social proof & example content](#9-social-proof--example-content)
10. [FAQ — shared answers](#10-faq--shared-answers)
11. [Closing CTAs](#11-closing-ctas)
12. [Duplicate map — where the same idea appears twice](#12-duplicate-map)

---

## 1. Brand constants

**One edit here rebrands the entire product.**

| Decision | Current value | Where to change |
|---|---|---|
| Product name | `Quiet Mirror` | `app/lib/config.ts` → `CONFIG.appName` |
| Tagline | `The Journal That Reads Underneath` | `app/lib/config.ts` → `CONFIG.tagline` |
| Support email | `hello@quietmirror.me` | `app/lib/config.ts` → `CONFIG.supportEmail` |
| Newsletter name | `Quiet Mirror Letters` | `app/lib/config.ts` → `CONFIG.newsletterName` |
| AI persona name | `Quiet Mirror` | `app/lib/config.ts` → `CONFIG.aiPersonaName` |
| Site URL | `https://quietmirror.me` | `app/lib/config.ts` → `CONFIG.siteUrl` |
| PWA theme (dark) | `#0b1120` | `app/lib/config.ts` → `CONFIG.themeColorDark` |
| PWA theme (light) | `#f5f0eb` | `app/lib/config.ts` → `CONFIG.themeColorLight` |

> `CONFIG.appName` is wrapped in `<BrandName />` everywhere it appears in JSX — never hardcoded as a string. The CSS rule `[dir="rtl"] .font-brand-name` keeps the Latin display font on Arabic pages.

### Shared positioning phrases

Atomic trust/positioning phrases that appear in multiple i18n keys are extracted into `app/lib/marketing.ts → MARKETING` so a single edit propagates everywhere. Non-English locale files continue to translate these inline.

| Phrase | Constant | Used in |
|---|---|---|
| `No ads` | `MARKETING.noAds` | `footer.noAds`, `upgrade.trust1` |
| `Subscription supported` | `MARKETING.subscriptionSupported` | `upgrade.trust3Title`, `upgradePage.card2Label` |
| `No ads — subscription supported` | `MARKETING.noAdsSubscriptionSupported` | `upgrade.trust4`, `upgradePage.ctaT4`, `homeBelowFold.closingTrust` |
| `Never trains AI models` | `MARKETING.neverTrainsAI` | `upgradePage.ctaT2`, `upgrade.trust2` |
| `Entries never train AI models` | `MARKETING.entriesNeverTrainAI` | `upgrade.trust2` |
| `Private by default` | `MARKETING.privateByDefault` | `upgradePage.ctaT1`, `upgrade.trust1`, `upgradeFull.freeItem4` |

> When any of these phrases needs to change, edit `app/lib/marketing.ts` only — do not edit individual keys in `en.ts`.
> The call-site column above must be kept in sync with `en.ts` when usages are added or removed.

---

## 2. Pricing & payment

**Change one value — every UI string, logic gate, and copy line updates.**

| Decision | Current value | Where to change |
|---|---|---|
| Monthly price | `$9` | `app/lib/pricing.ts` → `PRICING.monthlyUsd` + `PRICING.monthly` |
| Trial length | `3 days` | `app/lib/pricing.ts` → `TRIAL_DAYS` (the one constant at the top) |
| Free plan monthly reflections | `3` | `app/lib/pricing.ts` → `PRICING.freeMonthlyCredits` |
| Payment provider display name | `Dodo Payments` | `app/lib/payment.ts` → `PAYMENT.providerName` |
| Checkout trust line | `Secure checkout via Dodo Payments` | `app/lib/payment.ts` → `PAYMENT.checkoutTrustLine` |
| Billing managed line | `Billing is managed securely by Dodo Payments.` | `app/lib/payment.ts` → `PAYMENT.billingManagedLine` |

> Stripe legacy webhook (`app/api/stripe/webhook/`) is NEVER TOUCH — keep until all legacy subscriptions expire.

---

## 3. Voice & tone

Quiet Mirror speaks quietly. These are the rules, not suggestions.

**What the voice is:**
- Honest without being clinical
- Specific without being diagnostic
- Warm without being performative
- Curious, never prescriptive

**What the voice is not:**
- Productivity-hacker language ("optimize", "build habits", "crush your goals")
- Therapy language ("trauma", "healing journey", "inner child")
- Urgency language ("act now", "limited time", "don't miss out")
- Excessive exclamation marks or emoji in body copy

**Sentence patterns that work:**
- "You've been carrying this for a while now."
- "Something is trying to become clear."
- "One honest sentence is enough to begin."
- "The pattern you've been sensing is already there."

**Sentence patterns to avoid:**
- "Unlock your potential"
- "Start your journey"
- "Take control of your mental health"
- "Join thousands of users"

---

## 4. Core positioning

These are the decisions that shape every page. Change them here, then update the mapped keys below.

### What Quiet Mirror is

> A private journal that reads what you write and gently reflects it back — then, over time, shows you the patterns you've been too close to see.

**Source key:** `app/lib/i18n/en.ts` → `homepage.heroDesc`
**Also appears as:** `aboutPage.subheadline`, `homeBelowFold.demoDesc`

### What makes it different

> Most journaling tools keep entries. Quiet Mirror looks for the thread.

**Source keys:**
- `homeBelowFold.diffH1` — `"Most journaling tools keep entries."`
- `homeBelowFold.diffH2` — `"Quiet Mirror looks for the thread."`

### The pattern underneath (pull quote)

> Most people don't lack self-awareness. They're just too close to their own life to see the pattern clearly.

**Source keys:**
- `homeBelowFold.patternQ1` — first half
- `homeBelowFold.patternQ2` — second half

### The closing headline (used on homepage + upgrade page)

> Something is trying to become clear. Let's help you hear it.

**Source keys:**
- Homepage: `homeBelowFold.ctaH1` + `homeBelowFold.ctaH2`
- Upgrade page: `upgradeFull.closingH` + `upgradeFull.closingAccent`

---

## 5. Homepage hero

All keys live in `app/lib/i18n/en.ts` → `homepage { … }`.

| Element | Current copy | Key |
|---|---|---|
| Pill tag | `Private AI journal · Write → Reflect → See patterns` | `heroTag` |
| Headline line 1 | `You've been carrying this` | `heroHeadline1` |
| Headline line 2 (accent) | `for a while now.` | `heroHeadline2` |
| Description | `Quiet Mirror is a private journal…` | `heroDesc` |
| Pull quote | `"You've been saying 'I'm fine' for so long…"` | `heroQuote` |
| Pull quote sub | `Sound familiar? That's what Quiet Mirror is for.` | `heroQuoteSub` |
| Primary CTA | `Write your first entry free →` | `heroCta1` |
| Secondary CTA | `See a real reflection →` | `heroCta2` |
| Promise strip | `✓ Journal in under 60 seconds · ✓ First reflection within moments · ✓ No setup, no quiz` | `heroPromise` |

**SEO meta** (same file):

| Element | Key |
|---|---|
| `<title>` | `metaTitle` |
| `<meta description>` | `metaDescription` |
| OG title | `ogTitle` |
| OG description | `ogDescription` |

---

## 6. Trust signals

These four signals appear **in three places**: homepage hero strip, homepage closing CTA, and the upgrade page closing line. They must stay consistent.

| Signal | Current copy | Keys |
|---|---|---|
| Privacy | `Private by default` | `homepage.trust1` · `homeBelowFold.ctaT1` |
| No AI training | `Entries never train AI models` | `homepage.trust2` · `homeBelowFold.ctaT2` |
| Free plan | `Free plan, no expiry` | `homepage.trust3` |
| No ads | `No ads, ever` | `homepage.trust4` · `homeBelowFold.ctaT4` · `upgradeFull.closingTrust` |

**Trust section (homepage below fold)** — longer versions, same concepts:

| Signal | Key |
|---|---|
| Privacy (heading + body) | `homeBelowFold.trust1Title` + `homeBelowFold.trust1Body` |
| No ads (heading + body) | `homeBelowFold.trust3Title` + `homeBelowFold.trust3Body` |

> **When you update a trust signal, update it in all mapped keys.** They are intentionally separate (different surfaces, different copy lengths) — but they must stay aligned in meaning.

---

## 7. Is / Is not

This positioning block appears on two pages with slightly different wording. Both must stay aligned.

### Homepage (`homeBelowFold` namespace)

**Is:**
1. `is1` — `A private place to write without judgment`
2. `is2` — `A gentle reflection on what you wrote`
3. `is3` — `A way to see patterns across weeks and months`
4. `is4` — `Respectful of your pace and privacy`

**Is not:**
1. `isNot1` — `Therapy or a substitute for clinical care`
2. `isNot2` — `A productivity or self-optimisation tool`
3. `isNot3` — `A public or social platform`
4. `isNot4` — `Something you have to use every day`

### About page (`aboutPage` namespace)

**Is:** `is1`–`is4` (slightly expanded wording — `is4` adds "and your process")
**Is not:** `isNot1`–`isNot4` (same meaning, slightly different phrasing — `isNot4` says "daily commitment")

> These are intentionally separate namespace entries (About has a different tone than the homepage). If you change the core positioning, update both. If you want identical copy, that's fine — just paste the same value into both keys.

---

## 8. Premium — what it promises

### The feature list (single source — used everywhere)

All five features are defined **once** in `premiumFeatures` and shared across the upgrade modal, the upgrade page, the paywall gate, and the homepage pricing section.

| # | Label | Subtitle | Keys |
|---|---|---|---|
| 1 | `Unlimited reflections` | `Reflect on every entry, not just a few each month` | `f1Label` + `f1Sub` |
| 2 | `Full pattern insights` | `See what repeats across weeks and months` | `f2Label` + `f2Sub` |
| 3 | `Weekly personal summary` | `A concise mirror of what Quiet Mirror noticed this week` | `f3Label` + `f3Sub` |
| 4 | `Why-this-keeps-happening insights` | `A clearer view of recurring loops and emotional drivers` | `f4Label` + `f4Sub` |
| 5 | `Everything in Free` | `Nothing removed — just a deeper layer added` | `f5Label` + `f5Sub` |

**Source:** `app/lib/i18n/en.ts` → `premiumFeatures { … }`
**Used by:** `HomeBelowFold`, `RequirePremium`, `UpgradeTriggerModal`, `upgrade/page.tsx`, `upgrade/confirmed/page.tsx`, `settings/billing/page.tsx`

### Premium headline (upgrade page hero)

| Element | Current copy | Key |
|---|---|---|
| Headline line 1 | `Start seeing the deeper pattern,` | `upgradeFull.heroH1` |
| Headline accent | `not just today's entry.` | `upgradeFull.heroH1Accent` |
| Description | `Premium connects your entries across time…` | `upgradeFull.heroDesc` |

### Free vs Premium comparison table (upgrade page)

Row labels live in `upgradePage` namespace: `compRow1`–`compRow6`.
The "Unlimited" cell label: `upgradePage.compUnlimited`.

### Premium pricing section (homepage)

| Element | Key |
|---|---|
| Section tag | `homeBelowFold.pricingTag` |
| Section headline | `homeBelowFold.pricingH` |
| Section description | `homeBelowFold.pricingDesc` |
| Free plan tagline | `homeBelowFold.freeTagline` |
| Free plan description | `homeBelowFold.freeDesc` |
| Premium tagline | `homeBelowFold.premiumTagline` |
| Premium description | `homeBelowFold.premiumDesc` |
| Without Premium line | `homeBelowFold.premiumWithout` |
| With Premium line | `homeBelowFold.premiumWith` |

### Upgrade modal badge

`upgradeTrigger.premiumFeatureBadge` — currently `✦ Premium feature`

---

## 9. Social proof & example content

These are the illustrative examples shown to visitors who haven't signed up yet. They are not real user data — they are crafted examples that represent typical patterns.

### The proof card (shown on homepage and upgrade page)

The mock insight card (14/22 entries, 3 weeks pattern) represents the archetypal Quiet Mirror user:
someone carrying emotional load and responsibility for others, slowly gaining clarity.

| Element | Homepage key | Upgrade page key |
|---|---|---|
| Card title | `homeBelowFold.proofCardTitle` | `upgradeFull.proofCardHeader` |
| Badge | `homeBelowFold.proofBadge` | `upgradeFull.proofCardBadge` |
| Quote | `homeBelowFold.proofQuote` | `upgradeFull.proofQuote` |
| Bar 1 label | `homeBelowFold.proofBar1` | `upgradeFull.proofBar1` |
| Bar 2 label | `homeBelowFold.proofBar2` | `upgradeFull.proofBar2` |
| Bar 3 label | `homeBelowFold.proofBar3` | `upgradeFull.proofBar3` |
| Bar 4 label | `homeBelowFold.proofBar4` | `upgradeFull.proofBar4` |
| Stat 1 | `homeBelowFold.proofStat1` | `upgradeFull.proofStat1` |
| Stat 2 | `homeBelowFold.proofStat2` | `upgradeFull.proofStat2` |
| Note | `homeBelowFold.proofNote` | `upgradeFull.proofNote` |

> These two cards are visually identical but live in separate namespaces because the upgrade page card has a different surrounding context. **If you change the story (the archetype, the stats, the quote), update both.**

### Reflection examples (homepage section 5)

Three example entry→reflection pairs shown on the homepage.

| Pair | Entry key | Reflection key | Emotion tags |
|---|---|---|---|
| Overcommitment | `homeBelowFold.ex1W` | `homeBelowFold.ex1R` | `ex1T1/2/3` |
| Friendship distance | `homeBelowFold.ex2W` | `homeBelowFold.ex2R` | `ex2T1/2/3` |
| Running on empty | `homeBelowFold.ex3W` | `homeBelowFold.ex3R` | `ex3T1/2/3` |

### Social proof recognition quotes (homepage section 1)

Three short recognition statements (not attributed testimonials — intentionally written as "if this sounds familiar"):

| # | Key |
|---|---|
| 1 | `homeBelowFold.rec1` — the steady-one-for-everyone pattern |
| 2 | `homeBelowFold.rec2` — the same-tension-in-different-situations pattern |
| 3 | `homeBelowFold.rec3` — the blank-page problem |

### The AI demo (homepage section 2)

A live-looking entry→reflection demo card:

| Element | Key |
|---|---|
| Entry text | `homeBelowFold.demoEntry` |
| Reflection text | `homeBelowFold.demoReflection` |
| Emotion tags | `homeBelowFold.demoTag1/2/3` |

### The 3-step flow

| Step | Label key | Subtitle key |
|---|---|---|
| 1 — Write | `homeBelowFold.step1Label` | `homeBelowFold.step1Sub` |
| 2 — Reflect | `homeBelowFold.step2Label` | `homeBelowFold.step2Sub` |
| 3 — See patterns | `homeBelowFold.step3Label` | `homeBelowFold.step3Sub` |

---

## 10. FAQ — shared answers

Two FAQ sets exist, one per page. They overlap in topic but are written for different contexts (pre-signup vs. pre-payment). Keep them aligned in substance.

### Homepage FAQ (`homeBelowFold` namespace)

| # | Question key | Topic |
|---|---|---|
| 1 | `faq1Q` + `faq1A` | What does a reflection actually say? |
| 2 | `faq2Q` + `faq2A` | Is this therapy? |
| 3 | `faq3Q` + `faq3A` | Do I need to write every day? |
| 4 | `faq4Q` + `faq4A` | What happens to my entries? |
| 5 | `faq5Q` + `faq5A(n)` | Why would someone pay for Premium? |

### Upgrade page FAQ (`upgradeFull` namespace)

| # | Question key | Topic |
|---|---|---|
| 1 | `faq1Q(appName)` + `faq1A` | What does Premium actually show me? |
| 2 | `faq2Q` + `faq2A(n)` | How many free reflections? |
| 3 | `faq3Q` + `faq3A(...)` | Refund policy |
| 4 | `faq4Q` + `faq4A` | What if I don't write often? |
| 5 | `faq5Q` + `faq5A` | Auto-renewal |
| 6 | `faq6Q` + `faq6A(appName)` | Is my data safe? |
| 7 | `faq7Q(cadence)` + `faq7A(...)` | Why does Premium cost money? |

---

## 11. Closing CTAs

### Legal pages (terms + privacy) and blog articles

Shared namespace: `app/lib/i18n/en.ts` → `legalPagesCta { … }`

| Element | Key |
|---|---|
| Heading | `readyHeading` — `Ready to try a private check-in?` |
| Body | `readyBody` — `Start free. Upgrade only if it genuinely helps…` |
| Primary button | `startFreeLabel` — `Start free journaling` |
| Secondary button | `seePremiumLabel` — `See what Premium adds` |
| About link (privacy page only) | `learnAboutLabel(appName)` — `Learn about Quiet Mirror →` |
| Blog CTA heading | `blogCtaHeading` — `Want to see what keeps returning?` |
| Blog CTA body | `blogCtaBody` — `Premium reads across your entries…` |
| Blog primary button | `seePremiumBlog` — `See Premium benefits →` |
| Blog trust line | `refundNote(days)` — `🛡️ 3-day full refund on Premium · Cancel anytime` |
| Blog back link | `backToArticles` — `← Back to all articles` |

### Homepage closing CTA section

| Element | Key |
|---|---|
| Tag | `homeBelowFold.ctaTag` |
| Headline line 1 | `homeBelowFold.ctaH1` — `Something is trying to become clear.` |
| Headline line 2 | `homeBelowFold.ctaH2` — `Let's help you hear it.` |
| Description | `homeBelowFold.ctaDesc` |
| Button | `homeBelowFold.ctaBtn` |

### Upgrade page closing CTA section

| Element | Key |
|---|---|
| Headline | `upgradeFull.closingH` — `Something is trying to become clear.` |
| Accent | `upgradeFull.closingAccent` — `Let's help you hear it.` |
| Description | `upgradeFull.closingDesc(appName)` |
| Secondary button | `upgradeFull.closingStartFree` |
| Trust strip | `upgradeFull.closingTrust` — `No charge today · Cancel anytime · No ads, ever` |

---

## 12. Duplicate map

These concepts appear in more than one namespace by design (different pages, different copy lengths). When you update one, check the other.

| Concept | Namespace A | Namespace B | Note |
|---|---|---|---|
| Is / Is not lists | `homeBelowFold.is1–4 / isNot1–4` | `aboutPage.is1–4 / isNot1–4` | Slightly different wording — align on intent |
| Proof card (mock insight) | `homeBelowFold.proof*` | `upgradeFull.proof*` | Identical story, different context — keep stats in sync |
| Closing headline | `homeBelowFold.ctaH1/H2` | `upgradeFull.closingH/Accent` | Same words — keep in sync |
| Privacy trust signal (short) | `homepage.trust1` | `homeBelowFold.ctaT1` | Same short label |
| No-ads signal (short) | `homepage.trust4` | `homeBelowFold.ctaT4` | Same short label |
| Free reflections count | `homeBelowFold.faq5A(n)` | `upgradeFull.faq2A(n)` | Both receive `PRICING.freeMonthlyCredits` — auto-synced |
| "Start free journaling" button | `legalPagesCta.startFreeLabel` | `blogPage.ctaJournal` | Same intent — keep wording consistent |
| Premium FAQ | `homeBelowFold.faq*` | `upgradeFull.faq*` | Different depth, same honest answers |

---

## How to make a change

**Changing a number (price, trial days, credit count):**
→ Edit `app/lib/pricing.ts` or `app/lib/payment.ts`. Done. Everything else is derived.

**Changing the app name, email, or tagline:**
→ Edit `app/lib/config.ts`. Done.

**Changing marketing copy (headlines, descriptions, CTAs, FAQs):**
1. Find the key in the table above
2. Open `app/lib/i18n/en.ts` and search for the key name
3. Edit the English value
4. Check the **duplicate map** — if the same concept appears elsewhere, update it too
5. Push to a branch — the `i18n-auto-translate` Action translates all 5 non-English locales automatically on merge to `main`

**Changing a design token (colour, spacing, shadow):**
→ `app/globals.css` for CSS variables · `tailwind.config.ts` for Tailwind aliases · `docs/DESIGN.md` for the full spec.

**Changing what Premium promises (features):**
→ `app/lib/i18n/en.ts` → `premiumFeatures { … }` — 5 features, each with a label and subtitle.
→ The same 6 files that consume this namespace update automatically.
