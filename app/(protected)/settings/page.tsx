// app/(protected)/settings/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { ensureCreditsFresh } from "@/lib/creditRules";
import { PAYMENT } from "@/app/lib/payment";
import { PRICING } from "@/app/lib/pricing";
import { CONFIG } from "@/app/lib/config";

export const dynamic = "force-dynamic";

// ── Helpers ───────────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: "PREMIUM" | "TRIAL" | "FREE" }) {
  const isPremium = plan === "PREMIUM" || plan === "TRIAL";
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        isPremium
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-slate-700 bg-slate-900/40 text-slate-300",
      ].join(" ")}
    >
      {plan === "TRIAL" ? "Trial" : plan === "PREMIUM" ? "Premium" : "Free"}
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
    <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
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
      ? "rounded-full bg-[color:var(--hvn-accent-mint)] px-4 py-2 text-sm font-semibold text-white hover:bg-[color:var(--hvn-accent-mint-hover)] transition-colors"
      : "rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition-colors";

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
    <div className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm text-slate-200">{value}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SettingsPage() {
  const supabase = createServerSupabase();

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
    <main className="mx-auto w-full max-w-5xl px-6 py-14 text-slate-200">

      {/* ── Header ── */}
      <header className="mb-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-white">Settings</h1>
            <p className="mt-2 text-sm text-slate-400">
              Account, plan, and privacy.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PlanBadge plan={plan} />
            {isPremium ? (
              <ActionLink
                href={PAYMENT.portalUrl(portalReturn)}
                variant="secondary"
              >
                {PAYMENT.manageLabel}
              </ActionLink>
            ) : (
              <ActionLink href="/upgrade" variant="primary">
                Upgrade
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
            title="Account"
            subtitle="Your login and account details."
            right={
              <ActionLink href="/settings/transactions" variant="secondary">
                Transactions
              </ActionLink>
            }
          >
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-5 py-1">
              <DataRow label="Email" value={user.email ?? "—"} />
              {memberSince && (
                <DataRow label="Member since" value={memberSince} />
              )}
              <DataRow
                label="Entries written"
                value={
                  <span className="font-medium text-slate-100">
                    {entryCount ?? 0}
                  </span>
                }
              />
            </div>
            <p className="mt-3 text-xs text-slate-600">
              Billing emails are sent to this address.
            </p>
          </Card>

          {/* Plan card — personalised for free users */}
          <Card
            title="Plan"
            subtitle={
              isPremium
                ? "Premium is active."
                : "You're on Free."
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
              <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-5 py-1">
                <DataRow label="Plan" value={<PlanBadge plan={plan} />} />
                <DataRow label="Reflections" value={<span className="text-emerald-400">Unlimited</span>} />
                <DataRow label="Insights" value="Full access" />
                <DataRow label="Weekly summary" value="Included" />
              </div>
            ) : (
              // Free state — show credits used/remaining
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-5 py-1">
                  <DataRow label="Plan" value={<PlanBadge plan={plan} />} />
                  <DataRow
                    label="Reflections this month"
                    value={
                      <span>
                        <span className={remainingCredits === 0 ? "text-slate-500" : "text-slate-100 font-medium"}>
                          {remainingCredits === 0
                            ? "0 remaining"
                            : `${remainingCredits} of ${PRICING.freeMonthlyCredits} remaining`}
                        </span>
                      </span>
                    }
                  />
                  <DataRow
                    label="Resets"
                    value={<span className="text-slate-400">{resetLabel}</span>}
                  />
                </div>

                {remainingCredits === 0 ? (
                  <p className="text-xs text-slate-600">
                    Reflections resume {resetLabel}. Upgrade for unlimited access.
                  </p>
                ) : (
                  <p className="text-xs text-slate-600">
                    Free plan includes {PRICING.freeMonthlyCredits} AI reflections per month.{" "}
                    <Link href="/upgrade" className="text-emerald-600 hover:text-emerald-500 transition-colors">
                      Upgrade for unlimited →
                    </Link>
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Data & Privacy — trust section */}
          <Card
            title="Data & Privacy"
            subtitle="Your entries belong to you — always."
          >
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-5 py-1">
              <DataRow
                label="AI training"
                value={<span className="text-emerald-400">Never used</span>}
              />
              <DataRow label="Data sharing" value="None" />
              <DataRow
                label="Privacy policy"
                value={
                  <Link
                    href="/privacy"
                    className="text-emerald-500/80 hover:text-emerald-400 text-xs transition-colors"
                  >
                    Read →
                  </Link>
                }
              />
            </div>
            <p className="mt-3 text-xs text-slate-600">
              To request data export or account deletion, email{" "}
              <span className="text-slate-400">{CONFIG.supportEmail}</span> from
              your account address.
            </p>
          </Card>

        </div>

        {/* ── Right column ── */}
        <div className="grid gap-6 content-start">

          <Card
            title="Install"
            subtitle="Add to your home screen for a faster, app-like experience — works offline too."
          >
            <Link
              href="/install"
              prefetch={false}
              className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--hvn-accent-mint)] px-4 py-2 text-sm font-semibold text-white hover:bg-[color:var(--hvn-accent-mint-hover)] transition-colors"
            >
              Install app
            </Link>
          </Card>

          <Card title="Support" subtitle="Help with billing or account issues.">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-5 py-1">
              <DataRow label="Email" value={CONFIG.supportEmail} />
            </div>
            <p className="mt-3 text-xs text-slate-600">
              Include your account email for faster help.
            </p>
          </Card>

        </div>
      </div>
    </main>
  );
}
