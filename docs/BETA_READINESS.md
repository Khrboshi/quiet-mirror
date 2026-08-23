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
- [ ] Verify rate limits or abuse controls for AI generation and email requests
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
- [ ] Confirm backup/recovery expectations for database and user content
- [ ] Record the exact build commit used for the internal beta

## Release decision

Outside beta is approved only when all **Must pass before outside testers** items are checked or explicitly waived in writing. Instagram content and acquisition experiments begin only after the product, data, and measurement gates pass.
