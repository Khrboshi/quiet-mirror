import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import JournalForm from "@/app/components/JournalForm";

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
          <div className="flex items-center gap-3 rounded-full border border-qm-border-subtle bg-qm-elevated px-4 py-2 text-sm text-qm-secondary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-qm-positive" />
            <span>Loading…</span>
          </div>
        </div>
      }>
        <JournalForm />
      </Suspense>
    </div>
  );
}
