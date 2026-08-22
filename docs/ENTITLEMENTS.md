# Entitlements, trials, and early access

_Last reviewed: 2026-08-22_

## Current commercial state

Quiet Mirror is currently in **early-access mode**. Payment activation is intentionally paused while the payment-provider flow is completed and tested. Users receive the available product experience without being charged.

Early access is not a subscription and must never be recorded as PREMIUM unless a real payment-provider subscription exists.

## Plan states

The canonical entitlement value is user_credits.plan_type and supports:

| State | Meaning | Access while early access is enabled |
|---|---|---|
| FREE | Standard free tier | Full product through the early-access override |
| TRIAL | Time-limited promotional trial | Full access during its active period |
| PREMIUM | Paid, active subscription | Full access |
| EARLY_ACCESS | Explicit beta entitlement | Full access; non-billable |

PREMIUM is reserved for trusted payment webhooks or trusted administrative operations. Client code must never set it.

## Trial behavior

PRICING.trialDays is currently 3 and drives public copy. It is not, by itself, a running timer. A production trial must have explicit trial_started_at and trial_ends_at values and must be configured at the payment provider before the 3-day claim is presented as an active checkout offer.

The application should determine trial eligibility and expiry server-side. The client must not be the source of truth for trial time or billing status.

## Ending early access

Recommended launch sequence:

1. Confirm Dodo/Stripe product, trial, webhook, cancellation, and failed-payment behavior in test mode.
2. Confirm no active user is attached to an unintended paid subscription.
3. Set PRICING.earlyAccess to false and deploy.
4. Verify that checkout remains blocked until payment configuration is deliberately enabled.
5. Enable checkout only after the provider test passes.
6. Re-run protected-route, journal, reflection, Insights, billing, and cancellation tests.

The server-side checkout route must fail closed while early access is enabled. Turning early access off does not create a subscription or generate a charge.

Before assigning persistent EARLY_ACCESS rows to individual users, add an early_access_ends_at field or cohort table. A global early-access switch is safe for the current beta; per-user early access must have an explicit expiry.

## No retroactive charges

Early-access usage does not create a payment-provider subscription. Charges can occur only through a provider-created subscription with a valid billing relationship. Plan changes in Supabase do not backdate usage into a provider invoice.

The checkout guard, trusted webhook assignment, and separation of EARLY_ACCESS from PREMIUM are required protections.

## Data retention

Changing FREE, TRIAL, PREMIUM, or EARLY_ACCESS updates entitlement/credit state only. Journal entries, AI reflections, and Insights history remain linked to the same user ID. Plan history is retained separately when recorded.

Plan changes must never delete journal data. Account deletion is a separate destructive operation and may cascade-delete account-owned records according to the database foreign-key policy.

## Required future fields

Before payment launch, add and audit:

- trial_started_at
- trial_ends_at
- early_access_ends_at or an early-access cohort table
- billing_provider
- subscription_id
- plan_changed_at
- an append-only plan-change/audit record

## Source of truth

- Pricing and global early-access switch: app/lib/pricing.ts
- Plan type normalization: lib/planUtils.ts
- Credit and entitlement rules: lib/creditRules.ts
- Payment transitions: app/api/dodo/webhook/ and legacy app/api/stripe/webhook/
- Checkout protection: app/api/dodo/checkout/
- Database hardening and plan constraints: supabase/migrations/20260822131000_security_and_entitlements.sql
