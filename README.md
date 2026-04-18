# Quiet Mirror

A private AI journal that reads what you write and gently reflects it back.

Live site: https://quietmirror.me

## Languages

Quiet Mirror ships in 6 languages: English, Ukrainian, Arabic, French, Dutch, and Romanian.

The i18n system is custom TypeScript (no `next-intl`, no JSON catalogues). See [`docs/I18N.md`](docs/I18N.md) for the architecture, the metadata rule enforced by ESLint, and how to add translations.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:
- `NEXT_PUBLIC_SITE_URL` should be `https://quietmirror.me`
- Add your Groq API key for AI reflections
- Add your Supabase credentials
- Add Stripe keys for Premium billing 
