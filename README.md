# Quiet Mirror

A private AI journal that reads what you write and gently reflects it back.

Live site: https://quietmirror.me · Repo: Khrboshi/quiet-mirror

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth) · Groq / Llama 4 Scout (AI reflections) · Resend (transactional email) · Dodo Payments (new subscribers) · Stripe webhook (legacy — never touch) · Vercel · PostHog EU cloud

## Languages

Ships in six languages including one right-to-left script. Authoritative list: `app/lib/i18n/locales.ts` (`LOCALE_REGISTRY`).

i18n is custom TypeScript — no `next-intl`, no JSON catalogues. See [`docs/I18N.md`](docs/I18N.md) for the architecture, ESLint metadata rule, and how to add translations. CI enforces stub presence across all 6 locales on every PR.

## Design system

Colours, typography, brand strings, pricing, and payment labels derive from authoritative source files — no hardcoded values in components. See [`docs/DESIGN.md`](docs/DESIGN.md) for the `--qm-*` token system and component classes.

| Concern | Source file |
|---|---|
| Brand / app name / tagline | `app/lib/config.ts` → `CONFIG` |
| Pricing numbers | `app/lib/pricing.ts` → `PRICING` |
| Payment provider strings | `app/lib/payment.ts` → `PAYMENT` |
| Shared marketing copy | `app/lib/marketing.ts` → `MARKETING` |
| Copy decisions | `docs/BRAND.md` |
| Product intent / UI standards | `docs/REQUIREMENTS.md` |
| PostHog event reference | `docs/POSTHOG_FUNNEL.md` |

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every PR:
1. `tsc --noEmit` — type check
2. `npm run lint` — ESLint
3. `node scripts/i18n-sync.mjs` — missing locale stubs

All three must be green before merge.

## Environment Variables

Copy `.env.example` to `.env.local`:

```
NEXT_PUBLIC_SITE_URL=https://quietmirror.me
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

GROQ_API_KEY=...            # Llama 4 Scout via Groq

RESEND_API_KEY=...          # Transactional email
UNSUBSCRIBE_SECRET=...      # HMAC key for one-click unsubscribe

DODO_PAYMENTS_API_KEY=...
DODO_PAYMENTS_WEBHOOK_KEY=...
DODO_PAYMENTS_PRODUCT_ID=...
DODO_PAYMENTS_ENVIRONMENT=... # "test" | "live"

STRIPE_SECRET_KEY=...       # Legacy webhook only — never touch
STRIPE_WEBHOOK_SECRET=...   # Legacy webhook only — never touch
```

## Payment migration state

New subscribers → Dodo Payments (`app/api/dodo/*`)
Legacy subscribers → Stripe webhook only (`app/api/stripe/webhook/`) — **NEVER TOUCH**

The Stripe webhook handler must remain until all legacy subscriptions have expired.
