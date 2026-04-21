# Design system in Quiet Mirror

Quiet Mirror's look and feel is driven by a small set of CSS custom properties (`--qm-*`), a handful of component utility classes, and four top-level configuration files. The system is small on purpose: one token per meaning, one file per domain, everything else derived.

If you are trying to change a colour, a brand name, a price, or a payment label, go straight to ["Where things live"](#where-things-live) and ["The rules"](#the-rules). If you are tempted to hardcode a hex value or a Tailwind colour like `bg-emerald-500`, read ["The rules"](#the-rules) first.

---

## Where things live

Five files are authoritative. Everything else references them.

```
app/globals.css        — the --qm-* token system, component classes,
                         legacy Tailwind remap, RTL rules
tailwind.config.ts     — qm.* alias map (Tailwind classes backed by --qm-* vars)
app/lib/config.ts      — brand constants (name, tagline, email, theme colours)
app/lib/pricing.ts     — price, trial length, free-tier credits
app/lib/payment.ts     — payment provider name, routes, labels
```

`docs/I18N.md` is the companion document for translation strings. This file covers everything visual; that file covers everything textual.

---

## The rules

1. **Never hardcode brand values.** The app name, tagline, support email, and site URL come from `CONFIG` in `app/lib/config.ts`. Rebranding is a one-file change — keep it that way.
2. **Never hardcode colours.** Use `--qm-*` variables or the `qm.*` Tailwind aliases. No raw hex, no `bg-emerald-500`, no `bg-[color:#...]` arbitrary values. The legacy Tailwind palette names get remapped by a safety net in `globals.css` — see ["Legacy Tailwind remapping"](#legacy-tailwind-remapping) — but that's a migration aid, not a licence to write them.
3. **Never hardcode prices or trial lengths.** Use `PRICING` from `app/lib/pricing.ts`. Never write `"$9"` or `"3 days"` inline — the constants carry plural-aware labels.
4. **Never reference the payment provider by name in UI.** Use `PAYMENT` from `app/lib/payment.ts`. When the provider changes, one file updates everywhere.
5. **Dark mode is system-driven.** `tailwind.config.ts` sets `darkMode: "media"` and `globals.css` uses `@media (prefers-color-scheme: light)`. There is no manual toggle and no `dark:` class strategy. Design both modes at once or not at all.

---

## The token system

All tokens are declared in `app/globals.css`. The dark-mode values live on `:root`; the light-mode overrides live inside `@media (prefers-color-scheme: light)`. Every token is exposed as a Tailwind class through the `qm.*` map in `tailwind.config.ts`.

### Brand surfaces and text

`--qm-bg`, `--qm-bg-elevated`, `--qm-bg-soft`, `--qm-bg-card` cover every surface in the app, from the page background up through floating cards. `--qm-text-primary`, `--qm-text-secondary`, `--qm-text-muted`, `--qm-text-faint` cover the corresponding four-step text hierarchy. Use the least emphasis that still reads.

### Accent

`--qm-accent` is the primary brand colour — indigo (`#5b6de8`) in light, periwinkle (`#8b9dff`) in dark. `--qm-accent-2` is the muted violet companion used for secondary highlights and gradient stops. Both ship with `-hover`, `-soft`, and `-border` variants. The `-soft` and `-border` variants are pre-computed rgba values with the right alpha for each theme — don't recompute them at the call site.

### Semantic status

Four categories, each with seven variants. The full 4 × 7 matrix lives in `globals.css`; this table is orientation, not a replacement:

| Category | Meaning |
| --- | --- |
| `--qm-positive` | success, streaks, saved states |
| `--qm-premium` | insights, upgrade, premium features |
| `--qm-danger` | delete, errors, destructive actions |
| `--qm-warning` | caution, limits, notices |

Each category has a `base`, `strong`, `hover`, `soft`, `border`, `muted`, and `bg` variant. Use `base` for icons and text; `strong` for primary solid fills; `hover` for the hover state (it's lighter in dark mode and darker in light mode — don't invert this manually); `soft` for tinted backgrounds under labels or chips; `border` for outlines; `muted` for secondary annotations; `bg` for the faintest section tint.

The light-mode values are intentionally darker than the dark-mode values — emerald-400 on cream is illegible, emerald-600 on cream is crisp. Don't pick a single hex and call it the "brand green"; pick the semantic meaning and let the token do the work.

### Data visualisation

`--qm-dv-positive`, `-work`, `-love`, `-health`, `-grief`, `-growth`, `-creative`, `-identity`, `-fitness`, `-fear` are the chart and tag colours for the emotional categories the AI classifies entries into. These are **theme-independent on purpose** — a user associates "love" with pink and "fear" with red regardless of whether they're on the light or dark version of the app. Never remap these to semantic tokens, and never introduce theme variants.

### Misc

`--qm-border-subtle` and `--qm-border-card` are the two border weights. `--qm-shadow-soft`, `-card`, `-card-lift` are the three elevation levels. `--qm-focus-ring-color/-width/-offset` drive the `:focus-visible` outline. `--qm-bg-glass-80` and `--qm-bg-glass-95` are pre-composed rgba equivalents of the background with alpha, for use where `backdrop-filter` is insufficient. `--qm-signal-warm` is a single-variant warm gold used for a handful of hand-picked accents (e.g. the "what you wrote" signal badge).

---

## Component classes

Four utility classes in `@layer components` cover the buttons, inputs, and panels you'll reach for 95% of the time:

- `.qm-btn-primary` — rounded-full, solid `--qm-accent`, white text. The canonical CTA.
- `.qm-btn-secondary` — rounded-full, elevated background, subtle border, primary text. For the less-loud action beside a primary button.
- `.qm-input` — full-width, rounded, card-bordered, elevated-background input. Handles hover and focus state automatically.
- `.qm-panel` / `.qm-panel-strong` — card container with card border, elevated background, and soft shadow. `-strong` has a heavier shadow and a slightly brighter border.

`.nav-link` and `.nav-link-active` style the nav items with an accent-soft hover and active state.

A few utilities in `@layer utilities` are worth knowing by name: `.bg-qm-page-gradient` and `.bg-qm-hero-gradient` for top-of-page wash backgrounds; `.section-tinted`, `.section-purple-tint`, `.section-cta-gradient` for block-level backgrounds; `.qm-eyebrow` for the uppercase 11px label used above headings; `.reveal` + `.is-visible` for the scroll-triggered fade-up (pair with `.reveal-delay-1..4` for staggered entrances); `.stagger-children` for the same effect on direct children of a container.

---

## Typography

Two typefaces, loaded via `next/font` and exposed as CSS variables on `<html>`:

- **Fraunces** → `var(--font-display)` → applied automatically to `h1`–`h6` and anything with `.font-display`.
- **DM Sans** → `var(--font-body)` → the default body font.

Headings get `letter-spacing: -0.02em`; body copy gets `text-wrap: pretty`. Inputs use `font-size: max(16px, 1rem)` — the `max()` is load-bearing. Safari on iOS auto-zooms any input with a computed font-size below 16px on focus. Don't override this.

RTL rules (Arabic) are covered in `docs/I18N.md`; the Arabic font stack is defined in `globals.css` under `[dir="rtl"]`. The brand name "Quiet Mirror" is kept in its Latin display font even in RTL layouts via `.font-brand-name` — brand names aren't translated or restyled.

---

## Brand constants

`app/lib/config.ts` exports two objects:

- `CONFIG` — the raw values: `appName`, `tagline`, `description`, `ogDescription`, `supportEmail`, `newsletterName`, `emailFromAddress`, `emailConfirmSubject`, `aiPersonaName`, `themeColorDark`, `themeColorLight`, `siteUrl`.
- `BRAND` — derived helpers: `fullTitle` (`"Quiet Mirror — The Journal That Reads Underneath"`) and `titleTemplate` (`"%s | Quiet Mirror"`).

The theme colours on `CONFIG` (`themeColorDark: #0b1120`, `themeColorLight: #f5f0eb`) are the **PWA browser-chrome colours** — the strip at the top of the browser on mobile. They're intentionally different from `--qm-bg` (the page background): `#f5f0eb` is a warmer cream for browser chrome vs `#faf9f7` for the page, and `#0b1120` is a deeper indigo for chrome vs `#0a0d1a` for the page. If you touch either, touch both in proportion.

Always build titles and metadata from `BRAND.titleTemplate` / `BRAND.fullTitle` rather than string-concatenating `CONFIG.appName` and a tagline — the derivation is the point.

---

## Pricing

`app/lib/pricing.ts` exports one object, `PRICING`, derived from a single `TRIAL_DAYS` constant at the top of the file. To change the trial length, edit that number — `trialLabel` ("3-day free trial"), `trialFreeFor` ("Free for 3 days"), `trialDayWord` ("day"/"days"), and `trialNoChargeUntil` ("no charge until day 4") all update automatically, including singular/plural agreement.

Never write `"3 days"` inline — use `trialDayWord` with `trialDays`, or pick the pre-built label that matches the sentence shape. Never write `"$9"` inline — use `monthly` ("$9"), `monthlyCadence` ("$9/month"), or `monthlyUsd` (the raw `9`, for arithmetic). The pricing badge uses `valueLabel` ("3-day free trial included"). `freeMonthlyCredits` (3) is enforced by the reflection API route; the UI reads the same constant so the numbers can't drift.

---

## Payment provider

`app/lib/payment.ts` exports `PAYMENT`: `providerName` ("Dodo Payments"), `checkoutApiRoute`, `invoicesApiRoute`, `portalUrl()`, `portalLabel`, `manageLabel`, `checkoutTrustLine`, `billingManagedLine`.

**Migration state.** New subscribers go through Dodo Payments (`app/api/dodo/*`). Existing Stripe subscriptions keep running via `app/api/stripe/webhook/route.ts`, which is on the NEVER TOUCH list until every legacy subscription has expired. When that happens, the Stripe routes and `STRIPE_*` env vars can be removed; until then, the webhook stays. The UI layer is provider-agnostic — every "Dodo Payments" string in the product comes from `PAYMENT.providerName`, so the switchover was one file, not thirty.

---

## Legacy Tailwind remapping

The bottom third of `globals.css` (from "LEGACY TAILWIND → QUIET MIRROR REMAPPING" through "SVG FILL / STROKE OVERRIDES") is a safety net. It intercepts any use of Tailwind's `emerald-*`, `green-*`, `teal-*`, `slate-*`, `gray-*` palette classes — background, text, border, ring, divide, placeholder, decoration, accent, shadow-colour, fill, stroke, gradient stops — and redirects them to the right `--qm-*` token. This exists so that inherited code and AI-generated components don't visually regress.

It is not a licence to keep writing `bg-emerald-500`. The remap uses `!important`, which makes legitimate overrides harder and makes specificity debugging painful. **Migrate on sight.** If you touch a file that uses these classes, convert them to `bg-qm-accent` or the appropriate semantic token in the same commit.

An earlier, separate `--hvn-*` CSS-var shim (a remnant of the pre-rename "Havenly" days) was retired in PRs #108/#109 once the last callers had been migrated. Nothing in the codebase references `--hvn-*` or `hvn.*` any more — if you see those names, they're a stale reference to delete, not something to preserve.

The `havenly:*` localStorage keys and the `havenly_auth` BroadcastChannel are a different kind of legacy — those are NEVER TOUCH because renaming them would strand users mid-magic-link. New storage keys use the `qm:` prefix (e.g. `qm:locale`).

---

## The metadata rule

Covered in full in [`docs/I18N.md`](I18N.md#the-metadata-rule) and enforced by ESLint: **never `export const metadata` from a `"use client"` component**, and in general, prefer `generateMetadata` in a sibling server `layout.tsx` so titles and descriptions respect the user's locale. This is a design-system concern too — the metadata you export becomes the text in browser tabs, Open Graph cards, and search results, which is as much of a surface as the page itself.

---

## Adding a new token

Rare — the token system is deliberately small, and the four semantic categories cover most new needs. Before adding anything, ask whether an existing token already carries the meaning you want. If your "accent green" is really a success state, it's `--qm-positive`. If your "muted brand" is really a secondary accent, it's `--qm-accent-2-soft`.

When a genuinely new token is warranted:

1. **Add the `--qm-*` variable** in `globals.css` — both `:root` (dark default) and the `@media (prefers-color-scheme: light)` block. Use a darker shade for light mode if the token represents a colour that needs contrast against cream.
2. **Add the Tailwind alias** in `tailwind.config.ts` under the `qm` key, pointing at the variable with `"var(--qm-your-token)"`.
3. **If it's a semantic status**, provide all seven variants (`base`, `strong`, `hover`, `soft`, `border`, `muted`, `bg`) — partial coverage breaks the mental model.
4. **If it's a data-viz token**, declare only once (no light/dark variants) — data-viz colours are theme-independent by policy.

Document the token's meaning in `globals.css` the same way the existing ones are — a short comment explaining when to reach for it is the only thing stopping the next person from adding a near-duplicate.
