import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
          Your space
        </p>
        <h1 className="font-display text-3xl font-semibold text-slate-100">
          Reflect a little deeper
        </h1>
        <p className="text-sm text-slate-400 max-w-xl">
          Small, focused ways to check in with yourself — separate from your journal entries.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link
          href="/tools/mood"
          className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 transition hover:border-slate-700 hover:bg-slate-900"
        >
          <h3 className="mb-2 font-medium text-slate-100">Mood Check</h3>
          <p className="text-sm text-slate-400">
            Notice how you are feeling today in a simple, quiet flow.
          </p>
        </Link>

        <Link
          href="/tools/reflection"
          className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 transition hover:border-slate-700 hover:bg-slate-900"
        >
          <h3 className="mb-2 font-medium text-slate-100">Guided Reflection</h3>
          <p className="text-sm text-slate-400">
            A prompt shaped around what has been showing up in your entries lately.
          </p>
        </Link>

        <Link
          href="/tools/suggestions"
          className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 transition hover:border-slate-700 hover:bg-slate-900"
        >
          <h3 className="mb-2 font-medium text-slate-100">Small Suggestions</h3>
          <p className="text-sm text-slate-400">
            One or two gentle ideas, based on your patterns — not instructions, just invitations.
          </p>
        </Link>
      </div>
    </div>
  );
}
