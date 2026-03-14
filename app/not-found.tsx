import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-950 px-4">
      <div className="mx-auto max-w-md text-center space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
          404
        </p>
        <h1 className="font-display text-2xl font-semibold text-slate-100">
          Page not found
        </h1>
        <p className="text-sm leading-relaxed text-slate-400">
          This page doesn&apos;t exist. If you think this is a bug, try going
          back to where you came from.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="rounded-full border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
