// app/(protected)/settings/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";
import { ensureCreditsFresh } from "@/lib/creditRules";
import { PAYMENT } from "@/app/lib/payment";
import { PRICING } from "@/app/lib/pricing";
import { CONFIG } from "@/app/lib/config";
import { getTranslations, getLocaleFromCookieString } from "@/app/lib/i18n";

export const dynamic = "force-dynamic";

// ── Helpers ───────────────────────────────────────────────────────────────────

function PlanBadge({ plan, labels }: { plan: "PREMIUM" | "TRIAL" | "FREE"; labels: { planPremium: string; planTrial: string; planFree: string } }) {
  const isPremium = plan === "PREMIUM" || plan === "TRIAL";
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        isPremium
          ? "border-qm-positive-border bg-qm-positive-soft text-qm-positive"
          : "border-qm-border-subtle bg-qm-elevated text-qm-secondary",
      ].join(" ")}
    >
      {plan === "TRIAL" ? labels.planTrial : plan === "PREMIUM" ? labels.planPremium : labels.planFree}
    </span>
  );
}

function Card({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-qm-border-subtle bg-qm-bg p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-qm-primary">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-qm-muted">{subtitle}</p>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

function ActionLink({
  href,
  children,
  variant = "secondary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const cls =
    variant === "primary"
      ? "rounded-full bg-qm-accent px-4 py-2 text-sm font-semibold text-white hover:bg-qm-accent-hover transition-colors"
      : "rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-qm-primary hover:bg-white/15 transition-colors";

  const isPortal = href.startsWith(PAYMENT.portalUrl("").split("?")[0]);

  if (isPortal) {
    return <a href={href} className={cls}>{children}</a>;
  }

  return (
    <Link href={href} className={cls} prefetch={false}>
      {children}
    </Link>
  );
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-qm-border-subtle last:border-0">
      <span className="text-xs text-qm-faint">{label}</span>
      <span className="text-sm text-qm-primary">{value}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SettingsPage() {
  const supabase = createServerSupabase();
  const t = getTranslations(getLocaleFromCookieString(cookies().toString()));
  const s = t.settingsPage;

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) redirect("/magic-login");

  // Ensure credits row is fresh before reading it
  await ensureCreditsFresh({ supabase, userId: user.id });

  const { data: creditsRow } = await supabase
    .from("user_credits")
    .select("plan_type, remaining_credits, renewal_date")
    .eq("user_id", user.id)
    .maybeSingle();

  const planType = String((creditsRow as any)?.plan_type ?? "FREE").toUpperCase();
  const plan = (["PREMIUM", "TRIAL"].includes(planType) ? planType : "FREE") as
    | "PREMIUM" | "TRIAL" | "FREE";

  const isPremium = plan === "PREMIUM" || plan === "TRIAL";
  const remainingCredits: number = isPremium
    ? Infinity
    : typeof (creditsRow as any)?.remaining_credits === "number"
    ? (creditsRow as any).remaining_credits
    : 0;
  const renewalDate: string | null = (creditsRow as any)?.renewal_date ?? null;

  // Entry count
  const { count: entryCount } = await supabase
    .from("journal_entries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Member since — use UTC to prevent server timezone shifting the month
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        timeZone: "UTC",
      })
    : null;

  // Reset label
  const resetLabel = renewalDate
    ? new Date(renewalDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        1
      ).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const creditsUsed = isPremium ? null : PRICING.freeMonthlyCredits - remainingCredits;

  const portalReturn = "/settings";

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 text-qm-primary">

      {/* ── Header ── */}
      <header className="mb-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-qm-primary">{s.title}</h1>
            <p className="mt-2 text-sm text-qm-muted">
              {s.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PlanBadge plan={plan} labels={s} />
            {isPremium ? (
              <ActionLink
                href={PAYMENT.portalUrl(portalReturn)}
                variant="secondary"
              >
                {PAYMENT.manageLabel}
              </ActionLink>
            ) : (
              <ActionLink href="/upgrade" variant="primary">
                {s.upgradeLabel}
              </ActionLink>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Left column ── */}
        <div className="lg:col-span-2 grid gap-6">

          {/* Account card — enriched with stats */}
          <Card
            title={s.accountTitle}
            subtitle={s.accountSubtitle}
            right={
              <ActionLink href="/settings/transactions" variant="secondary">
                {s.transactionsLabel}
              </ActionLink>
            }
          >
            <div className="rounded-xl border border-qm-border-subtle bg-qm-bg px-5 py-1">
              <DataRow label={s.emailLabel} value={user.email ?? "—"} />
              {memberSince && (
                <DataRow label={s.memberSinceLabel} value={memberSince} />
              )}
              <DataRow
                label={s.entriesWrittenLabel}
                value={
                  <span className="font-medium text-qm-primary">
                    {entryCount ?? 0}
                  </span>
                }
              />
            </div>
            <p className="mt-3 text-xs text-qm-faint">
              {s.billingEmailNote}
            </p>
          </Card>

          {/* Plan card — personalised for free users */}
          <Card
            title={s.planTitle}
            subtitle={
              isPremium
                ? s.planActivePremium
                : s.planActiveFree
            }
            right={
              isPremium ? (
                <ActionLink href="/settings/billing" variant="secondary">
                  Billing
                </ActionLink>
              ) : (
                <ActionLink href="/upgrade" variant="primary">
                  Upgrade
                </ActionLink>
              )
            }
          >
            {isPremium ? (
              // Premium state
              <div className="rounded-xl border border-qm-positive-border bg-qm-positive-bg px-5 py-1">
                <DataRow label={s.planLabel} value={<PlanBadge plan={plan} labels={s} />} />
                <DataRow label={s.reflectionsLabel} value={<span className="text-qm-positive">Unlimited</span>} />
                <DataRow label={s.insightsLabel} value={s.insightsFull} />
                <DataRow label={s.weeklySummaryLabel} value={s.weeklySummaryIncluded} />
              </div>
            ) : (
              // Free state — show credits used/remaining
              <div className="space-y-3">
                <div className="rounded-xl border border-qm-border-subtle bg-qm-bg px-5 py-1">
                  <DataRow label={s.planLabel} value={<PlanBadge plan={plan} labels={s} />} />
                  <DataRow
                    label={s.reflectionsLabel}
                    value={
                      <span>
                        <span className={remainingCredits === 0 ? "text-qm-faint" : "text-qm-primary font-medium"}>
                          {remainingCredits === 0
                            ? s.reflectionsNone
                            : s.reflectionsRemaining(remainingCredits, PRICING.freeMonthlyCredits)}
                        </span>
                      </span>
                    }
                  />
                  <DataRow
                    label={s.resetsLabel}
                    value={<span className="text-qm-muted">{resetLabel}</span>}
                  />
                </div>

                {remainingCredits === 0 ? (
                  <p className="text-xs text-qm-faint">
                    Reflections resume {resetLabel}. Upgrade for unlimited access.
                  </p>
                ) : (
                  <p className="text-xs text-qm-faint">
                    {s.reflectionsFreeNote(PRICING.freeMonthlyCredits)}{" "}
                    <Link href="/upgrade" className="text-qm-positive-strong hover:text-qm-positive-hover transition-colors">
                      Upgrade for unlimited →
                    </Link>
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Data & Privacy — trust section */}
          <Card
            title={s.dataPrivacyTitle}
            subtitle={s.dataPrivacySubtitle}
          >
            <div className="rounded-xl border border-qm-border-subtle bg-qm-bg px-5 py-1">
              <DataRow
                label={s.aiTrainingLabel}
                value={<span className="text-qm-positive">{s.aiTrainingValue}</span>}
              />
              <DataRow label={s.dataSharingLabel} value={s.dataSharingValue} />
              <DataRow
                label={s.privacyPolicyLabel}
                value={
                  <Link
                    href="/privacy"
                    className="text-qm-positive hover:text-qm-positive-hover text-xs transition-colors"
                  >
                    Read →
                  </Link>
                }
              />
            </div>
            <p className="mt-3 text-xs text-qm-faint">
              To request data export or account deletion, email{" "}
              <span className="text-qm-muted">{CONFIG.supportEmail}</span> from
              your account address.
            </p>
          </Card>

        </div>

        {/* ── Right column ── */}
        <div className="grid gap-6 content-start">

          <Card
            title={s.installTitle}
            subtitle={s.installSubtitle}
          >
            <Link
              href="/install"
              prefetch={false}
              className="inline-flex w-full items-center justify-center rounded-full bg-qm-accent px-4 py-2 text-sm font-semibold text-white hover:bg-qm-accent-hover transition-colors"
            >
              Install app
            </Link>
          </Card>

          <Card title={s.supportTitle} subtitle={s.supportSubtitle}>
            <div className="rounded-xl border border-qm-border-subtle bg-qm-bg px-5 py-1">
              <DataRow label={s.emailLabel} value={CONFIG.supportEmail} />
            </div>
            <p className="mt-3 text-xs text-qm-faint">
              {s.accountEmailHint}
            </p>
          </Card>

        </div>
      </div>
    </main>
  );
}
