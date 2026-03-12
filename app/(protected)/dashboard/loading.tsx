export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-950">
      <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        <span>Loading…</span>
      </div>
    </div>
  );
}
