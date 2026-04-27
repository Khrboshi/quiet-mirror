/**
 * app/(protected)/journal/[id]/page.tsx
 *
 * Server component — fetches a single journal entry by ID,
 * verifies ownership, then passes data to JournalEntryClient.
 * Redirects to /journal if entry not found or not owned by user.
 */
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

import JournalEntryClient from "./JournalEntryClient";
import { getRequestTranslations } from "@/app/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  // ✅ getSession reads from cookie locally — no network call
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) redirect("/magic-login");

  const { data: entry } = await supabase
    .from("journal_entries")
    .select("id,title,content,created_at,ai_response")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (!entry) {
    const t = await getRequestTranslations();
    return <div className="p-10 text-qm-primary">{t.errors.entryNotFound}</div>;
  }

  let initialReflection = null;
  try {
    initialReflection = entry.ai_response
      ? JSON.parse(entry.ai_response)
      : null;
  } catch {
    initialReflection = null;
  }

  // Cheap count to detect first-entry moment
  const { count: entryCount } = await supabase
    .from("journal_entries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", session.user.id);

  const isFirstEntry = (entryCount ?? 0) <= 1;

  return (
    <JournalEntryClient
      entry={entry}
      initialReflection={initialReflection}
      isFirstEntry={isFirstEntry}
    />
  );
}
