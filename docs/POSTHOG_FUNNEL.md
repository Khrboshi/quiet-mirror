# PostHog Funnel — Verification Reference

> **What this file is:** The single source of truth for every PostHog event
> Quiet Mirror fires. Use it to verify the funnel in the PostHog dashboard,
> build Insights/Funnels, and confirm event data looks correct.
>
> **Last audited:** 2026-05-05 against commit `1f52fd7` (PR #170)
>
> **Dashboard status:** All 3 funnels built and live on the Quiet Mirror PostHog
> dashboard — Core Conversion Funnel, Upgrade Path, Activation.
> Authorized URL `https://quietmirror.me` configured. Health: Ingestion ✅
> SDKs ✅ Data modeling ✅ Pipelines ✅ Web analytics 4/6 (reverse proxy +
> $web_vitals are optional post-launch improvements, not launch blockers).

---

## Configuration

| Setting | Value |
|---|---|
| PostHog region | EU cloud (`eu.i.posthog.com`) |
| Persistence | `localStorage` (survives client-side navigation) |
| Autocapture | Disabled — only explicit `track()` calls fire |
| Person profiles | `always` — anonymous users get profiles too |
| Page views | Manual (`$pageview` via `PostHogPageView` component) |
| Identity | Supabase user ID, linked on sign-in via `posthog.identify()` |
| Fallback | Pre-hydration events go to `/api/telemetry` → Vercel Runtime Logs (not PostHog) |

---

## User Identity

**Where:** `app/components/SupabaseSessionProvider.tsx`

| Trigger | Call | Payload |
|---|---|---|
| Sign-in | `posthog.identify(userId)` | `{ email: user.email }` |
| Sign-out | `posthog.reset()` | — |

**What to check in PostHog:**
- Person records should show `email` as a person property
- Events before sign-in are anonymous; after identify they merge into the person record

---

## The Conversion Funnel

The primary funnel in order of user journey:

```
signup_attempted
    ↓
signup_email_sent
    ↓
journal_submitted        ← activation
    ↓
reflection_received      ← highest-leverage conversion moment (PRODUCT_BRIEF §6)
    ↓
paywall_hit / upgrade_modal_opened / upgrade_page_viewed
    ↓
subscription_started     ← conversion
```

---

## Event Reference

### 1. `signup_attempted`

**Where:** `app/magic-login/page.tsx`
**When:** User submits the magic-link/OTP form — fires before the Supabase call, so it captures intent even on failure. Guarded: does NOT re-fire if the user re-sends after a successful delivery (`status !== 'success'` check).

| Property | Type | Values | Notes |
|---|---|---|---|
| `mode` | string | `"link"` \| `"code"` | Which OTP method the user selected |

**PostHog check:**
- Should appear for every unique sign-up attempt
- `mode` breakdown shows link vs code preference
- If this count ≫ `signup_email_sent`, it means Supabase OTP calls are failing

---

### 2. `signup_email_sent`

**Where:** `app/magic-login/page.tsx`
**When:** Supabase OTP call succeeded — magic link/code was delivered.

| Property | Type | Values | Notes |
|---|---|---|---|
| `mode` | string | `"link"` \| `"code"` | Which OTP method was used |

**PostHog check:**
- `signup_attempted → signup_email_sent` drop-off = OTP failure rate
- Count should be close to `signup_attempted` count; large gap = Supabase/Resend issue

---

### 3. `journal_submitted`

**Where:** `app/components/JournalForm.tsx`
**When:** User submits a journal entry (POST to `/api/journal/new` succeeds).

| Property | Type | Values | Notes |
|---|---|---|---|
| `word_count` | number | any | Raw word count of the entry |
| `word_count_bucket` | string | `"<50"` \| `"50-150"` \| `"150-300"` \| `"300+"` | Bucketed for cohort analysis |
| `has_title` | boolean | `true`/`false` | Whether user filled in a title |
| `had_prompt` | boolean | `true`/`false` | Whether a prompt was pre-loaded |
| `is_first_entry` | boolean | `true`/`false` | `true` when user has 0 prior entries at page load |
| `days_since_last_entry` | number \| null | any \| `null` | `null` on first entry; days elapsed since last entry otherwise |

**PostHog check:**
- Filter `is_first_entry: true` to see activation rate (signup → first write)
- `word_count_bucket` breakdown shows engagement depth
- `days_since_last_entry` distribution reveals retention patterns

---

### 4. `reflection_received`

**Where:** `app/(protected)/journal/[id]/JournalEntryClient.tsx`
**When:** AI reflection fetch completes successfully (the reflection text appears on screen). This is the highest-leverage conversion event per PRODUCT_BRIEF §6.

| Property | Type | Values | Notes |
|---|---|---|---|
| `is_first_entry` | boolean | `true`/`false` | `true` when this is the user's only entry (count === 1 in DB at page load) |
| `domain` | string | `WORK` \| `RELATIONSHIP` \| `HEALTH` \| `MONEY` \| `GRIEF` \| `PARENTING` \| `CREATIVE` \| `IDENTITY` \| `FITNESS` \| `GENERAL` | AI-classified domain of the entry |
| `word_count` | number | any | Word count of the journal entry content |

**PostHog check:**
- Filter `is_first_entry: true` to isolate the critical first-reflection cohort
- `domain` breakdown shows what users write about most
- `journal_submitted → reflection_received` drop-off = reflection failure rate (API errors, timeouts)

---

### 5. `paywall_hit`

**Where:** `app/components/RequirePremium.tsx`
**When:** A free user lands on a Premium-gated page/component. De-duplicated with `useRef` — fires exactly once per component mount regardless of effect re-runs.

| Property | Type | Values | Notes |
|---|---|---|---|
| `plan` | string | `"FREE"` | Current plan type (fallback to `"FREE"` if not resolved yet) |

**PostHog check:**
- This is the entry to the upgrade funnel for users who hit a gate organically
- Compare to `upgrade_modal_opened` — do gated users convert to modal views?

---

### 6. `upgrade_modal_opened`

**Where:** `app/components/UpgradeTriggerModal.tsx`
**When:** The upgrade modal is rendered and the open effect fires (snapshot of `source` taken at open time to avoid stale closure).

| Property | Type | Values | Notes |
|---|---|---|---|
| `source` | string | varies | Where the modal was triggered from (e.g. `"paywall"`, `"journal"`, etc.) |

**PostHog check:**
- `source` breakdown shows which triggers are most effective
- `upgrade_modal_opened → subscription_started` = modal conversion rate

---

### 7. `upgrade_modal_cta_clicked`

**Where:** `app/components/UpgradeTriggerModal.tsx`
**When:** User clicks the primary CTA button inside the upgrade modal.

| Property | Type | Values | Notes |
|---|---|---|---|
| `source` | string | varies | Same source as `upgrade_modal_opened` |
| `href` | string | URL | The CTA destination URL |

**PostHog check:**
- Intermediate step between modal view and page view
- If `upgrade_modal_opened ≫ upgrade_modal_cta_clicked`, modal copy/UX is failing

---

### 8. `upgrade_page_viewed`

**Where:** `app/components/UpgradeIntentTracker.tsx`
**When:** The upgrade page mounts (fires once via `useEffect`).

| Property | Type | Values | Notes |
|---|---|---|---|
| `source` | string | varies | How the user arrived at the upgrade page |

**PostHog check:**
- `upgrade_page_viewed → subscription_started` = page conversion rate
- Compare users who came from `upgrade_modal_cta_clicked` vs direct navigation

---

### 9. `subscription_started`

**Where:** `app/upgrade/confirmed/SubscriptionStartedTracker.tsx`
**When:** The post-payment confirmation page mounts. This is the conversion event.

| Property | Type | Values | Notes |
|---|---|---|---|
| `plan` | string | `"PREMIUM"` | Always `"PREMIUM"` currently |

**PostHog check:**
- This is the bottom of the funnel — the money event
- Person should now have `plan: PREMIUM` as a person property (set via Supabase, not PostHog)
- If you see duplicates: the component has a `useRef` guard — investigate if the confirmed page is being loaded twice

---

### 10. `email_capture_submitted`

**Where:** `app/components/EmailCapture.tsx`
**When:** User submits the email capture form successfully.

| Property | Type | Values | Notes |
|---|---|---|---|
| `source` | string | varies | Where the capture form is rendered |

**PostHog check:**
- Pre-conversion lead capture — measures email list growth intent
- Not a funnel step; treat as a separate metric

---

### 11. `install_prompt_dismissed` / `install_prompt_clicked_install` / `install_prompt_outcome`

**Where:** `app/components/InstallPrompt.tsx`
**When:** PWA install prompt interactions.

| Event | Key Properties |
|---|---|
| `install_prompt_dismissed` | `reason`, `pathname` |
| `install_prompt_clicked_install` | `pathname` |
| `install_prompt_outcome` | `pathname`, `outcome` |

**PostHog check:**
- Secondary signal — PWA adoption rate
- `outcome` on `install_prompt_outcome` comes from the browser's `BeforeInstallPromptEvent`

---

### 12. `$pageview` (automatic)

**Where:** `app/components/PostHogProvider.tsx` → `PostHogPageView`
**When:** Every client-side route change.

| Property | Type | Notes |
|---|---|---|
| `$current_url` | string | Full URL including query string |

**PostHog check:**
- Built-in PostHog path analysis works on these
- Key paths to watch: `/`, `/magic-login`, `/dashboard`, `/journal/new`, `/journal/[id]`, `/upgrade`, `/upgrade/confirmed`

---

## Suggested PostHog Funnels to Build

### Funnel A — Core Conversion (homepage → paying)
```
1. $pageview  where $current_url contains "/"  (homepage)
2. signup_attempted
3. signup_email_sent
4. journal_submitted  where is_first_entry = true
5. reflection_received  where is_first_entry = true
6. subscription_started
```

### Funnel B — Upgrade Path (reflection → payment)
```
1. reflection_received
2. paywall_hit  OR  upgrade_modal_opened
3. upgrade_page_viewed
4. subscription_started
```

### Funnel C — Activation (signup → first reflection)
```
1. signup_email_sent
2. journal_submitted  where is_first_entry = true
3. reflection_received  where is_first_entry = true
```

---

## Known Limitations & Edge Cases

| Situation | Behaviour | Impact |
|---|---|---|
| PostHog not yet hydrated (very early page load) | Events go to `/api/telemetry` → Vercel Runtime Logs only, not PostHog | Small gap in PostHog data for pre-hydration events; acceptable |
| User blocks trackers / strict browser privacy | PostHog may not load at all; fallback route also silently fails | Events silently lost; no workaround without server-side tracking |
| `is_new_user` on signup | Not tracked — Supabase OTP doesn't reveal new vs returning without a DB lookup | Cannot distinguish new signups from returning users via PostHog alone |
| `subscription_started` on page refresh | `useRef` guard prevents double-fire within a session | Safe; if the confirmed page is reloaded in a new tab, it will fire again |
| Domain classification | `domain` on `reflection_received` is AI-assigned; `GENERAL` is the fallback | May over-index on `GENERAL` if classifier is uncertain |

---

## What "Healthy" Looks Like

Once meaningful traffic flows, these benchmarks are reasonable targets:

| Funnel step | Healthy drop-off |
|---|---|
| `signup_attempted → signup_email_sent` | < 5% (OTP failures) |
| `signup_email_sent → journal_submitted (first)` | < 40% (onboarding friction) |
| `journal_submitted → reflection_received` | < 10% (API reliability) |
| `reflection_received → upgrade_page_viewed` | < 70% (conversion intent) |
| `upgrade_page_viewed → subscription_started` | < 60% (page conversion) |

These are starting benchmarks — tune once you have 50+ users through the funnel.
