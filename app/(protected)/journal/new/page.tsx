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
      <JournalForm />
    </div>
  );
}
