// app/(protected)/journal/page.tsx
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatDate(date: string) {
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function titleOrUntitled(title: string | null) {
  return title?.trim() ? title.trim() : "Untitled entry";
}

export default async function JournalPage() {
  const supabase = createServerSupabase();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/magic-login");

  const { data: entries } = await supabase
    .from("journal_entries")
    .select("id, created_at, title, content, ai_response")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-slate-100">Your Journal</h1>
        <Link
          href="/journal/new"
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-emerald-400 transition-colors"
        >
          New Entry
        </Link>
      </div>

      {entries?.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-slate-400 text-sm">
          You haven&rsquo;t written any entries yet. Start with your first one.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {entries?.map((entry) => {
          const hasReflection = Boolean((entry as any).ai_response);
          return (
            <Link
              key={entry.id}
              href={`/journal/${entry.id}`}
              className="group rounded-xl border border-slate-800 bg-slate-950/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs text-slate-500">
                  {formatDate(entry.created_at)}
                </p>
                {hasReflection ? (
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" />
                    Reflected
                  </span>
                ) : (
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-600">
                    No reflection
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-100 group-hover:text-white transition leading-snug">
                {titleOrUntitled(entry.title)}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500 line-clamp-2">
                {entry.content}
              </p>
              <p className="mt-3 text-emerald-400 text-xs group-hover:text-emerald-300 transition">
                Open &rarr;
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
