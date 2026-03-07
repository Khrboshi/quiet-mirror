// app/upgrade/page.tsx
import Link from "next/link";
import PreviewInsightsLink from "./PreviewInsightsLink";
import UpgradeClient from "./UpgradeClient";
import PersonalizedTeaser from "./PersonalizedTeaser";
import CheckoutButton from "./CheckoutButton";

export const metadata = {
  title: "Havenly Premium — See what keeps happening",
  description: "Upgrade to Premium for unlimited reflections, full pattern insights, and a weekly personal summary written just for you.",
};

export default function UpgradePage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-20 text-slate-200">
      <UpgradeClient />

      {/* Header */}
      <header className="space-y-3 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-500/70">
          Havenly Premium
        </p>
        <h1 className="text-3xl font-semibold text-white leading-tight sm:text-4xl">
          Finally see why the same things keep happening.
        </h1>
        <p className="text-sm leading-relaxed text-slate-400">
          You already write. Premium adds the layer that turns entries into understanding —
          what repeats, what shifts, what the pattern actually is.
        </p>
      </header>

      {/* Personalised teaser */}
      <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500/70">
              Your pattern
            </p>
            <h3 className="font-medium text-slate-100">
              Something is quietly repeating in your entries.
            </h3>
            <PersonalizedTeaser />
          </div>
          <div className="shrink-0">
            <PreviewInsightsLink />
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            quote: "I didn't expect it to be this specific. The weekly summary named something I'd been feeling for months without being able to say it.",
            name: "M.L.",
            detail: "Premium, 6 weeks",
          },
          {
            quote: "I've spent a lot of money on therapy and journaling apps. This is the first one that actually shows me the pattern instead of just storing my entries.",
            name: "T.A.",
            detail: "Premium, 3 months",
          },
        ].map(({ quote, name, detail }) => (
          <div key={name} className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5">
            <p className="text-sm leading-relaxed text-slate-300 italic">&ldquo;{quote}&rdquo;</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-semibold text-slate-400">
                {name[0]}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">{name}</p>
                <p className="text-[10px] text-slate-600">{detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plan comparison */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Free */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Free</h2>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white">$0</span>
            <span className="text-sm text-slate-400">/ month</span>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            A private space to write. Enough to start.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-slate-400">
            {[
              "Write anytime — entries stay private",
              "3 AI reflections per month",
              "Gentle daily prompts",
              "Basic pattern insights",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-slate-600">&#10003;</span>
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/10 transition-colors"
            >
              Stay on Free
            </Link>
          </div>
        </div>

        {/* Premium */}
        <div className="relative flex flex-col rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-semibold text-white">Premium</h2>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              Early access
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-white">$30</span>
            <span className="text-sm text-slate-400">/ month</span>
          </div>
          <p className="mt-0.5 text-xs text-slate-600">Less than one therapy co-pay · cancel anytime</p>

          <p className="mt-3 text-sm text-slate-400">
            For people who want to understand themselves — not just document their days.
          </p>

          {/* Before / After */}
          <div className="mt-4 rounded-xl border border-slate-700/60 bg-slate-900/50 p-3 text-xs text-slate-400 space-y-1">
            <p><span className="text-slate-600">Before:</span> You know something keeps happening. You can't quite see what.</p>
            <p><span className="text-emerald-500/80">After:</span> Havenly shows you the pattern — and how long it's been there.</p>
          </div>

          <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
            {[
              { label: "Unlimited reflections", sub: "No monthly cap — reflect on every entry" },
              { label: "Full pattern insights", sub: "See what repeats across weeks and months" },
              { label: "Weekly personal summary", sub: "A paragraph written just for you" },
              { label: "\"Why does this keep happening?\" insights", sub: "The question you keep asking, answered" },
              { label: "Cancel anytime", sub: "No lock-in, no questions asked" },
            ].map(({ label, sub }) => (
              <li key={label} className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-emerald-400">&#10003;</span>
                <div>
                  <p className="text-slate-200">{label}</p>
                  <p className="text-xs text-slate-500">{sub}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-2">
            <CheckoutButton />
            <PreviewInsightsLink />
          </div>
          <p className="mt-3 text-center text-xs text-slate-600">
            Secure checkout via Stripe · Cancel anytime from Settings
          </p>
        </div>

      </div>

      {/* Mini FAQ */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-6">
        <p className="mb-5 text-sm font-semibold text-white">A few honest answers</p>
        <div className="space-y-5">
          {[
            {
              q: "What if I don't write very often?",
              a: "That's fine — Premium is still worth it. Patterns emerge from as few as 5–6 entries. The weekly summary reflects whatever you've written, even if it's just a few sentences.",
            },
            {
              q: "Will I be charged automatically every month?",
              a: "Yes — it renews monthly. You can cancel any time from Settings → Manage subscription, and you'll keep Premium until the end of your paid period.",
            },
            {
              q: "Is my data safe and private?",
              a: "Always. Your entries are never used to train AI models, never shared, and never shown to anyone. Havenly is built around the idea that your inner life belongs only to you.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-slate-800/40 pb-5 last:border-0 last:pb-0">
              <p className="text-sm font-medium text-slate-200">{q}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{a}</p>
            </div>
          ))}
        </div>
      </div>

    </main>
  );
}
