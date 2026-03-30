// app/settings/billing/page.tsx
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { ensureCreditsFresh } from "@/lib/creditRules";
import { PRICING } from "@/app/lib/pricing";
import { PAYMENT } from "@/app/lib/payment";
import { CONFIG } from "@/app/lib/config";

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
      <span className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-300">
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

  const nextBillingLabel = isPaid && (credits as any)?.renewal_date
    ? new Date((credits as any).renewal_date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;

  // Show refund window notice if user is within the trial period of subscribing.
  // We derive the start date from renewal_date - 30 days.
  // PRICING.trialDays is the single source of truth — change it in pricing.ts.
  let refundDaysLeft: number | null = null;
  if (isPaid && (credits as any)?.renewal_date) {
    const renewalDate = new Date((credits as any).renewal_date);
    const startDate = new Date(renewalDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const daysSinceStart = Math.floor(
      (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceStart < PRICING.trialDays) {
      refundDaysLeft = PRICING.trialDays - daysSinceStart;
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
                href={PAYMENT.portalUrl("/settings/billing")}
                className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
              >
                Manage subscription
              </a>
            ) : (
              <a
                href="/upgrade"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--hvn-accent-mint)] px-4 py-2 text-sm font-semibold text-white hover:bg-[color:var(--hvn-accent-mint-hover)]"
              >
                Upgrade to Premium
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Refund window notice — only visible within the trial period */}
      {refundDaysLeft !== null && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-5 py-4">
          <span className="mt-0.5 text-base">🛡️</span>
          <div>
            <p className="text-sm font-semibold text-emerald-300">
              {refundDaysLeft === 1
                ? `Last day of your ${PRICING.trialDays}-day refund window`
                : `${refundDaysLeft} days left in your ${PRICING.trialDays}-day refund window`}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Not what you expected? Email{" "}
              <a
                href={`mailto:${CONFIG.supportEmail}`}
                className="text-slate-200 underline underline-offset-2 hover:text-emerald-300"
              >
                {CONFIG.supportEmail}
              </a>{" "}
              for a full refund — no questions asked.
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
                    <li>• {PRICING.freeMonthlyCredits} AI reflections per month</li>
                    <li>• Private by default</li>
                  </>
                )}
              </ul>

              {isPaid && (
                <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Price</span>
                    <span className="font-medium text-slate-200">{PRICING.monthlyCadence}</span>
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
                    href={PAYMENT.portalUrl("/settings/billing")}
                    className="text-emerald-300 hover:text-emerald-200"
                  >
                    Manage subscription
                  </a>{" "}
                  in {PAYMENT.providerName}.
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-400">
                  Premium unlocks unlimited reflections and deeper insights.
                </p>
              )}

              {/* Refund guarantee — PRICING.trialDays drives the number */}
              {isPaid && (
                <div className="mt-4 rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-3 py-2.5">
                  <p className="text-xs font-medium text-emerald-300">
                    🛡️ {PRICING.trialDays}-day full refund guarantee
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Email{" "}
                    <a
                      href={`mailto:${CONFIG.supportEmail}`}
                      className="text-slate-300 underline underline-offset-2 hover:text-emerald-300"
                    >
                      {CONFIG.supportEmail}
                    </a>{" "}
                    — no questions asked.
                  </p>
                </div>
              )}

              {!isPaid ? (
                <a
                  href="/upgrade"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[color:var(--hvn-accent-mint)] px-4 py-2 text-sm font-semibold text-white hover:bg-[color:var(--hvn-accent-mint-hover)]"
                >
                  Upgrade to Premium
                </a>
              ) : null}
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-500">
            {isPaid
              ? `Thank you for supporting ${CONFIG.appName}.`
              : "No pressure. Free remains fully usable."}
          </p>
        </section>

        {/* Right: Account / Help */}
        <aside className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
          <SectionTitle title="Account" subtitle="Billing is tied to your login." />

          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
            <div className="text-xs font-semibold text-slate-400">Email</div>
            <div className="mt-1 text-sm text-slate-200">{user.email ?? "—"}</div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-5">
            <div className="text-xs font-semibold text-slate-400">Support</div>
            <p className="mt-2 text-sm text-slate-400">
              Billing questions or cancellations:{" "}
              <a
                href={`mailto:${CONFIG.supportEmail}`}
                className="text-slate-200 underline underline-offset-2 hover:text-emerald-300"
              >
                {CONFIG.supportEmail}
              </a>
            </p>
          </div>

          {isPaid ? (
            <a
              href={PAYMENT.portalUrl("/settings/billing")}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              {PAYMENT.portalLabel}
            </a>
          ) : (
            <a
              href="/upgrade"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[color:var(--hvn-accent-mint)] px-4 py-2 text-sm font-semibold text-white hover:bg-[color:var(--hvn-accent-mint-hover)]"
            >
              View Premium
            </a>
          )}
        </aside>
      </div>
    </main>
  );
}
