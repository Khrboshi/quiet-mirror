export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import UpgradeIntentTracker from "@/app/components/UpgradeIntentTracker";

export default async function PremiumInsightPreviewPage() {
  const supabase = createServerSupabase();

  // ✅ Use getUser() once — middleware already validated session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/magic-login");

  return (
    <main className="mx-auto max-w-4xl px-6 py-20 text-slate-200">
      <UpgradeIntentTracker source="insights-preview" />

      <header className="mb-10">
        <h1 className="text-2xl font-semibold text-white">
          A glimpse of your patterns
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          As you keep writing, Havenly begins to notice themes that repeat quietly
          over time. Premium brings those patterns into focus — gently.
        </p>
      </header>

      <section className="mb-10 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
        <h2 className="mb-3 text-sm font-semibold text-emerald-300">
          Example insight (Premium)
        </h2>
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70 p-5">
          <div className="space-y-3 blur-sm select-none">
            <p className="text-sm">
              Over the past few weeks, you often write about carrying responsibility
              for others while postponing your own rest.
            </p>
            <p className="text-sm">
              Moments of calm tend to appear after you set even small boundaries,
              especially in the evenings.
            </p>
            <p className="text-sm">
              A recurring theme is the tension between wanting stability and feeling
              emotionally stretched.
            </p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-slate-900/80 px-4 py-2 text-xs text-slate-300">
              Premium insight preview
            </span>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Premium insights are generated from multiple entries over time — never
          from a single moment.
        </p>
      </section>

      <section className="mb-12 rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        <h3 className="mb-2 text-sm font-semibold text-slate-100">
          What Premium adds
        </h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>• Gentle pattern timelines across weeks and months</li>
          <li>• Multi-entry emotional themes</li>
          <li>• Calm weekly and monthly summaries</li>
          <li>• Deeper reflections without writing more</li>
        </ul>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/upgrade?from=insights-preview"
          className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
        >
          Unlock Premium insights
        </Link>
        <Link href="/dashboard" className="text-sm text-slate-400 hover:underline">
          Back to dashboard
        </Link>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        No pressure. Free remains fully usable.
      </p>
    </main>
  );
}
```

Commit message: `Speed up insights preview — remove redundant getSession call`

---

Now paste the contents of your tools page so I can fix that too before you deploy:
```
app/(protected)/tools/page.tsx
