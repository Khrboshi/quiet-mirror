# Security

## Reporting a vulnerability

Email **hello@quietmirror.me**. We will respond within 48 hours.

## Known issues and remediation plan

### Next.js CVEs — RESOLVED

| CVE | Severity | Status |
|---|---|---|
| GHSA-h25m-26qc-wcjf — HTTP request deserialization DoS | High | ✅ Fixed |
| GHSA-9g9p-9gw9-jx7f — Image Optimizer DoS | High | ✅ Fixed |
| GHSA-ggv3-7p47-pfv8 — HTTP request smuggling in rewrites | High | ✅ Fixed |
| GHSA-3x4c-7xq6-9pq8 — next/image disk cache growth | High | ✅ Fixed |
| GHSA-q4gf-8mx6-v5v3 — Server Components DoS | High | ✅ Fixed |
| GHSA-c2c7-rcm5-vvqj — picomatch ReDoS (transitive) | High | ✅ Fixed |
| GHSA-48c2-rrv3-qjmp — yaml DoS (transitive) | Medium | ✅ Fixed |
| CVE-2025-29927 — middleware authorization bypass | Critical (9.1) | ✅ Fixed |

**Resolution:** all of the above are fixed in the Next.js 15.x line. The
application runs **Next.js 15.5.24** as of 31 August 2026, which is past the
patch level for every entry above, including 15.2.3 for CVE-2025-29927.

Note on CVE-2025-29927 specifically: Vercel-hosted deployments were shielded at
the edge, so the live site was not exposed even before the version bump. The
durable lesson stands — middleware should supplement authorization, not be the
only layer. Row Level Security enforces access at the database, independently of
middleware.

### Dependency monitoring

GitHub Dependabot alerts and security updates are **enabled** as of 31 August
2026, with the dependency graph and grouped security updates on. New advisories
now raise a pull request automatically rather than waiting for a manual audit.

Open vulnerability count fell from 59 to 12 on 31 August 2026 after merging
dependency updates covering `sharp`, `form-data`, `next`, `postcss`, `ws`,
`js-yaml`, `qs`, `nanoid` and `@protobufjs/utf8`.

### Rate limiting and abuse controls — verified

Verified 31 August 2026. There is no rate limiting in `middleware.ts`, and this
is **not** a gap:

- **AI spend** — `app/api/ai/reflection/route.ts` performs a plan check and
  consumes a credit atomically *before* the inference call, with a refund path
  if generation fails. Free accounts are limited to 3 reflections per month.
- **Auth email** — `app/api/auth/send-magic-link/route.ts` delegates to Supabase
  `signInWithOtp`. Supabase Auth applies per-IP rate limits configured at project
  level. Custom SMTP via Resend is enabled with a 60-second minimum interval per
  user, so the development-only 2-emails-per-hour default does not apply.
- **Payment webhooks** — `app/api/dodo/webhook` and `app/api/stripe/webhook` are
  called by payment providers, not end users. These must **never** be rate
  limited; doing so can drop genuine payment notifications.

Additionally, the `middleware.ts` matcher covers page routes only and does not
run on `/api` at all, so middleware-level rate limiting would not reach the AI
routes regardless.

### Data protection

Row Level Security is enabled on **every** table in the public schema, verified
in the Supabase dashboard on 31 August 2026. `journal_entries`, `profiles`,
`user_credits`, `user_plans` and `reflection_usage` carry own-row policies for
select, insert, update and delete. `email_subscribers`,
`email_subscribe_attempts` and `upgrade_intents` have RLS enabled with no
policies, which returns no rows through the Data API.

### Backups — partially closed, 2 September 2026

The Supabase project remains on the **Free plan, which includes no automated
backups and no point-in-time recovery**. Two mitigations were put in place on
2 September 2026:

**Schema in version control.** `supabase/schema/schema_2026-09-02.sql` holds the
complete public schema — 12 tables, 34 RLS policies, 9 functions, 4 triggers.
Before this, none of that existed outside the live Supabase dashboard: the three
files in `supabase/migrations/` contain no `CREATE TABLE` and one `CREATE POLICY`.
The file was checked for personal data before committing and contains none.

**Daily dump.** `.github/workflows/db-backup.yml` runs at 03:00 UTC and on demand,
dumping schema and data as a private artifact retained 90 days. It verifies the
result by counting tables, policies and `COPY` blocks and **fails the job** if
thresholds are not met, so an empty backup alerts rather than passing quietly.
Dumps are never committed; `.gitignore` blocks `*.sql` outside `supabase/migrations/`
and `supabase/schema/`. **This repository is public and a data dump contains every
user's journal entries in plain text.**

**Two limits remain open:**

- GitHub disables scheduled workflows after 60 days of repository inactivity. If
  that happens the job does not run at all, and no run is indistinguishable from a
  successful one. This is the same failure that stopped `weekly-summaries.yml`
  between 20 July and 1 September 2026. No alerting exists for it yet.
- The backup has never been restore-tested. An untested backup is an assumption.

Supabase Pro (daily backups plus 7-day PITR) remains the correct answer once there
is revenue. Tracked in `BETA_READINESS.md` — the copy at the repository root, not
the stale one under `docs/`.

### Database credentials

The Postgres password is used by no application code. `lib/supabase/server.ts` and
`lib/supabase/browser.ts` authenticate with the project URL plus the anon or
service-role key. Resetting the database password therefore cannot break the live
site, and it should be reset on any suspicion of exposure.

### dangerouslySetInnerHTML — not a vulnerability

`app/blog/[slug]/page.tsx` uses `dangerouslySetInnerHTML` to inject a
JSON-LD structured data `<script>` tag. The data source is
`app/blog/articles.ts` — a hardcoded static TypeScript file compiled into
the application. There is no user input, no database content, and no
external data in this pipeline. This is a standard, universally accepted
SEO pattern and does not represent an XSS vulnerability.

### @img/sharp-libvips LGPL — not a vulnerability

LGPL-3.0 requires open-sourcing modifications to the LGPL library itself,
not the application that dynamically links to it. This does not affect
Quiet Mirror's proprietary codebase.
