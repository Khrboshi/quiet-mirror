import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import JournalForm from "@/app/components/JournalForm";
import { LoadingIndicatorInline } from "@/app/components/LoadingIndicator";
import { getRequestTranslations } from "@/app/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function NewJournalPage() {
  const supabase = await createServerSupabase();

  // ✅ Use getUser() — authenticates the token with Supabase Auth.
  // getSession() reads the cookie without verifying it, which Supabase warns about.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/magic-login");

  const t = await getRequestTranslations();

  // Fetch entry count and most recent created_at for PostHog telemetry.
  // These are lightweight queries (head:true + limit:1) that run in parallel.
  // Used to populate is_first_entry and days_since_last_entry on journal_submitted.
  const [{ count: entryCount }, { data: lastEntryRows }] = await Promise.all([
    supabase
      .from("journal_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("journal_entries")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const lastEntryDate: string | null = lastEntryRows?.[0]?.created_at ?? null;
  const isFirstEntry = (entryCount ?? 0) === 0;

  return (
    <div className="mx-auto max-w-3xl px-4">
      {/*
        Suspense is required here because JournalForm calls useSearchParams()
        to read the ?prompt= query parameter passed from the dashboard.
        Without this boundary, Next.js 14 excludes the route from static
        optimisation and logs a build warning.
      */}
      <Suspense fallback={<LoadingIndicatorInline label={t.ui.loadingLabel} />}>
        <JournalForm isFirstEntry={isFirstEntry} lastEntryDate={lastEntryDate} />
      </Suspense>
    </div>
  );
}
