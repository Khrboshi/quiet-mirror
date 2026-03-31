import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import JournalEntryClient from "./JournalEntryClient";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabase();

  // ✅ getSession reads from cookie locally — no network call
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) redirect("/magic-login");

  const { data: entry } = await supabase
    .from("journal_entries")
    .select("id,title,content,created_at,ai_response")
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (!entry) {
    return <div className="p-10 text-qm-primary">Entry not found</div>;
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
