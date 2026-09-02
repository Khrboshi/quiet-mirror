# Quiet Mirror

A private AI journal that reads what you write and gently reflects it back — then, over time, shows you the patterns you've been too close to see.

Live site: https://quietmirror.me · Repo: Khrboshi/quiet-mirror

---

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth)
Groq / OpenAI GPT OSS 20B (`openai/gpt-oss-20b`) · Resend (transactional + newsletter email)
Dodo Payments (new subscribers) · Stripe webhook (legacy — **never touch**) · Vercel Hobby · PostHog EU cloud

> **Before payments go live:** Vercel's Hobby plan is restricted to personal, non-commercial use, and their fair-use terms define commercial usage to include any deployment that requests or processes payment from visitors. A **Pro upgrade is required before enabling Dodo billing**, not after. Supabase is on the Free plan, which has no automated backups and no point-in-time recovery — mitigated since 2 Sep 2026 by a daily dump workflow (see Backups below), but Supabase Pro remains the correct answer once there is revenue. See `BETA_READINESS.md`.

---

## Backups

*Added 2 September 2026.*

Supabase Free provides no automated backups and no point-in-time recovery. Two things now stand in for that:

| What | Where | Notes |
|---|---|---|
| Schema, RLS policies, functions, triggers | `supabase/schema/schema_2026-09-02.sql` — committed | 12 tables, 34 policies, 9 functions, 4 triggers. Contains **no user data**. Safe in a public repo |
| Daily schema + data dump | `.github/workflows/db-backup.yml` | Runs 03:00 UTC and on demand. Uploads a private artifact, retained 90 days. **Never commits dumps to the repo** |

The workflow verifies the dump by counting tables, policies and `COPY` blocks — it **fails the job** if the thresholds are not met, so an empty or partial backup raises an alert rather than passing silently.

**Two known limits.** GitHub disables scheduled workflows after 60 days of repository inactivity; if that happens the job does not run at all, and no run looks identical to a successful one. And the backup has not been restore-tested. Both are open.

`.gitignore` excludes `*.sql` with an explicit exception for `supabase/migrations/*.sql` and `supabase/schema/*.sql`. **This repo is public and a data dump contains every user's journal entries in plain text** — do not weaken that rule.

**The schema in `supabase/migrations/` is not complete.** The three migration files only `ALTER` existing tables; they contain no `CREATE TABLE` and one `CREATE POLICY`. The full structure lives in `supabase/schema/`.

---

## Languages

Ships in six languages including one right-to-left script (Arabic).
Authoritative list: `app/lib/i18n/locales.ts` → `LOCALE_REGISTRY`.

i18n is custom TypeScript — no `next-intl`, no JSON catalogues, no runtime fetching.
See [`docs/I18N.md`](docs/I18N.md) for the full architecture, ESLint metadata rule, and how to add translations.

CI enforces stub presence across all 6 locales on every PR — a missing stub exits 1 and blocks the build.
New stubs are auto-translated into all 5 non-English locales on merge via `.github/workflows/i18n-auto-translate.yml`.

Current key count: authoritative source is `node scripts/i18n-sync.mjs`, which CI runs on every PR. **Note:** this README previously stated 985 keys here and 1,029 under "Current beta status" — the two disagreed. Run the script rather than trusting either number.

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

## Workflows

`.github/workflows/ci.yml` runs on every PR — all three must be green before merge:

1. `tsc --noEmit` — type check (catches locale drift before Vercel does)
2. `npm run lint` — ESLint quality gate
3. `node scripts/i18n-sync.mjs` — exits 1 if any of the 6 locales is missing a key stub

Six workflows exist in total. Scheduled ones are listed with their state as of 2 Sep 2026 — **check the Actions tab rather than trusting this table**, since GitHub disables schedules after 60 days of repository inactivity:

| Workflow | Trigger | State |
|---|---|---|
| `ci.yml` | Every PR | Active |
| `db-backup.yml` | Daily 03:00 UTC + manual | **Active** — added 2 Sep 2026, first run verified |
| `weekly-summaries.yml` | Mondays | **Deliberately disabled** — generates English for every user regardless of language. Re-enable after durable locale storage ships |
| `i18n-grammar-check.yml` | Scheduled | Disabled — decide whether to re-enable |
| `i18n-auto-translate.yml` | On merge | Active |
| `dead-code-analysis.yml` | Scheduled | State not verified |

---

## Environment variables

Copy `.env.example` to `.env.local`. **Names below verified against `process.env` reads in the codebase, 2 Sep 2026.**

```
NEXT_PUBLIC_SITE_URL=https://quietmirror.me
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com   # optional — defaults to EU cloud

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

GROQAPIKEY=...              # canonical name. GROQ_API_KEY is a legacy fallback
GROQMODEL=...               # optional — defaults to DEFAULT_GROQ_MODEL in app/lib/ai/groq.ts

RESEND_API_KEY=...          # Transactional + newsletter email
UNSUBSCRIBE_SECRET=...      # HMAC-SHA256 key for one-click unsubscribe tokens

CRON_SECRET=...             # Must match the GitHub Actions secret of the same name

DODO_PAYMENTS_API_KEY=...
DODO_PAYMENTS_WEBHOOK_KEY=...
DODO_PAYMENTS_PRODUCT_ID=...
DODO_PAYMENTS_ENVIRONMENT=... # "test_mode" | "live_mode"

STRIPE_SECRET_KEY=...       # Legacy webhook only — never touch
STRIPE_WEBHOOK_SECRET=...   # Legacy webhook only — never touch
STRIPE_PRICE_ID=...         # Legacy
STRIPE_PORTAL_RETURN_URL=... # Legacy
```

**Three discrepancies with `.env.example`, unresolved as of 2 Sep 2026:**

1. `UNSUBSCRIBE_SECRET` is **missing from `.env.example`** despite being documented here and required by `app/lib/unsubscribeToken.ts`. Without it the code falls back to `NEXTAUTH_SECRET`, then to a hardcoded dev string that is visible in this public repo. It **is** set in Vercel, so production is not exposed — but the example file should list it.
2. `.env.example` sets `GROQMODEL=llama-4-scout-17b-16e-instruct`, and the comment at the top of `app/lib/ai/groq.ts` says the same. The live value is `openai/gpt-oss-20b`, which is also what `DEFAULT_GROQ_MODEL` returns. Three places disagree with production.
3. `.env.example` documents `CREDITS_ADMIN_KEY` as "required if you use `/api/user/credits/add`". **That route does not exist** and no code reads that variable.

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
| [`BETA_READINESS.md`](BETA_READINESS.md) | **Authoritative launch checklist.** Note: a second copy exists at `docs/BETA_READINESS.md` and is **stale** — it is missing the 31 Aug rate-limit verification and the backup findings. Delete it or replace it with a pointer; do not read it |
| [`SECURITY.md`](SECURITY.md) | RLS posture, rate-limit reasoning, backup state, non-vulnerabilities |
| [`docs/BRAND.md`](docs/BRAND.md) | Authoritative copy map — every marketing string, its key, its source file |
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | Product intent, UI standards, forbidden UI/copy patterns |
| [`docs/DESIGN.md`](docs/DESIGN.md) | Design token system, component classes, RTL/Arabic rules |
| [`docs/I18N.md`](docs/I18N.md) | i18n architecture, locale workflow, how to add translations |
| [`docs/POSTHOG_FUNNEL.md`](docs/POSTHOG_FUNNEL.md) | All 12 PostHog events, 3 funnel specs, healthy benchmarks |
| [`docs/PRODUCT_BRIEF.md`](docs/PRODUCT_BRIEF.md) | Business context, target user, revenue model, launch checklist |
| [`docs/ENTITLEMENTS.md`](docs/ENTITLEMENTS.md) | Plan contract, safe shutdown, no-retroactive-charge guarantee |

## Entitlements and payment readiness

Quiet Mirror is currently in non-billable early access. The product distinguishes FREE, TRIAL, PREMIUM, and EARLY_ACCESS; early access grants full product access but is not a paid subscription. The 3-day trial is a future billing configuration, not the current early-access offer; do not present it as active while earlyAccess is true. See docs/ENTITLEMENTS.md for the plan contract, safe shutdown procedure, no-retroactive-charge guarantee, and data-retention rules.

## Current beta status

Quiet Mirror is in a controlled, non-billable early-access beta. Payments are disabled; early access grants full access at no charge and is separate from the future Premium plan. QA and fictional records are not user traction.

Verified: journal and reflection persistence, conservative sparse Insights through five entries, grounded practical-entry handling, Neutral-label cleanup, and six locales with 1,029 keys passing the deterministic localization audit. AI grammar review is report-only by default.

Next: run a clean-account 3–7 day retention test, then complete mobile, accessibility, failure/retry, account-isolation, and broader fictional AI testing before outside recruitment or payment activation.
