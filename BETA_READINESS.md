# Quiet Mirror — SaaS Beta Readiness

_Last reviewed: 2026-08-23_

This is the release gate for the internal beta. Do not recruit outside testers or promote the Instagram account until every **must pass** item is verified.

## Current operating rule

Quiet Mirror remains in internal, non-billable early access. Users receive full access at no charge. Payments stay disabled. Test data must be fictional and isolated from real-user measurement.

## Verified

- [x] Journal creation and persistence
- [x] AI reflection generation and persistence
- [x] Practical schedule/routine entries stay grounded in stated facts
- [x] Insights aggregation and display
- [x] Login, logout, protected routes, and magic-link flow
- [x] Early-access entitlement grants full access
- [x] Early-access settings copy distinguishes it from paid Premium
- [x] Plan changes preserve journals, reflections, and Insights
- [x] Checkout is blocked while early access is enabled
- [x] Supabase entitlement/security hardening completed
- [x] TypeScript, ESLint, and i18n key synchronization passed previously
- [x] Public homepage copy aligned with non-billable early access

## Must pass before outside testers

### Product reliability

- [ ] Fresh-account smoke test from signup through first reflection
- [ ] Returning-user smoke test after logout and relogin
- [ ] Empty states: journal, reflection, Insights, and weekly summary
- [ ] Network/API failures show recoverable messages and do not lose typed entries
- [ ] Duplicate-submit protection for journal and reflection actions
- [ ] Refresh/back-button behavior does not duplicate or corrupt entries
- [ ] Delete-entry behavior is explicit and data-safe
- [ ] Mobile viewport and keyboard test on iOS and Android browsers
- [ ] Accessibility pass: keyboard navigation, focus states, labels, contrast, reduced motion

### AI quality and safety

- [ ] Test at least 30 fictional entries across practical, work, relationship, health, identity, grief, money, creative, and neutral topics
- [ ] Confirm reflections stay grounded in the entry and do not diagnose, prescribe, or invent facts
- [ ] Confirm practical entries avoid unsupported distress, burnout, identity, or creative-block language
- [ ] Check repetition across consecutive reflections and across the same topic
- [ ] Test short, long, ambiguous, multilingual, empty, and hostile input
- [ ] Verify model/API failure fallback and retry behavior
- [ ] Review Insights summaries for unsupported claims and repetitive wording
- [ ] Confirm sensitive text is not written to client logs, fallback logs, or analytics payloads

### Entitlements and payments

- [ ] Confirm a new account receives EARLY_ACCESS/full access without a payment record
- [ ] Confirm no trial countdown or charge is created during early access
- [ ] Confirm expired/invalid trial state resolves safely to FREE, not paid Premium
- [ ] Confirm client cannot elevate its own plan
- [ ] Confirm webhook handling is idempotent and rejects untrusted plan changes
- [ ] Confirm checkout remains blocked in production
- [ ] Confirm plan transitions never delete user content
- [ ] Add per-user early-access cohort/expiry before extending early access beyond the current controlled beta

### Privacy and security

- [ ] Re-run Supabase security advisors after final database changes
- [ ] Verify RLS with two separate users: no cross-user journal, reflection, Insights, or entitlement access
- [ ] Verify server-only/admin tables cannot be queried from the browser
- [ ] Verify auth callback, redirect, and logout cannot be abused for open redirects
- [ ] Verify AI requests are server-side and provider credentials never reach the client
- [x] Verify rate limits or abuse controls for AI generation and email requests — **verified 31 Aug 2026.** AI spend capped by the credit check inside the reflection route before any paid call; auth email capped by Supabase Auth per-IP limits plus a 60s per-user minimum on custom SMTP. Payment webhooks deliberately excluded. See `SECURITY.md`
- [ ] Verify account deletion and data-retention behavior before inviting real testers

### Measurement

- [x] Signup attempt and email-sent events
- [x] Journal submitted event
- [x] Reflection received event
- [x] Upgrade modal/page events
- [x] Insights viewed event
- [ ] Return-visit event with a documented once-per-session/user definition
- [ ] Confirm events appear in the intended PostHog project with no journal text in properties
- [ ] Exclude or label QA/test accounts so they cannot contaminate beta metrics
- [ ] Run a 3–7 day internal retention test

### Production and operations

- [ ] Verify the latest production deployment on quietmirror.me in an incognito browser
- [ ] Verify no stale trial, monthly price, Premium CTA, or unsupported social-proof copy remains on public early-access pages
- [ ] Verify email delivery, sender identity, and magic-link expiry
- [ ] Verify Vercel runtime logs and error visibility for failed AI/auth requests
- [x] Confirm backup/recovery expectations for database and user content — **checked 31 Aug 2026: there were none.** Partially addressed 2 Sep 2026. The full schema (12 tables, 34 RLS policies, 9 functions, 4 triggers) is now committed at `supabase/schema/schema_2026-09-02.sql`, and `.github/workflows/db-backup.yml` dumps schema and data daily at 03:00 UTC to a private 90-day artifact, failing the job if the dump is empty or partial. **Two gaps remain before outside testers:** GitHub disables scheduled workflows after 60 days of repository inactivity and nothing alerts on that, and the backup has never been restore-tested. Supabase Pro (daily backups + 7-day PITR) remains the correct answer once there is revenue. See `SECURITY.md`
- [ ] Record the exact build commit used for the internal beta

## Release decision

Outside beta is approved only when all **Must pass before outside testers** items are checked or explicitly waived in writing. Instagram content and acquisition experiments begin only after the product, data, and measurement gates pass.

## Database advisor backlog

The latest Supabase performance advisor review found optimization notices, not correctness failures: RLS policies can wrap `auth.uid()` in a scalar `select`, some foreign keys lack covering indexes, and several tables have overlapping permissive policies. These should be consolidated or indexed in a planned migration after functional QA, with special care not to weaken isolation. They are not a reason to enable payments or invite outside testers by themselves, but they remain technical-debt items before scale.

The security review continues to show only the documented server-only RLS notices, the intentional credit-consumption SECURITY DEFINER warning, and Free-plan leaked-password protection limitations.

## Verified state and next actions — August 2026

Verified: early access is non-billable, payments are disabled, QA data is excluded from traction claims, journal/reflection persistence works, sparse Insights are cautious through five entries, Neutral is hidden from prominent Insights UI, practical entries use grounded handling, and all six locales with 1,029 keys pass the deterministic localization audit. AI grammar review is report-only by default.

Next: deploy and smoke-test the latest commits; create a clean internal account; run a 3–7 day retention test; complete mobile, accessibility, failure/retry, account-isolation, and broader fictional AI tests. Do not recruit outside testers or enable payments until these gates pass.

## Manual smoke test recorded — August 23, 2026

A fresh internal test account successfully completed sign-in, created one fictional journal entry, received a reflection, saw it marked as saved to history, found it in the Journal list, and saw the first pattern on the Dashboard. This confirms the basic first-entry funnel in the preview deployment. It is not a retention or traction result.

Next check: return to the same account tomorrow and again around day 3. Confirm the account remains accessible, the original entry remains present, a second entry can be added, and Insights continue to load.

## Day 2 return test recorded — August 24, 2026

The same dedicated fictional test account returned successfully. The two journal entries remained available, the second reflection was generated and saved, the Journal list showed 2 entries across 2 writing days, and the Dashboard showed a cautious 2/5 pattern-forming state. This is positive product evidence, but not yet a retention or market result.

Next check: open Insights today, then perform one final return check around day 3.

## Sparse-data Insights check recorded — August 24, 2026

With two fictional entries, Insights loaded successfully and used appropriate safeguards. It stated that there was not enough history to identify a recurring pattern, described the result as an early signal, and clarified that the patterns are not diagnoses. This confirms the cautious sparse-data behavior in the deployed experience.

## Third-entry test recorded — August 24, 2026

A third fictional entry was created successfully. The reflection was generated and saved, the Journal showed 3 entries, and the Dashboard moved to 3/5 while still reporting only 2 writing days. The gradual pattern state remains appropriately cautious.

## Three-entry Insights check recorded — August 24, 2026

With three fictional entries, Insights loaded successfully and remained appropriately cautious. It continued to say there was not enough history for a firm recurring pattern, described the result as an early reflection, and limited the displayed pattern signal to 1× across 3 entries. The page did not present the result as a diagnosis or certainty.

## Day 3 return test recorded — August 25, 2026

The dedicated fictional test account returned on the third day through the real quietmirror.me domain. All three entries remained accessible, the Journal loaded, and the Dashboard retained the cautious 3/5 pattern-forming state across 2 writing days. This completes the initial internal 3-day return check. It is positive product evidence, not market traction.

Next: begin one controlled organic Instagram post, keep payment disabled, and measure the path from link click to signup, first entry, reflection received, and return.
