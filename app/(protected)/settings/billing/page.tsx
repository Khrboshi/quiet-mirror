export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function BillingPage() {
  const supabase = createServerSupabase();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect("/magic-login");

  const { data } = await supabase
    .from("user_credits")
    .select("plan_type")
    .eq("user_id", session.user.id)
    .maybeSingle();

  const planType = String((data as any)?.plan_type ?? "FREE").toUpperCase();
  const isPremium = planType === "PREMIUM";

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-slate-200">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold text-white">Billing</h1>
        <p className="mt-2 text-sm text-slate-400">
          Manage your Havenly subscription.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Current plan</h2>
            <p className="mt-1 text-sm text-slate-300">
              {isPremium ? (
                <span className="text-emerald-400 font-medium">Premium</span>
              ) : (
                <span>Free</span>
              )}
            </p>
          </div>

          {!isPremium && (
            <Link
              href="/upgrade"
              className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Upgrade to Premium
            </Link>
          )}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {isPremium ? (
            <>
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                <h3 className="text-sm font-semibold text-white">
                  Your Premium includes
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  <li>• Unlimited AI reflections</li>
                  <li>• Pattern clarity across time</li>
                  <li>• Weekly &amp; monthly summaries</li>
                  <li>• Deeper insights without writing more</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                <h3 className="text-sm font-semibold text-white">
                  Need help?
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  For billing questions or cancellations, contact us at{" "}
                  
                    href="mailto:support@havenly.app"
                    className="text-emerald-400 hover:underline"
                  >
                    support@havenly.app
                  </a>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                <h3 className="text-sm font-semibold text-white">
                  Free plan includes
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  <li>• Unlimited journaling</li>
                  <li>• Gentle prompts to begin</li>
                  <li>• 3 AI reflections per month</li>
                  <li>• Private by default</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                <h3 className="text-sm font-semibold text-white">
                  What Premium adds
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  <li>• Unlimited AI reflections</li>
                  <li>• Pattern clarity across time</li>
                  <li>• Weekly &amp; monthly summaries</li>
                  <li>• Deeper insights without writing more</li>
                </ul>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-xs text-slate-500">
          {isPremium
            ? "Thank you for supporting Havenly."
            : "No pressure. Free remains fully usable."}
        </p>
      </div>
    </main>
  );
}
