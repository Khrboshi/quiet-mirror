"use client";

import RequirePremium from "@/app/components/RequirePremium";
import Link from "next/link";
import { useUserPlan } from "@/app/components/useUserPlan";

export default function PremiumPage() {
  const { credits, renewalDate, planType } = useUserPlan();

  const readablePlan =
    planType === "PREMIUM"
      ? "Premium"
      : planType === "TRIAL"
      ? "Trial"
      : "Free";

  const isPremium = planType === "PREMIUM";

  const displayCredits = isPremium ? "Unlimited" : (credits ?? 0);

  const displayRenewal = renewalDate
    ? renewalDate
    : isPremium
    ? null
    : "—";

  const premiumFeatures = [
    {
      title: "Unlimited reflections",
      body: "Use Havenly on every entry, not just a few times a month.",
    },
    {
      title: "Full pattern insights",
      body: "See recurring themes, emotional loops, and what keeps returning over time.",
    },
    {
      title: "Weekly personal summary",
      body: "A concise paragraph written for you based on the week across your entries.",
    },
    {
      title: "Deeper why-this-keeps-happening insight",
      body: "Go beyond description and get a clearer sense of what may be underneath repeating experiences.",
    },
  ];

  const waysToUse = [
    "When the same issue keeps showing up in different forms",
    "When you know something feels off but cannot name it yet",
    "When your entries are starting to build a fuller pattern",
    "When you want reflection that feels more cumulative and connected",
  ];

  return (
    <RequirePremium>
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
          <header className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
              Havenly Premium
            </p>

            <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Your deeper reflection space
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
              Premium is where Havenly becomes more than a private journal. It starts
              connecting entries across time so you can see what keeps repeating, what is
              shifting, and what may be underneath it.
            </p>
          </header>

          <section className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/60 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-200">Your plan</p>
                  <p className="mt-1 text-sm text-slate-400">
                    You are currently on the{" "}
                    <span className="font-medium text-emerald-300">{readablePlan}</span> plan.
                  </p>
                </div>

                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                  Active
                </span>
              </div>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    Reflections
                  </dt>
                  <dd className="mt-2 text-2xl font-semibold text-white">
                    {displayCredits}
                  </dd>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    Subscription
                  </dt>
                  <dd className="mt-2 text-lg font-medium text-white">
                    {displayRenewal ?? (
                      <Link
                        href="/settings/billing"
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        View billing →
                      </Link>
                    )}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.05] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400/80">
                  What Premium is for
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Premium is most valuable when your entries are starting to form a story
                  larger than any single day. It helps Havenly connect that story more
                  clearly.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/journal/new"
                  className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
                >
                  Write a new entry
                </Link>

                <Link
                  href="/insights"
                  className="rounded-full border border-slate-700 px-5 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
                >
                  View insights
                </Link>

                <Link
                  href="/settings/billing"
                  className="rounded-full border border-slate-700 px-5 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800"
                >
                  Manage subscription
                </Link>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-emerald-500/20 bg-emerald-500/[0.04] p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
                Included in Premium
              </p>

              <div className="mt-5 space-y-4">
                {premiumFeatures.map(({ title, body }) => (
                  <div key={title} className="flex items-start gap-3">
                    <span className="mt-1 text-emerald-400">&#10003;</span>
                    <div>
                      <p className="text-sm font-medium text-white">{title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-400">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/40 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                When Premium helps most
              </p>

              <ul className="mt-5 space-y-3">
                {waysToUse.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-slate-300">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/40 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Example of the shift
              </p>

              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-600">
                  Without the deeper layer
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  "I know this keeps happening, but I still cannot tell what the real pattern is."
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.05] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-400/80">
                  With Premium
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  "My entries keep circling the same mix of over-responsibility, emotional
                  exhaustion, and difficulty asking for help. It is not random anymore."
                </p>
              </div>

              <div className="mt-5">
                <Link
                  href="/insights/preview"
                  className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
                >
                  Preview a sample insight view &rarr;
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[1.75rem] border border-white/10 bg-slate-900/30 p-6">
            <p className="text-sm font-semibold text-white">A few practical notes</p>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-slate-200">Privacy</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Your entries stay private and are not used to train AI models.
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-200">Billing</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  You can manage or cancel your subscription from Settings at any time.
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-200">Best use</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Premium becomes more useful as entries accumulate, but it does not require daily writing.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </RequirePremium>
  );
}
