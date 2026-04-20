# Quiet Mirror

A private AI journal that reads what you write and gently reflects it back.

Live site: https://quietmirror.me

## Languages

Quiet Mirror currently ships in six languages, including one right-to-left script. The authoritative list lives in `app/lib/i18n/locales.ts` (`LOCALE_REGISTRY`).

The i18n system is custom TypeScript (no `next-intl`, no JSON catalogues). See [`docs/I18N.md`](docs/I18N.md) for the architecture, the metadata rule enforced by ESLint, and how to add translations.

## Design system

Colours, typography, brand strings, pricing, and payment labels all derive from a small set of authoritative files — no hardcoded hexes, brand names, or prices in components. See [`docs/DESIGN.md`](docs/DESIGN.md) for the `--qm-*` token system, component classes, and the legacy Tailwind remap.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:
- `NEXT_PUBLIC_SITE_URL` should be `https://quietmirror.me`
- Add your Groq API key for AI reflections
- Add your Supabase credentials
- Add Stripe keys for Premium billing 
