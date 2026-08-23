# Quiet Mirror

A private AI journal that reads what you write and gently reflects it back — then, over time, shows you the patterns you've been too close to see.

Live site: https://quietmirror.me · Repo: Khrboshi/quiet-mirror

---

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth)
Groq / OpenAI GPT OSS 20B (`openai/gpt-oss-20b`) · Resend (transactional + newsletter email)
Dodo Payments (new subscribers) · Stripe webhook (legacy — **never touch**) · Vercel Hobby · PostHog EU cloud

---

## Languages

Ships in six languages including one right-to-left script (Arabic).
Authoritative list: `app/lib/i18n/locales.ts` → `LOCALE_REGISTRY`.

i18n is custom TypeScript — no `next-intl`, no JSON catalogues, no runtime fetching.
See [`docs/I18N.md`](docs/I18N.md) for the full architecture, ESLint metadata rule, and how to add translations.

CI enforces stub presence across all 6 locales on every PR — a missing stub exits 1 and blocks the build.
New stubs are auto-translated into all 5 non-English locales on merge via `.github/workflows/i18n-auto-translate.yml`.

Current key count: **985 keys** across 6 locales (en / uk / ar / fr / nl / ro).

---

## Design system

All colours, typography, brand strings, pricing, and payment labels derive from authoritative source files — no hardcoded values in components. See [`docs/DESIGN.md`](docs/DESIGN.md) for the full `--qm-*` token system, Tailwind aliases, utility classes, and RTL/Arabic support.

| Concern | Source file |
|---|---|
| Brand / app name / tagline / email | `app/lib/config.ts` → `CONFIG` |
| Pricing numbers and trial length | `app/lib/pricing.ts` → `PRICING` |
| Payment provider strings and routes | `app/lib/payment.ts` → `PAYMENT` |
| Shared marketing copy (multi-namespace) | `app/lib/marketing.ts` → `MARKETING` |
| AI Groq client | `app/lib/ai/groq.ts` → `getGroqConfig()` |
| Copy decisions and editorial voice | `docs/BRAND.md` |
| Product intent / UI standards / forbidden patterns | `docs/REQUIREMENTS.md` |
| PostHog event reference and funnel specs | `docs/POSTHOG_FUNNEL.md` |
| Business context and launch checklist | `docs/PRODUCT_BRIEF.md` |

---

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every PR — all three must be green before merge:

1. `tsc --noEmit` — type check (catches locale drift before Vercel does)
2. `npm run lint` — ESLint quality gate
3. `node scripts/i18n-sync.mjs` — exits 1 if any of the 6 locales is missing a key stub

---

## Environment variables

Copy `.env.example` to `.env.local`:

```
NEXT_PUBLIC_SITE_URL=https://quietmirror.me
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

GROQ_API_KEY=...            # OpenAI GPT OSS 20B via Groq

RESEND_API_KEY=...          # Transactional + newsletter email
UNSUBSCRIBE_SECRET=...      # HMAC-SHA256 key for one-click unsubscribe tokens

DODO_PAYMENTS_API_KEY=...
DODO_PAYMENTS_WEBHOOK_KEY=...
DODO_PAYMENTS_PRODUCT_ID=...
DODO_PAYMENTS_ENVIRONMENT=... # "test" | "live"

STRIPE_SECRET_KEY=...       # Legacy webhook only — never touch
STRIPE_WEBHOOK_SECRET=...   # Legacy webhook only — never touch
```

---

## Payment migration state

| Subscriber type | Provider | Code path |
|---|---|---|
| New subscribers | Dodo Payments | `app/api/dodo/*` |
| Legacy subscribers | Stripe (webhook only) | `app/api/stripe/webhook/` — **NEVER TOUCH** |

The Stripe webhook handler must remain active until all legacy Stripe subscriptions have expired and are confirmed inactive.

---

## Key docs

| Doc | Purpose |
|---|---|
| [`docs/BRAND.md`](docs/BRAND.md) | Authoritative copy map — every marketing string, its key, its source file |
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | Product intent, UI standards, forbidden UI/copy patterns |
| [`docs/DESIGN.md`](docs/DESIGN.md) | Design token system, component classes, RTL/Arabic rules |
| [`docs/I18N.md`](docs/I18N.md) | i18n architecture, locale workflow, how to add translations |
| [`docs/POSTHOG_FUNNEL.md`](docs/POSTHOG_FUNNEL.md) | All 12 PostHog events, 3 funnel specs, healthy benchmarks |
| [`docs/PRODUCT_BRIEF.md`](docs/PRODUCT_BRIEF.md) | Business context, target user, revenue model, launch checklist |

## Entitlements and payment readiness

Quiet Mirror is currently in non-billable early access. The product distinguishes FREE, TRIAL, PREMIUM, and EARLY_ACCESS; early access grants full product access but is not a paid subscription. The 3-day trial is a future billing configuration, not the current early-access offer; do not present it as active while earlyAccess is true. See docs/ENTITLEMENTS.md for the plan contract, safe shutdown procedure, no-retroactive-charge guarantee, and data-retention rules.

## Current beta status

Quiet Mirror is in a controlled, non-billable early-access beta. Payments are disabled; early access grants full access at no charge and is separate from the future Premium plan. QA and fictional records are not user traction.

Verified: journal and reflection persistence, conservative sparse Insights through five entries, grounded practical-entry handling, Neutral-label cleanup, and six locales with 1,029 keys passing the deterministic localization audit. AI grammar review is report-only by default.

Next: run a clean-account 3–7 day retention test, then complete mobile, accessibility, failure/retry, account-isolation, and broader fictional AI testing before outside recruitment or payment activation.
