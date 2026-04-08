// app/settings/billing/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";
import { ensureCreditsFresh } from "@/lib/creditRules";
import { PRICING } from "@/app/lib/pricing";
import { PAYMENT } from "@/app/lib/payment";
import { CONFIG } from "@/app/lib/config";
import { getTranslations, getLocaleFromCookieString } from "@/app/lib/i18n";

export const dynamic = "force-dynamic";

type PlanType = "PREMIUM" | "TRIAL" | "FREE";

function PlanBadge({ plan, labels }: { plan: PlanType; labels: { planPremium: string; planTrial: string; planFree: string } }) {
  if (plan === "PREMIUM") {
    return (
      <span className="inline-flex items-center rounded-full border border-qm-positive-border bg-qm-positive-soft px-2.5 py-1 text-xs font-semibold text-qm-positive">
        {labels.planPremium}
      </span>
    );
  }
  if (plan === "TRIAL") {
    return (
      <span className="inline-flex items-center rounded-full border border-qm-premium-border bg-qm-premium-soft px-2.5 py-1 text-xs font-semibold text-qm-premium">
        {labels.planTrial}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-qm-border-subtle bg-qm-elevated px-2.5 py-1 text-xs font-semibold text-qm-secondary">
      {labels.planFree}
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
      <h2 className="text-sm font-semibold text-qm-primary">{title}</h2>
      {subtitle ? (
        <p className="mt-1 text-sm text-qm-muted">{subtitle}</p>
      ) : null}
    </div>
  );
}

export default async function BillingPage() {
  const supabase = createServerSupabase();
  const _t = getTranslations(getLocaleFromCookieString(cookies().toString()));
  const s  = _t.settingsPage;
  const ps = _t.pricingStrings;

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
    <main className="mx-auto w-full max-w-5xl px-6 py-14 text-qm-primary">
      <header className="mb-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-qm-primary">Billing</h1>
            <p className="mt-2 text-sm text-qm-muted">
              Manage your subscription and billing details.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PlanBadge plan={plan} labels={s} />
            {isPaid ? (
              <a
                href={PAYMENT.portalUrl("/settings/billing")}
                className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-qm-primary hover:bg-white/15"
              >
                Manage subscription
              </a>
            ) : (
              <a
                href="/upgrade"
                className="inline-flex items-center justify-center rounded-full bg-qm-accent px-4 py-2 text-sm font-semibold text-white hover:bg-qm-accent-hover"
              >
                Upgrade to Premium
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Refund window notice — only visible within the trial period */}
      {refundDaysLeft !== null && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-qm-positive-border bg-qm-positive-bg px-5 py-4">
          <span className="mt-0.5 text-base">🛡️</span>
          <div>
            <p className="text-sm font-semibold text-qm-positive">
              {refundDaysLeft === 1
                ? s.refundWindowLast(PRICING.trialDays)
                : s.refundWindowDays(PRICING.trialDays)}
            </p>
            <p className="mt-0.5 text-xs text-qm-muted">
              Not what you expected? Email{" "}
              <a
                href={`mailto:${CONFIG.supportEmail}`}
                className="text-qm-primary underline underline-offset-2 hover:text-qm-positive-hover"
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
        <section className="lg:col-span-2 rounded-2xl border border-qm-border-subtle bg-qm-bg p-6">
          <SectionTitle
            title="Plan"
            subtitle={
              plan === "PREMIUM"
                ? s.planStatusPremium
                : plan === "TRIAL"
                ? s.planStatusTrial
                : s.planStatusFree
            }
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-qm-border-subtle bg-qm-bg p-5">
              <h3 className="text-sm font-semibold text-qm-primary">
                {isPaid ? s.premiumIncludes : s.freeIncludes}
              </h3>

              <ul className="mt-3 space-y-2 text-sm text-qm-secondary">
                {isPaid ? (
                  <>
                    <li>• {s.premiumItem1}</li>
                    <li>• {s.premiumItem2}</li>
                    <li>• {s.premiumItem3}</li>
                    <li>• {s.premiumItem4}</li>
                  </>
                ) : (
                  <>
                    <li>• {s.freeItem1}</li>
                    <li>• {s.freeItem2}</li>
                    <li>• {s.freeItem3(PRICING.freeMonthlyCredits)}</li>
                    <li>• {s.freeItem4}</li>
                  </>
                )}
              </ul>

              {isPaid && (
                <div className="mt-4 space-y-2 border-t border-qm-border-subtle pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-qm-faint">Price</span>
                    <span className="font-medium text-qm-primary">{ps.perMonth(PRICING.monthly)}</span>
                  </div>
                  {nextBillingLabel && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-qm-faint">Next charge</span>
                      <span className="font-medium text-qm-primary">{nextBillingLabel}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-qm-border-subtle bg-qm-bg p-5">
              <h3 className="text-sm font-semibold text-qm-primary">
                {isPaid ? s.cancellationsLabel : s.upgradeLabel}
              </h3>

              {isPaid ? (
                <p className="mt-2 text-sm text-qm-muted">
                  Cancel anytime via{" "}
                  <a
                    href={PAYMENT.portalUrl("/settings/billing")}
                    className="text-qm-positive hover:text-qm-positive-hover"
                  >
                    Manage subscription
                  </a>{" "}
                  in {PAYMENT.providerName}.
                </p>
              ) : (
                <p className="mt-2 text-sm text-qm-muted">
                  Premium unlocks unlimited reflections and deeper insights.
                </p>
              )}

              {/* Refund guarantee — PRICING.trialDays drives the number */}
              {isPaid && (
                <div className="mt-4 rounded-lg border border-qm-positive-border bg-qm-positive-bg px-3 py-2.5">
                  <p className="text-xs font-medium text-qm-positive">
                    🛡️ {ps.trialFreeFor(PRICING.trialDays)} {ps.fullAccess} — {ps.trialNoChargeUntil(PRICING.trialDays + 1)}
                  </p>
                  <p className="mt-0.5 text-xs text-qm-faint">
                    Email{" "}
                    <a
                      href={`mailto:${CONFIG.supportEmail}`}
                      className="text-qm-secondary underline underline-offset-2 hover:text-qm-positive-hover"
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
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-qm-accent px-4 py-2 text-sm font-semibold text-white hover:bg-qm-accent-hover"
                >
                  Upgrade to Premium
                </a>
              ) : null}
            </div>
          </div>

          <p className="mt-6 text-xs text-qm-faint">
            {isPaid
              ? `Thank you for supporting ${CONFIG.appName}.`
              : s.noPressure}
          </p>
        </section>

        {/* Right: Account / Help */}
        <aside className="rounded-2xl border border-qm-border-subtle bg-qm-bg p-6">
          <SectionTitle title={s.accountSectionTitle} subtitle={s.accountBillingSubtitle} />

          <div className="rounded-xl border border-qm-border-subtle bg-qm-bg p-5">
            <div className="text-xs font-semibold text-qm-muted">Email</div>
            <div className="mt-1 text-sm text-qm-primary">{user.email ?? "—"}</div>
          </div>

          <div className="mt-4 rounded-xl border border-qm-border-subtle bg-qm-bg p-5">
            <div className="text-xs font-semibold text-qm-muted">Support</div>
            <p className="mt-2 text-sm text-qm-muted">
              Billing questions or cancellations:{" "}
              <a
                href={`mailto:${CONFIG.supportEmail}`}
                className="text-qm-primary underline underline-offset-2 hover:text-qm-positive-hover"
              >
                {CONFIG.supportEmail}
              </a>
            </p>
          </div>

          {isPaid ? (
            <a
              href={PAYMENT.portalUrl("/settings/billing")}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-qm-primary hover:bg-white/15"
            >
              {PAYMENT.portalLabel}
            </a>
          ) : (
            <a
              href="/upgrade"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-qm-accent px-4 py-2 text-sm font-semibold text-white hover:bg-qm-accent-hover"
            >
              View Premium
            </a>
          )}
        </aside>
      </div>
    </main>
  );
}
