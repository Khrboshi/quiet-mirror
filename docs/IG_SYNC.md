> **Current operating state — 2026-08-22:** Instagram is an organic acquisition experiment, not a separate product project. Link to the main Quiet Mirror homepage. During early access, use “full access · no charge” and never advertise an active trial or payment CTA.

# docs/IG_SYNC.md
### Cross-project sync — Quiet Mirror Dev ↔ Quiet Mirror IG
**Last updated: May 14, 2026**
Paste this file at session start in whichever project you're working in.
It captures only the facts that cross the boundary between projects.
Full product rules → SKILL.md · Full IG rules → quiet-mirror-ig SKILL

---

## Product state (what the site actually does right now)

| Fact | Value | Relevant to IG? |
|---|---|---|
| Top commit | `be4957c` (#218) | No |
| `PRICING.earlyAccess` | `true` | **Yes — see below** |
| Price | $25/month (visible on /upgrade, no card required now) | **Yes** |
| Free features | All premium features open to all signed-up users | **Yes** |
| CTAs on /upgrade | "Sign up free →" (links to /magic-login) | **Yes** |
| Trial | 3-day free trial (wired, not shown while earlyAccess:true) | No |
| Testimonial slot | Wired on /upgrade — dark (empty strings in en.ts) | **Yes** |
| Open PRs | 0 | No |
| Vercel prod | READY — #218 live | No |

### What earlyAccess:true means for IG copy
- Do **not** mention "3-day free trial" in captions or stories — the trial flow is hidden
- Do **not** say "start your trial" — the CTA is "sign up free"
- **Do** say: "free to use", "sign up free", "no card needed"
- The $25/month price is still visible on /upgrade — fine to reference as "what it will cost when pricing goes live"
- All premium features (reflections, patterns, weekly summary) are fully unlocked for anyone who signs up

### When earlyAccess flips to false
Trigger: Dodo Payments e2e test completes (real transaction + withdrawal confirmed).
When this happens in the dev project:
- IG copy must immediately switch from "free to use" → "3-day free trial, $25/month"
- Update this file + notify IG project at next session

---

## IG state (what Instagram actually is right now)

| Fact | Value | Relevant to dev? |
|---|---|---|
| Handle | @quietmirror.me | No |
| Followers | 1 | No |
| Posts live | 1 (Post 9 — "A private journal that reads underneath") | No |
| Testimonial collected | None yet | **Yes** |
| First Tier A comment | Left on @the.holistic.psychologist (May 14) | No |
| Grid complete | May 30, 2026 (Posts 8→1 publishing every other day) | No |

---

## Bridge items — require action in BOTH projects

### 1. Testimonial (open — HIGH priority)
**IG side:** Watch comments on Posts 3, 7, and 2 most closely. If someone writes more than one genuine sentence, DM them for permission.
**Dev side:** Once a real quote + attribution exists, add to `en.ts` under `upgradeFull.testimonialQuote` and `upgradeFull.testimonialAttribution`. Run i18n-sync → push → auto-translate handles 5 non-EN locales. The slot on /upgrade renders immediately.
**Current status:** Slot dark. No quote yet.

### 2. earlyAccess flip (pending Dodo e2e)
**Dev side:** Set `PRICING.earlyAccess: false` in `app/lib/pricing.ts`. No other files change. Push.
**IG side:** Caption language must change — "sign up free" → "start your 3-day free trial". Stories and bio link may need updating.
**Current status:** Blocked on Dodo Payments e2e test.

### 3. Dodo Payments e2e (final launch gate)
**Dev side:** Run a real test transaction through the Dodo dashboard. Confirm webhook fires, subscription row appears in Supabase, withdrawal clears.
**IG side:** No action until confirmed complete. Then earlyAccess flips (see above).
**Current status:** Not yet done.

---

## Sync triggers — update this file when any of these happen

| Event | Which project acts | What to update here |
|---|---|---|
| Dodo e2e confirmed | Dev | earlyAccess status, CTA language |
| earlyAccess flipped to false | Dev | Product state table, IG copy rules |
| First testimonial collected via IG | IG | Bridge item #1 status |
| Testimonial shipped to /upgrade | Dev | Bridge item #1 → closed |
| New i18n keys added that affect public copy | Dev | Note if copy appears on pages IG links to |
| Bio or /upgrade CTA changes | Dev | IG copy rules section |
| IG follower milestone (100, 500, 1000) | IG | Note here for potential social proof on site |
| Post with strong save rate identified | IG | Note the pillar — may inform homepage copy direction |

---

## How to use this file

**In the Quiet Mirror project:** Paste at session start after SKILL.md. Check bridge items before writing any user-facing copy. If earlyAccess changes, update this file as part of the PR.

**For Instagram operations:** Paste at session start. Check "What earlyAccess:true means for IG copy" before writing any caption. Check bridge items for testimonial status.

**Updating:** Copy this file from the repo, edit the relevant section, paste back as a new version. The repo is the source of truth — `docs/IG_SYNC.md`.

## Instagram readiness plan — August 2026

### Positioning

Instagram should introduce Quiet Mirror as a calm, private journaling tool that helps people notice patterns without pretending to diagnose them. The profile should link to the existing Quiet Mirror homepage and describe early access accurately: full access at no charge while the product is being shaped.

### Content pillars

- **Reflective prompts:** short, useful questions people can try immediately.
- **Pattern awareness:** gentle examples of noticing routines, emotions, and boundaries without clinical claims.
- **Product clarity:** show the journal-to-reflection-to-Insights loop using fictional examples only.
- **Trust and privacy:** explain what Quiet Mirror does and does not claim, without implying medical treatment or guaranteed transformation.
- **Build-in-public learning:** share improvements based on testing, never fabricated testimonials or traction.

### Launch rules

- Use the existing homepage as the only destination; do not create a separate Instagram product or landing page.
- Keep payments and Premium promotion inactive while early access is free.
- Do not recruit outside testers until the beta-readiness gate and clean-account retention test pass.
- Do not use QA records, fictional entries, or invented testimonials as social proof.
- Do not reconnect the cancelled Instagram integration unless explicitly requested.
- Avoid diagnostic, therapeutic, crisis-resolution, or guaranteed-outcome language.

### Measurement

Use a tracked homepage URL for Instagram traffic and measure profile visits, link clicks, signup completion, first journal entry, reflection received, and 3–7 day return. Treat Instagram as an acquisition experiment only after a clean internal retention signal exists.

### Readiness checklist

1. Confirm the homepage messaging, language selector, mobile layout, and early-access CTA.
2. Prepare the profile bio, avatar, highlights, and first 9–12 posts from the content pillars above.
3. Add a stable Instagram UTM link to the existing homepage.
4. Complete the clean-account retention run and remaining beta reliability checks.
5. Publish organically, review real-user language feedback, and improve the product before scaling reach.

## Operating correction

Instagram is a channel, not a separate project. All product changes, homepage changes, tracking, and source-of-truth documentation remain in Quiet Mirror. Instagram preparation uses the content starter pack in docs/IG_CONTENT_STARTER.md. The cancelled Instagram integration stays disconnected unless explicitly requested.

## Existing account baseline — checked August 23, 2026

The existing public account is @quietmirror.me at https://www.instagram.com/quietmirror.me/. Public search currently reports 3 followers, 20 following, and 13 posts. Its visible bio direction is: “A private journal that reads underneath. Write honestly. See what keeps returning.”

This account should be improved in place, not replaced. Preserve the reflective tone and evolve the bio only enough to clarify the product, the existing homepage destination, and free early access. The follower/post counts are a baseline only, not evidence of product traction. Recheck the profile directly in Instagram before publishing because public search data can lag.

### Account-specific next actions

1. Keep the current handle and reflective positioning.
2. Review the existing 13 posts for visual consistency, repeated themes, and any claims that need correction.
3. Update the link-in-bio to the existing homepage with Instagram UTM tracking.
4. Add or refine highlights: Start here, Prompts, How it works, Privacy, Early access.
5. Publish the three prepared launch posts only after homepage/mobile checks and the clean-account retention gate.

## Live homepage check — August 23, 2026

The live homepage at https://quietmirror.me/ is currently behind the approved source state: it still displays $25/month, a 3-day free trial, Premium-forward CTAs, and “Used by people carrying more than they’ve named out loud.” This must be treated as a launch blocker because payments are disabled and there are no confirmed real users.

The current source contains early-access guards, so the likely action is to deploy the latest approved application commit, then recheck the homepage in an incognito browser. Confirm that the live page says full access at no charge, does not imply user traction, and does not send Instagram visitors into an active payment flow.

**Owner action required:** trigger or confirm the application deployment, then report back with the deployed URL/version. Do not publish Instagram acquisition posts until this check passes.

### Deployment handoff

The latest application change affecting the homepage is commit 761cb54610c3815a69664c45fc8788aba9a25db7 (marketing: clarify private grounded early access offer). The current main branch also contains the documentation updates and ends at the latest branch head recorded in GitHub. Deploy main, then verify the live page against the early-access checklist before publishing.

## Privacy-first product growth loop

Instagram should bring people into Quiet Mirror through a useful prompt, not through pressure to follow or claims about results.

### Recommended loop

1. An Instagram post presents one reflective prompt.
2. The link opens the existing Quiet Mirror homepage or a future public prompt page.
3. The visitor creates an account and writes one private entry.
4. Quiet Mirror returns a grounded reflection.
5. After the reflection, the app offers a safe way to share the prompt or a generic branded card—not the journal entry, private reflection, or personal Insights.
6. The shared card links back to Quiet Mirror with a referral or campaign marker.
7. Measure first entry, reflection received, referral click, signup completion, and 3–7 day return.

### Product features worth building, in order

1. **Shareable prompt cards:** one-tap image or link sharing for prompts only; private content is excluded by default.
2. **Prompt-specific landing pages:** a public page for each strong Instagram prompt, with a clear start-writing CTA.
3. **Post-reflection referral prompt:** ask only after the user receives a reflection; keep it optional and low-pressure.
4. **Referral attribution:** preserve a referral marker from the shared link through signup without sending journal text to analytics.
5. **Return loop:** after a user returns, show a gentle reminder of the last prompt or a new prompt—not a notification campaign that creates pressure.

### Do not build yet

- Public journals or public reflections
- Automatic sharing of personal Insights
- Follow-gating or forced social invites
- Leaderboards, streak pressure, or competitive wellness claims
- Paid Instagram acquisition before retention is proven

### Success criteria

The first test is not follower count. It is whether an Instagram visitor completes a first entry, receives a reflection, and returns within 3–7 days. Only build broader sharing or referral mechanics if the first-entry experience is trusted and retained.

## Direct profile audit — August 23, 2026

Screenshots show the existing account now has 14 posts, 3 followers, and 20 following. The dark, cream, and muted green visual system is coherent. The profile already communicates private journaling, grounded reflection, patterns over time, and a free start. The current UTM homepage link is present.

### Manual polish actions

1. Refine the bio to: “Private journaling for honest reflection. Write → reflect → notice patterns. Early access: full access at no charge ↓”
2. Keep the current handle, profile image, and visual palette. Do not delete the existing posts.
3. Rename “What it is” to “Start here” and add highlights for Prompts, How it works, Privacy, and Early access. Remove or fill the empty “New” highlight.
4. Pin three posts: the clearest product explanation, the strongest prompt, and the privacy/private-journal post.
5. Check future post text inside the safe center area so Instagram’s grid crop does not cut off words.
6. Publish three posts per week for four weeks: two useful prompts and one product/trust post. Ask people to save or share a prompt, not merely to follow.

The page is ready for controlled organic publishing after the homepage custom-domain check and the internal 3–7 day retention test.
