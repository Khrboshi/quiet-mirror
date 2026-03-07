// app/about/page.tsx
import Link from "next/link";

export const metadata = {
  title: "About Havenly",
  description: "Havenly is a private AI journaling companion — built for people who want to understand themselves better, not optimize themselves harder.",
  openGraph: {
    title: "About Havenly — Private AI Journaling",
    description: "Built for people who want to understand themselves better, not optimize themselves harder.",
    url: "https://havenly-2-1.vercel.app/about",
  },
};



export default function AboutPage() {
  return (
    <main className="min-h-screen bg-hvn-bg text-hvn-text-primary bg-hvn-page-gradient">
      <section className="pt-16 pb-14 sm:pt-20 sm:pb-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl border border-hvn-card bg-slate-950/50 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur sm:p-10">
            {/* HERO */}
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                About Havenly
              </p>
              <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                A quieter place to land — without turning life into a project.
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-200/80 sm:text-base">
                Havenly exists to give your inner life a calmer, protected space
                to write, reflect, and notice what’s been happening underneath
                your weeks.
              </p>

              {/* ABOVE-THE-FOLD CTAs (key trust-path upgrade) */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/magic-login"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Start free journal
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/40 px-5 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Explore the blog →
                </Link>
                <Link
                  href="/upgrade"
                  className="inline-flex items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 text-sm font-medium text-emerald-200 hover:bg-emerald-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  See what Premium adds
                </Link>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                No credit card required. Free is fully usable on its own.
              </p>
            </div>

            {/* WHY */}
            <div className="mt-10 max-w-4xl">
              <h2 className="text-lg font-semibold text-slate-100">
                Why Havenly exists
              </h2>
              <p className="mt-3 text-sm text-slate-200/75">
                Many tools are designed to help you optimize, track, or improve
                yourself. Havenly is different. It was created for moments when
                life feels full, complicated, or emotionally dense — and you
                simply need a place to be honest.
              </p>
              <p className="mt-3 text-sm text-slate-200/75">
                Havenly is not about fixing you. It is about helping you notice
                what is already there, with clarity and kindness.
              </p>
            </div>

            {/* WHAT IT IS / IS NOT */}
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-hvn-card bg-slate-950/60 p-5">
                <p className="text-sm font-semibold text-emerald-300">
                  What Havenly is
                </p>
                <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-200/80">
                  <li>A private journaling space</li>
                  <li>A calm companion for reflection</li>
                  <li>A way to notice patterns over time</li>
                  <li>A tool that respects your pace and privacy</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-hvn-card bg-slate-950/60 p-5">
                <p className="text-sm font-semibold text-amber-200">
                  What Havenly is not
                </p>
                <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-200/80">
                  <li>Not therapy or clinical care</li>
                  <li>Not a productivity system</li>
                  <li>Not a public or social platform</li>
                  <li>Not something you must use every day</li>
                </ul>
              </div>
            </div>

            {/* AI */}
            <div className="mt-10 max-w-4xl">
              <h2 className="text-lg font-semibold text-slate-100">
                How AI is used
              </h2>
              <p className="mt-3 text-sm text-slate-200/75">
                Havenly uses AI to gently reflect your words back to you. It may
                highlight emotions, patterns, or themes — not to label you, but
                to help you see yourself more clearly.
              </p>
              <p className="mt-3 text-sm text-slate-200/75">
                The AI is designed to support reflection, not replace human
                judgment, relationships, or professional help.
              </p>
            </div>

            {/* PRIVACY */}
            <div className="mt-10 max-w-4xl">
              <h2 className="text-lg font-semibold text-slate-100">
                Privacy comes first
              </h2>
              <p className="mt-3 text-sm text-slate-200/75">
                Your journal is meant to stay yours. Entries are stored securely
                and are not used to train public models. Havenly is built around
                the idea that your inner life is not content.
              </p>
              <p className="mt-3 text-sm text-slate-200/75">
                If you would like more detail, you can read our{" "}
                <Link href="/privacy" className="text-emerald-300 hover:underline">
                  Privacy Policy →
                </Link>
              </p>
            </div>

            {/* BOTTOM CTA ROW */}
            <div className="mt-10 border-t border-slate-800 pt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  Havenly works best when you use it honestly, gently, and at
                  your own pace.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/magic-login"
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                  >
                    Start free journal
                  </Link>
                  <Link
                    href="/blog"
                    className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-900"
                  >
                    Explore the blog →
                  </Link>
                </div>
              </div>
            </div>
            {/* END */}
          </div>
        </div>
      </section>
    </main>
  );
}
