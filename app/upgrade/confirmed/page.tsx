import Link from "next/link";

export const metadata = { title: "Premium | Havenly" };

export default function UpgradeConfirmedPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-slate-200">
      <h1 className="text-2xl font-semibold text-white">You’re Premium ✅</h1>

      <p className="mt-3 max-w-xl text-sm text-slate-400">
        Thanks — your subscription is active. If your dashboard doesn’t update within 30 seconds,
        refresh once.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/dashboard"
          className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
        >
          Go to dashboard
        </Link>

        <Link href="/settings/billing" className="text-sm text-slate-400 hover:underline">
          Manage billing
        </Link>
      </div>
    </main>
  );
}
