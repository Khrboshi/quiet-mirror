// app/settings/billing/page.tsx
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { ensureCreditsFresh } from "@/lib/creditRules";

export const dynamic = "force-dynamic";

type PlanType = "PREMIUM" | "TRIAL" | "FREE";

function PlanBadge({ plan }: { plan: PlanType }) {
  if (plan === "PREMIUM") {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
        Premium
      </span>
    );
  }
  if (plan === "TRIAL") {
    return (
      <span className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-300">
        Trial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/40 px-2.5 py-1 text-xs font-semibold text-slate-300">
      Free
    </span>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
      {subtitle ? (
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      ) : null}
    </div>
  );
}

export default async function BillingPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) redirect("/magic-login");

  // Ensure credits are fresh before reading plan
  await ensureCreditsFresh({ supabase, userId: user.id });

  const { data: credits } = await supabase
    .from("user_credits")
    .select("plan_type, renewal_date")
    .eq("user_id", user.id)
    .maybeSingle();

  const rawPlan = String((credits as any)?.plan_type ?? "FREE").toUpperCase();
  const plan: PlanType =
    rawPlan === "PREMIUM" ? "PREMIUM" : rawPlan === "TRIAL" ? "TRIAL" : "FREE";

  const isPaid = plan === "PREMIUM" || plan === "TRIAL";

  // Next billing date label
  const nextBillingLabel = isPaid && (credits as any)?.renewal_date
    ? new Date((credits as any).renewal_date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;

  // Show refund window notice if user is within 7 days of subscribing.
  // We derive the start date from renewal_date - 30 days.
  let refundDaysLeft: number | null = null;
  if (isPaid && (credits as any)?.renewal_date) {
    const renewalDate = new Date((credits as any).renewal_date);
    const startDate = new Date(renewalDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const daysSinceStart = Math.floor(
      (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceStart < 7) {
      refundDaysLeft = 7 - daysSinceStart;
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 text-slate-200">
      <header className="mb-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-white">Billing</h1>
            <p className="mt-2 text-sm text-slate-400">
              Manage your subscription and billing details.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PlanBadge plan={plan} />
            {isPaid ? (
              <a
                href="/api/stripe/portal?returnUrl=/settings/billing"
                className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
              >
                Manage subscription
              </a>
            ) : (
              <a
                href="/upgrade"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Upgrade to Premium
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Refund window notice — only visible within first 7 days of Premium */}
      {refundDaysLeft !== null && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-5 py-4">
          <span className="mt-0.5 text-base">🛡️</span>
          <div>
            <p className="text-sm font-semibold text-emerald-300">
              {refundDaysLeft === 1
                ? "Last day of your 7-day refund window"
                : `${refundDaysLeft} days left in your 7-day refund window`}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Not what you expected? Email{" "}
              <span className="text-slate-200">support@havenly.app</span> for a
              full refund — no questions asked.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Plan card */}
        <section className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
          <SectionTitle
            title="Plan"
            subtitle={
              plan === "PREMIUM"
                ? "Your Premium plan is active."
                : plan === "TRIAL"
                ? "You are on a free trial — full Premium access."
                : "You're on Free. Upgrade any time."
            }
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
              <h3 className="text-sm font-semibold text-white">
                {isPaid ? "Premium includes" : "Free includes"}
              </h3>

              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {isPaid ? (
                  <>
                    <li>• Unlimited AI reflections</li>
                    <li>• Pattern clarity across time</li>
                    <li>• Weekly personal summary</li>
                    <li>• Deeper insights without writing more</li>
                  </>
                ) : (
                  <>
                    <li>• Unlimited journaling</li>
                    <li>• Gentle prompts to begin</li>
                    <li>• 3 AI reflections per month</li>
                    <li>• Private by default</li>
                  </>
                )}
              </ul>

              {/* Bug #10/12 fix: show price and next charge date */}
              {isPaid && (
                <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Price</span>
                    <span className="font-medium text-slate-200">$30 / month</span>
                  </div>
                  {nextBillingLabel && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Next charge</span>
                      <span className="font-medium text-slate-200">{nextBillingLabel}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
              <h3 className="text-sm font-semibold text-white">
                {isPaid ? "Cancellations" : "Upgrade"}
              </h3>

              {isPaid ? (
                <p className="mt-2 text-sm text-slate-400">
                  Cancel anytime via{" "}
                  <a
                    href="/api/stripe/portal?returnUrl=/settings/billing"
                    className="text-emerald-300 hover:text-emerald-200"
                  >
                    Manage subscription
                  </a>{" "}
                  in Stripe.
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-400">
                  Premium unlocks unlimited reflections and deeper insights.
                </p>
              )}

              {/* Bug #11 fix: always-visible refund guarantee for paid users */}
              {isPaid && (
                <div className="mt-4 rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-3 py-2.5">
                  <p className="text-xs font-medium text-emerald-300">
                    🛡️ 7-day full refund guarantee
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Email <span className="text-slate-300">support@havenly.app</span> — no questions asked.
                  </p>
                </div>
              )}

              {!isPaid ? (
                <a
                  href="/upgrade"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  Upgrade to Premium
                </a>
              ) : null}
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-500">
            {isPaid
              ? "Thank you for supporting Havenly."
              : "No pressure. Free remains fully usable."}
          </p>
        </section>

        {/* Right: Account / Help */}
        <aside className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
          <SectionTitle title="Account" subtitle="Billing is tied to your login." />

          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
            <div className="text-xs font-semibold text-slate-400">Email</div>
            <div className="mt-1 text-sm text-slate-200">
              {user.email ?? "—"}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-5">
            <div className="text-xs font-semibold text-slate-400">Support</div>
            <p className="mt-2 text-sm text-slate-400">
              Billing questions or cancellations:{" "}
              <span className="text-slate-200">support@havenly.app</span>
            </p>
          </div>

          {isPaid ? (
            <a
              href="/api/stripe/portal?returnUrl=/settings/billing"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              Open Stripe portal
            </a>
          ) : (
            <a
              href="/upgrade"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              View Premium
            </a>
          )}
        </aside>
      </div>
    </main>
  );
}
