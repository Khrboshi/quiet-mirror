// app/settings/page.tsx
import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function PlanBadge({ plan }: { plan: "PREMIUM" | "FREE" }) {
  const isPremium = plan === "PREMIUM";
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        isPremium
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-slate-700 bg-slate-900/40 text-slate-300",
      ].join(" ")}
    >
      {isPremium ? "Premium" : "Free"}
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

function ActionButton({
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
      ? "rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
      : "rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15";

  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export default async function SettingsPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) redirect("/magic-login");

  const { data: credits } = await supabase
    .from("user_credits")
    .select("plan_type")
    .eq("user_id", user.id)
    .maybeSingle();

  const planType = String((credits as any)?.plan_type ?? "FREE").toUpperCase();
  const plan = (planType === "PREMIUM" ? "PREMIUM" : "FREE") as
    | "PREMIUM"
    | "FREE";

  const isPremium = plan === "PREMIUM";

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 text-slate-200">
      <header className="mb-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Settings</h1>
            <p className="mt-2 text-sm text-slate-400">
              Account, plan, and app preferences.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PlanBadge plan={plan} />
            {isPremium ? (
              <a
                href="/api/stripe/portal?returnUrl=/settings"
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
              >
                Manage subscription
              </a>
            ) : (
              <ActionButton href="/upgrade" variant="primary">
                Upgrade
              </ActionButton>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 grid gap-6">
          <Card
            title="Account"
            subtitle="Your login and billing email."
            right={
              <ActionButton href="/settings/transactions" variant="secondary">
                Transactions
              </ActionButton>
            }
          >
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
              <div className="text-xs font-semibold text-slate-400">Email</div>
              <div className="mt-1 text-sm text-slate-200">
                {user.email ?? "—"}
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Billing emails are sent to this address.
            </p>
          </Card>

          <Card
            title="Plan"
            subtitle={
              isPremium
                ? "Premium is active. Manage it in Stripe."
                : "You’re on Free. Upgrade any time."
            }
            right={
              isPremium ? (
                <Link
                  href="/settings/billing"
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                >
                  Billing
                </Link>
              ) : (
                <ActionButton href="/upgrade" variant="primary">
                  View Premium
                </ActionButton>
              )
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                <div className="text-xs font-semibold text-slate-400">
                  Current plan
                </div>
                <div className="mt-2">
                  <PlanBadge plan={plan} />
                </div>
                <div className="mt-3 text-sm text-slate-400">
                  {isPremium
                    ? "Unlimited reflections and summaries."
                    : "Journaling + limited reflections."}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                <div className="text-xs font-semibold text-slate-400">
                  Manage
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    href="/settings/billing"
                    className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                  >
                    Billing page
                  </Link>

                  {isPremium ? (
                    <a
                      href="/api/stripe/portal?returnUrl=/settings"
                      className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                    >
                      Stripe portal
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="grid gap-6">
          <Card
            title="Install"
            subtitle="Add Havenly to your home screen for a faster, app-like experience."
          >
            <Link
              href="/install"
              className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Install
            </Link>
          </Card>

          <Card
            title="Support"
            subtitle="Help with billing or account issues."
          >
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
              <div className="text-xs font-semibold text-slate-400">Email</div>
              <div className="mt-1 text-sm text-slate-200">
                support@havenly.app
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Include your account email for faster help.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
