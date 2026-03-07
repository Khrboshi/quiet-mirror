"use client";

import RequirePremium from "@/app/components/RequirePremium";
import Link from "next/link";
import { useUserPlan } from "@/app/components/useUserPlan";

export const metadata = {
  title: "Havenly Premium — Unlock Pattern Insights",
  description: "Upgrade to Premium for unlimited reflections, full pattern insights across all your entries, and a weekly personal summary written just for you.",
  openGraph: {
    title: "Havenly Premium",
    description: "Unlimited reflections, full pattern insights, and a weekly personal summary.",
    url: "https://havenly-2-1.vercel.app/premium",
  },
};



export default function PremiumPage() {
  const { credits, renewalDate, planType } = useUserPlan();

  const readablePlan =
    planType === "PREMIUM"
      ? "Premium"
      : planType === "TRIAL"
      ? "Trial"
      : "Free";

  return (
    <RequirePremium>
      <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl space-y-8">
          <header>
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-300">
              Havenly Premium
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              A deeper reflection space
            </h1>

            <p className="mt-3 max-w-xl text-sm text-white/70">
              Premium gives you more room to reflect, higher limits, and early
              access to deeper insight tools as they’re released.
            </p>
          </header>

          <section className="grid gap-6 md:grid-cols-[1.4fr,1fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="text-lg font-semibold">Your plan</h2>

              <p className="mt-2 text-sm text-slate-200">
                You’re on the{" "}
                <span className="font-medium text-emerald-300">
                  {readablePlan}
                </span>{" "}
                plan.
              </p>

              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">
                    Credits available
                  </dt>
                  <dd className="mt-1">{credits ?? 0}</dd>
                </div>

                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">
                    Next renewal
                  </dt>
                  <dd className="mt-1">{renewalDate || "—"}</dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/journal/new"
                  className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  Write a new entry
                </Link>

                <Link
                  href="/settings/billing"
                  className="rounded-full border border-slate-700 px-5 py-2.5 text-sm hover:bg-slate-800"
                >
                  Manage subscription
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-200">
              <h3 className="text-base font-semibold text-white">
                What Premium includes
              </h3>

              <ul className="mt-3 space-y-2">
                <li>• Higher monthly reflection limits</li>
                <li>• Richer AI reflection depth</li>
                <li>• Priority access to new tools</li>
                <li>• Early access to Premium features</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </RequirePremium>
  );
}
