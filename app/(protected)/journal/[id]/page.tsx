// app/(protected)/journal/[id]/page.tsx

import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

type PageProps = {
  params: { id: string };
};

async function getEntry(id: string) {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return data;
}

function ReflectionSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 space-y-4">
      <div className="text-xs font-semibold uppercase tracking-widest text-slate-600">
        Havenly reflection
      </div>

      <div className="space-y-2 animate-pulse">
        <div className="h-3 w-full rounded bg-slate-800" />
        <div className="h-3 w-11/12 rounded bg-slate-800" />
        <div className="h-3 w-10/12 rounded bg-slate-800" />
        <div className="h-3 w-9/12 rounded bg-slate-800" />
      </div>

      <div className="text-xs text-slate-700">
        Havenly is reflecting on what you wrote…
      </div>
    </div>
  );
}

export default async function JournalEntryPage({ params }: PageProps) {
  const entry = await getEntry(params.id);

  if (!entry) return notFound();

  const reflection = entry.reflection ?? null;

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
        {entry.title && (
          <h1 className="mb-4 text-xl font-semibold text-slate-100">
            {entry.title}
          </h1>
        )}

        <p className="whitespace-pre-wrap leading-relaxed text-slate-300">
          {entry.content}
        </p>
      </section>

      {!reflection ? (
        <ReflectionSkeleton />
      ) : (
        <section className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.05] p-6 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-emerald-400/80">
            Havenly reflection
          </div>

          {reflection
            .split(/\n\n+/)
            .filter(Boolean)
            .map((p: string, i: number) => (
              <p
                key={i}
                className={`leading-relaxed ${
                  i === 0 ? "text-base text-slate-100" : "text-sm text-slate-400"
                }`}
              >
                {p}
              </p>
            ))}

          <p className="text-xs text-slate-600">
            Reflections evolve as you keep writing.
          </p>
        </section>
      )}
    </div>
  );
}
