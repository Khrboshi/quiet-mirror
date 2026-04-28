# Product Requirements & UI Standards — Quiet Mirror

> **How this file relates to the others:**
> `BRAND.md` owns copy decisions. `DESIGN.md` owns visual tokens and code patterns. `I18N.md` owns locale rules.
> **This file owns product intent** — what each surface is _for_, what it must never become, and how UI decisions are judged.
> When a feature, screen, or component is being designed or reviewed, start here.

---

## Contents

1. [Product mission](#1-product-mission)
2. [What Quiet Mirror is and is not](#2-what-quiet-mirror-is-and-is-not)
3. [The user we are building for](#3-the-user-we-are-building-for)
4. [Core promises — never break these](#4-core-promises--never-break-these)
5. [The subscription relationship](#5-the-subscription-relationship)
6. [Surface-by-surface purpose map](#6-surface-by-surface-purpose-map)
7. [UI quality standards](#7-ui-quality-standards)
8. [What "value for money" looks like here](#8-what-value-for-money-looks-like-here)
9. [Design decision checklist](#9-design-decision-checklist)
10. [Forbidden patterns](#10-forbidden-patterns)

---

## 1. Product mission

Quiet Mirror is a **private journal that reads underneath** — it takes what a person writes, reflects it back with care, and over time surfaces the patterns they are too close to see.

The product exists for people who already know something is going on but can't name it clearly. It does not diagnose, prescribe, optimise, or encourage. It listens, reflects, and shows.

**One sentence the whole product must hold to:**

> _A private place to write without judgment — and a gentle mirror of what's already there._

Every surface, feature, and copy line is justified against this sentence or it doesn't belong.

---

## 2. What Quiet Mirror is and is not

These are product-level constraints, not just marketing copy. Every UI decision should be consistent with them.

### Is

- A private journal with AI-powered reflection
- A pattern-recognition tool across a person's own writing over time
- A calm, low-commitment companion — no streaks enforced, no daily pressure
- Honest about what it can and cannot do
- Respectful of the user's pace, privacy, and autonomy

### Is not

- Therapy, counselling, or a substitute for clinical care
- A productivity or self-optimisation tool
- A social or sharing platform
- A habit-formation app (no streaks, badges, or gamification)
- An AI chatbot — it responds to writing, it doesn't converse
- A mental health diagnostic tool

**If a proposed feature or copy line would make Quiet Mirror feel like any of the above — it does not ship.**

---

## 3. The user we are building for

The archetypal Quiet Mirror user:

- Carries more than they name out loud — for others, for work, for everyone
- Has enough self-awareness to know something is off, but not enough distance to see it
- Is not looking for motivation or advice — they are looking for _recognition_
- Values privacy deeply and is quietly skeptical of tools that feel extractive
- Does not want a new "system" — they want a place to think

This user does not respond to urgency, gamification, or social proof framing. They respond to honesty, specificity, and restraint.

**When in doubt about a UI decision: would this user find it calming or alerting?** Calming wins.

---

## 4. Core promises — never break these

These are the promises Quiet Mirror makes to every user, free and paid. Breaking any of them — even in a minor UI surface — damages the product's integrity.

| Promise | What it means in practice |
|---|---|
| **Private by default** | Entries are never shown to other users. No social layer. No sharing prompts. |
| **Entries never train AI models** | This is stated clearly and must never be contradicted, hedged, or omitted from privacy-adjacent surfaces. |
| **No ads, ever** | No sponsored content, no promoted features, no third-party tracking visible to users. |
| **No judgment** | The product never scores, grades, rates, or evaluates entries. No "great entry!" feedback. |
| **No daily pressure** | No streak counters, no "you haven't written in X days" guilt nudges, no completion bars on the journal. |
| **Honest about limits** | AI reflections are not therapy. The product says this plainly. No copy should imply otherwise. |
| **Cancel anytime** | The billing relationship is frictionless to exit. Copy confirms this without hiding it. |

---

## 5. The subscription relationship

Quiet Mirror's revenue is subscription-supported, not ad-supported. This is a promise to users, not just a business model. It means:

- The product's incentive is user retention through genuine value, not engagement maximisation
- Premium must feel like _depth added_, not features locked away punitively
- Free users are real users, not a conversion funnel to be pressured

### What Premium actually unlocks

Single source of truth: `app/lib/i18n/en.ts` → `premiumFeatures { … }`.

| Feature | What it means |
|---|---|
| Unlimited reflections | No credit cap — every entry can be reflected |
| Full pattern insights | Cross-entry pattern recognition over weeks and months |
| Weekly personal summary | A weekly mirror of what the AI noticed |
| Why-this-keeps-happening insights | Deeper view of recurring emotional loops |
| Everything in Free | Nothing is taken away — a layer is added |

### Premium tone

Premium is not a reward. It is not an achievement. It is not "unlocking your full potential."

Premium is **more of what the product already does** — more reflections, more pattern depth, more time-span visibility. The frame is always: "you've been using this; here's more of it."

Copy that positions Premium as a status upgrade, a lifestyle choice, or a self-improvement accelerant is **off-brand and must not ship**.

---

## 6. Surface-by-surface purpose map

### Journal entry (`/journal`)

**Purpose:** The core action — write, save, receive a reflection.
**Success:** User writes something honest, feels heard by the reflection, returns tomorrow.
**Must never:** Score the entry, prompt sharing, show a completion percentage, compare to previous entries in a competitive frame.

### Tools hub (`/tools`)

**Purpose:** A calm entry point to Premium's active features — Reflection, Mood, Suggestions. The user arrives here after subscribing. It should confirm they made the right decision without feeling like a sales page.
**Success:** User immediately understands what each tool does and feels invited (not pressured) to try one.
**Must never:** Use feature-count language ("3 powerful tools"), urgency language, gamification, or copy that implies the free tier was inferior.
**Visual register:** Grounded, warm, unhurried. Cards should feel like doors, not billboards.

### Mood tool (`/tools/mood`)

**Purpose:** A moment of honest self-location — not scoring, not tracking in a visible way, just noticing.
**Must never:** Show a numerical score, compare today to other days in a visible UI element, or suggest the "right" mood.

### Reflection tool (`/tools/reflection`)

**Purpose:** A guided prompt shaped by what has been showing up in the user's recent entries.
**Must never:** Reference specific entry content in a way that feels surveillance-like. Must always feel like a gentle question, not an analysis report.

### Suggestions tool (`/tools/suggestions`)

**Purpose:** One or two gentle invitations based on patterns — not instructions, not a to-do list.
**Must never:** Use imperative/instructional framing. "You should try…" is wrong. "Something that has helped others in similar moments…" is right.

### Upgrade / paywall surfaces

**Purpose:** Honest explanation of what Premium adds. No pressure. No urgency.
**Must never:** Use countdown timers, artificial scarcity, or dark patterns. Must always include the refund note and cancel-anytime line.

### Settings / billing

**Purpose:** Transparent account management — plan status, billing date, cancel option.
**Must never:** Make cancellation hard to find or use guilt-framing to dissuade cancellation.

---

## 7. UI quality standards

These apply to every screen, component, and PR.

### Visual language

- Follow `docs/DESIGN.md` for all tokens, utility classes, and typography
- Dark, quiet, indigo-toned aesthetic — not clinical white, not productivity-dashboard teal
- Cards feel like **surfaces to rest on**, not tiles to click through
- Hierarchy through whitespace and type weight, not through visual noise

### Motion and interaction

- Transitions are short (150–250ms), subtle, and purposeful
- No looping animations, no animated illustrations, no celebratory effects
- Hover states provide orientation cues — they do not perform

### Iconography

- No emoji in body copy or headings (per BRAND.md §3)
- Icons should be minimal, consistent-weight, and never decorative for their own sake
- If a tool card has an icon, it represents the tool's action, not its status

### Density and breathing room

- Quiet Mirror pages feel **unhurried** — generous padding, comfortable line-height
- Mobile-first but not mobile-crammed — content should breathe on all sizes
- Never pack more information into a view than the user needs at that moment

### Accessibility

- All interactive elements have focus-visible states (using `--qm-focus-ring-*` tokens)
- Colour is never the sole differentiator for state
- Touch targets ≥ 44px on mobile
- ARIA labels on icon-only buttons

---

## 8. What "value for money" looks like here

This section exists because "value for money" is easy to misread as "show more features louder." That is the wrong interpretation for this product.

For the Quiet Mirror user, value for money feels like:

1. **Recognition** — "This tool clearly understands what I need it for."
2. **Competence** — "It works reliably and feels considered."
3. **Honesty** — "It doesn't oversell itself or hide limitations."
4. **Depth available** — "There's more here when I want to go further."
5. **Quiet confidence** — "This was built by someone who cares about this."

Value for money is **never communicated through feature counts, comparison tables in the app interior, or "you're getting X worth of Y" language.**

Value is communicated through:
- A tools page that explains each tool in one sentence of genuine description
- Reflections that actually make the user feel seen
- Patterns that surface something real
- An interface that doesn't get in the way

**The tools page specifically:** A subscriber arriving at `/tools` should feel: _"Yes, this is what I paid for. I know exactly what to do next."_ That feeling comes from clarity and warmth, not from a bullet list of features.

---

## 9. Design decision checklist

Before any new UI element, page change, or copy addition ships, run it through this list:

- [ ] Does it align with the product mission (§1)?
- [ ] Is it consistent with the Is/Is not list (§2)?
- [ ] Would the archetypal user (§3) find it calming or alerting?
- [ ] Does it honour all seven core promises (§4)?
- [ ] If it touches Premium: does it add depth without feeling punitive to free users?
- [ ] Does it follow the surface-purpose rules (§6) for its screen?
- [ ] Does copy avoid all forbidden language patterns (§10 + BRAND.md §3)?
- [ ] Does it use only QM design tokens (`--qm-*`, `qm-btn-*`, etc.)?
- [ ] Has it been checked against the NEVER TOUCH list in `SKILL.md`?
- [ ] If it introduces new i18n strings: are they in `en.ts` and do they follow `docs/I18N.md`?
- [ ] If it duplicates a string from another namespace: is it extracted to `MARKETING` in `marketing.ts`?

---

## 10. Forbidden patterns

These are hard stops. If a PR introduces any of the following, it must be revised before merge.

### Copy patterns

| Forbidden | Why |
|---|---|
| "Unlock your potential" / "Unlock [feature]" | Gamification language — positions features as rewards |
| "Start your journey" / "Begin your healing" | Therapy-adjacent cliché |
| "Join thousands of users" / "Join our community" | Social proof framing — implies social platform |
| "Optimize", "build habits", "crush your goals" | Productivity-hacker register |
| "Act now", "Limited time", "Don't miss out" | Urgency language — manipulative |
| "You haven't written in X days" (guilt framing) | Streak/pressure mechanic |
| "Your mental health matters" | Clinical framing — we are not a mental health app |
| Any absolute claim ("always", "100%", "guaranteed") | Irrevocable claims — banned site-wide |
| Exclamation marks in body copy | Contra brand voice |

### UI patterns

| Forbidden | Why |
|---|---|
| Streak counters or calendars showing gaps | Creates daily pressure — contradicts core promise |
| Progress bars on journal completion | Gamification |
| Numerical mood scores displayed to user | Reductive — removes the nuance the product is built on |
| Countdown timers on any offer | Urgency dark pattern |
| Feature comparison tables inside the app interior (post-login) | Sales register — user has already subscribed |
| "Premium 👑" badges on every feature | Status signalling — positions subscription as class marker |
| Celebratory animations on entry save | Performative feedback — contradicts "no judgment" |
| Push notification prompts for daily writing | Pressure mechanic |

### Technical patterns

| Forbidden | Why |
|---|---|
| Hardcoded `"Quiet Mirror"` in JSX | Must use `CONFIG.appName` / `<BrandName />` |
| Hardcoded `"$9"` or `"3 days"` | Must use `PRICING.*` constants |
| `bg-emerald-500`, `text-green-400`, etc. in new code | Must use `--qm-*` tokens |
| New `havenly:` or `hvn_` localStorage keys | Use `qm:` prefix |
| Any change to Stripe webhook handler | NEVER TOUCH |
| Supabase RLS policy edits outside migration | NEVER TOUCH |
| Editing non-English locale files directly | Auto-translated on merge — NEVER TOUCH |
