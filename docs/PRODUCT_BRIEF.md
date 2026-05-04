# Product Brief — Quiet Mirror

> **What this file is:** The business and product context for Quiet Mirror.
> It answers: who this is for, what it must deliver, what success looks like,
> and how to prioritise what to build next.
>
> **What this file is not:** A design spec (→ `DESIGN.md`), a copy map
> (→ `BRAND.md`), or a UI standards doc (→ `REQUIREMENTS.md`).
>
> **Keep this file honest.** If the target changes, update it here.

---

## 1. The business in one paragraph

Quiet Mirror is a live, production SaaS journaling product built and run
by a solo founder. It has been in development for over a year and is
approaching its first full commercial launch. The product earns revenue
through a monthly Premium subscription. The near-term goal is to reach
**$5,000 net profit per month**. At $19/month that requires approximately
274 paying subscribers — a focused, achievable number for the right niche.

Current monthly running costs: ~$110 (AI inference, domain, tooling).

---

## 2. The user we are building for

Not a demographic. A situation:

> Someone carrying something they cannot say out loud. They are private by
> nature, skeptical of extractive tools, and not looking for advice or
> motivation. They want a place to think — and they want something to show
> them what they could not see from inside it.

More specifically:

- They write because they process through writing, not because they were told to
- They have enough self-awareness to know something is off, but not enough
  distance to name it clearly
- They value privacy deeply — the idea that their entries train AI or get sold
  is a dealbreaker
- They do not want a streak, a score, or a coach. They want recognition
- They are willing to pay for something that genuinely helps — and they will
  cancel without guilt if it does not

This user does not respond to urgency, gamification, or social proof.
They respond to honesty, specificity, and restraint.

---

## 3. The core promise

> *Quiet Mirror shows you what you were missing between the lines of what
> you wrote.*

Every product decision should be tested against this sentence. If a feature,
copy line, or UI pattern does not serve this promise — it does not ship.

The product is **not** therapy, a habit tracker, a mood logger, a chatbot,
or a productivity tool. It is a private journal with an AI layer that reads
underneath what the user writes and, over time, surfaces the patterns they
are too close to see.

---

## 4. What "value for money" means here

At $19/month, the user is not paying for cloud storage or a prettier textarea.
They are paying for the AI layer that reads across weeks of entries and shows
them something real. Value is communicated through:

- A reflection that makes them feel genuinely seen — not summarised
- Patterns that name something they had sensed but not been able to say
- An interface that does not get in the way
- Honesty about what the product can and cannot do

Value is **never** communicated through feature counts, comparison tables
inside the app, or "you're getting X worth of Y" framing.

---

## 5. Revenue model

| Tier | Price | What it includes |
|---|---|---|
| Free | $0 | Unlimited journaling · 3 AI reflections/month · Gentle prompts |
| Premium | $19/month | Unlimited reflections · Full pattern insights · Weekly summary · Why-this-keeps-happening layer |

**Trial:** 3 days full access, no charge until day 4. Cancel anytime.

Free users are real users, not a conversion funnel to be pressured.
Premium is depth added — not features locked away punitively.

> **Note on pricing:** The product currently shows $9/month. The price is
> confirmed to move to $19/month — this is a single one-line change in
> `app/lib/pricing.ts` that propagates everywhere. It will be made immediately
> before full public launch, not before.

---

## 6. The path to $5k/month net

- **Target:** 274 paying subscribers at $19/month = ~$5,106 gross
- **After costs (~$110):** ~$4,996 net
- **What that requires:** A steady conversion funnel from free → paid,
  driven by the first reflection experience being genuinely compelling

The funnel in order of leverage:
1. **First reflection** — the moment a new user gets their first AI reflection
   is the highest-leverage conversion event. If it feels generic, they leave.
   If it feels like it saw something real, they upgrade.
2. **Onboarding clarity** — a new signup should reach their first reflection
   in under 2 minutes, with no friction.
3. **The upgrade page** — honest, no pressure, clear on what Premium adds.
   Already in good shape.
4. **The homepage** — already has strong copy, demo examples, and trust signals.
   The CTA flow is clear.

---

## 7. Launch readiness checklist

Things that must be true before full public launch:

- [ ] Price updated to $19/month — one line in `app/lib/pricing.ts`, done last
- [ ] **Payment processor confirmed and working** — Dodo Payments is integrated
  for new subscribers but the ability to receive and withdraw funds to a bank
  account must be verified end-to-end before charging real users. This is the
  most critical pre-launch gate after the product itself.
- [ ] First-reflection onboarding flow verified end-to-end on mobile
- [ ] PostHog funnel reviewed — understand where users drop off today
- [ ] Reflection quality spot-checked across all 10 domains (WORK, RELATIONSHIP,
  HEALTH, MONEY, GRIEF, PARENTING, CREATIVE, IDENTITY, FITNESS, GENERAL)

---

## 8. What not to build (yet)

Things that would feel like progress but are not the constraint right now:

- More journaling prompts — the product already has starter prompts; the
  problem is not blank pages
- Social features — fundamentally off-brand; the user chose this because
  it is private
- Mobile app (native) — the PWA is sufficient for launch; native is a
  post-revenue investment
- More AI models / providers — Groq/Llama 4 Scout is working well
- Blog content — only valuable once there is traffic to capture

The constraint right now is: **get the first 274 people to pay and stay.**
Everything else is a distraction until that number is reached.

---

## 9. How to use this document

When evaluating a proposed change, ask:

1. Does it serve the core promise (§3)?
2. Does it move the user toward their first paid reflection?
3. Does it respect the user we are building for (§2)?
4. Is it on the launch checklist (§7) — or is it a distraction (§8)?

If the answer to 1–3 is no, or the answer to 4 is "distraction" — it waits.
