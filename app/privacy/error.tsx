"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-950 px-4">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Something went wrong
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Havenly ran into an issue loading this page. Try again in a moment.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
          >
            Try again
          </button>
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
