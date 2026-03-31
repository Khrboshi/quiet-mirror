import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-qm-positive">
          Your space
        </p>
        <h1 className="font-display text-3xl font-semibold text-qm-primary">
          Reflect a little deeper
        </h1>
        <p className="text-sm text-qm-muted max-w-xl">
          Small, focused ways to check in with yourself — separate from your journal entries.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link
          href="/tools/mood"
          className="group rounded-2xl border border-qm-border-subtle bg-qm-bg p-6 transition hover:border-qm-positive-border hover:bg-qm-elevated"
        >
          <h3 className="mb-2 font-medium text-qm-primary">A quiet moment</h3>
          <p className="text-sm text-qm-muted">
            Pause and notice where you actually are — no scores, no ratings, just honesty.
          </p>
          <p className="mt-4 text-xs font-medium text-qm-positive transition group-hover:text-qm-positive-hover">
            Open →
          </p>
        </Link>

        <Link
          href="/tools/reflection"
          className="group rounded-2xl border border-qm-border-subtle bg-qm-bg p-6 transition hover:border-qm-positive-border hover:bg-qm-elevated"
        >
          <h3 className="mb-2 font-medium text-qm-primary">Guided Reflection</h3>
          <p className="text-sm text-qm-muted">
            A prompt shaped around what has been showing up in your entries lately.
          </p>
          <p className="mt-4 text-xs font-medium text-qm-positive transition group-hover:text-qm-positive-hover">
            Open →
          </p>
        </Link>

        <Link
          href="/tools/suggestions"
          className="group rounded-2xl border border-qm-border-subtle bg-qm-bg p-6 transition hover:border-qm-positive-border hover:bg-qm-elevated"
        >
          <h3 className="mb-2 font-medium text-qm-primary">Small Suggestions</h3>
          <p className="text-sm text-qm-muted">
            One or two gentle ideas, based on your patterns — not instructions, just invitations.
          </p>
          <p className="mt-4 text-xs font-medium text-qm-positive transition group-hover:text-qm-positive-hover">
            Open →
          </p>
        </Link>
      </div>
    </div>
  );
}
