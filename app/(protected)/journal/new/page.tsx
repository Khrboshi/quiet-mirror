import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import JournalForm from "@/components/JournalForm";

export const dynamic = "force-dynamic";

export default async function NewJournalPage() {
  const supabase = createServerSupabase();

  // ✅ getSession reads from cookie locally — no network call
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect("/magic-login");

  return (
    <div className="mx-auto max-w-3xl px-4">
      {/*
        Suspense is required here because JournalForm calls useSearchParams()
        to read the ?prompt= query parameter passed from the dashboard.
        Without this boundary, Next.js 14 excludes the route from static
        optimisation and logs a build warning.
      */}
      <Suspense fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span>Loading…</span>
          </div>
        </div>
      }>
        <JournalForm />
      </Suspense>
    </div>
  );
}
