import Link from "next/link";
import HomeBelowFold from "./(home)/HomeBelowFold";
import { CONFIG, BRAND } from "@/app/lib/config";

export const metadata = {
  title: BRAND.fullTitle,
  description: CONFIG.description,
  openGraph: {
    title: BRAND.fullTitle,
    description: CONFIG.ogDescription,
    url: CONFIG.siteUrl + "/",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-qm-bg bg-qm-hero-gradient text-qm-primary">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pb-14 pt-10 sm:pb-20 sm:pt-14 md:pb-28 md:pt-20">

        {/* Glow layers — periwinkle + lavender */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full blur-[110px]"
          style={{ backgroundColor: "rgba(139, 157, 255, 0.12)" }}
        />
        <div
          className="pointer-events-none absolute right-[-60px] top-24 h-72 w-72 rounded-full blur-[90px]"
          style={{ backgroundColor: "rgba(154, 141, 192, 0.08)" }}
        />

        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[minmax(0,1fr)_minmax(340px,460px)] md:items-center md:gap-14">

          {/* ─── LEFT — Copy ─────────────────────────────────────── */}
          <div className="max-w-xl">

            {/* Definition pill */}
            <div
              className="animate-fade-in anim-delay-0 mb-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5"
              style={{
                borderColor: "var(--qm-accent-border)",
                backgroundColor: "var(--qm-accent-soft)",
              }}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: "var(--qm-accent)",
                  boxShadow: "0 0 6px rgba(139, 157, 255, 0.6)",
                }}
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-qm-accent">
                Private AI journal
                <span className="hidden sm:inline">
                  {" "}· Write → Reflect → See patterns
                </span>
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up anim-delay-100 font-display text-[2.35rem] font-semibold leading-[1.06] tracking-tight sm:text-5xl md:text-[3.4rem]">
              You&apos;ve been carrying this{" "}
              <br className="hidden sm:block" />
              <em className="not-italic text-qm-accent">for a while now.</em>
            </h1>

            {/* What it is */}
            <p className="animate-fade-in-up anim-delay-200 mt-5 text-base leading-relaxed text-qm-secondary sm:text-[17px]">
              Quiet Mirror is a private journal that reads what you write and{" "}
              <span className="text-qm-primary">gently reflects it back</span>{" "}
              — then, over time, shows you the patterns you&apos;ve been too
              close to see.
            </p>

            {/* Mirror quote */}
            <blockquote
              className="animate-fade-in-up anim-delay-300 mt-5 pl-4"
              style={{ borderLeft: "2px solid var(--qm-accent-border)" }}
            >
              <p className="text-sm italic leading-relaxed text-qm-secondary">
                &ldquo;You&apos;ve been saying &lsquo;I&apos;m fine&rsquo; for
                so long, you&apos;ve started to believe it.&rdquo;
              </p>
              <p className="mt-1 text-xs text-qm-muted">
                Sound familiar? That&apos;s what Quiet Mirror is for.
              </p>
            </blockquote>

            {/* CTAs */}
            <div className="animate-fade-in-up anim-delay-400 mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/magic-login"
                className="qm-btn-primary inline-flex items-center justify-center px-6 py-4 text-base sm:py-3.5 sm:text-sm"
                style={{
                  boxShadow: "0 10px 30px -5px rgba(139, 157, 255, 0.30)",
                }}
              >
                Write your first entry free →
              </Link>
              <Link
                href="/insights/preview"
                className="qm-btn-secondary inline-flex items-center justify-center px-6 py-4 text-base sm:py-3.5 sm:text-sm"
              >
                See a real reflection →
              </Link>
            </div>

            {/* Promise strip */}
            <div
              className="animate-fade-in anim-delay-500 mt-4 rounded-xl border px-4 py-2.5 text-xs text-qm-muted"
              style={{
                borderColor: "var(--qm-border-card)",
                backgroundColor: "var(--qm-accent-soft)",
              }}
            >
              ✓&nbsp;Journal in under 60 seconds &nbsp;·&nbsp; ✓&nbsp;First
              reflection within moments &nbsp;·&nbsp; ✓&nbsp;No setup, no quiz
            </div>

            {/* Trust signals */}
            <div className="animate-fade-in anim-delay-600 mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-qm-muted">
              {[
                "Private by default",
                "Entries never train AI models",
                "Free plan, no expiry",
                "No ads, ever",
              ].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-qm-accent" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ─── RIGHT — Product preview card ────────────────────── */}
          <div className="relative mx-auto w-full max-w-[460px]">
            {/* Glow behind card */}
            <div
              className="pointer-events-none absolute -inset-6 rounded-[2.5rem] blur-[80px]"
              style={{ backgroundColor: "rgba(139, 157, 255, 0.09)" }}
            />

            <div
              className="animate-fade-in anim-delay-300 relative overflow-hidden rounded-[2rem] border backdrop-blur"
              style={{
                borderColor: "var(--qm-border-card)",
                boxShadow: "var(--qm-shadow-card-lift)",
              }}
            >
              {/* Card chrome */}
              <div
                className="flex items-center justify-between border-b px-6 py-4"
                style={{
                  borderColor: "var(--qm-border-card)",
                  backgroundColor: "var(--qm-bg)",
                }}
              >
                <span className="flex items-center gap-2 text-xs text-qm-muted">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: "var(--qm-accent)",
                      boxShadow: "0 0 6px rgba(139, 157, 255, 0.6)",
                    }}
                  />
                  Evening check-in
                </span>
                <span
                  className="rounded-full border px-2.5 py-0.5 text-[10px] font-medium text-qm-faint"
                  style={{ borderColor: "var(--qm-border-subtle)" }}
                >
                  Private · Just for you
                </span>
              </div>

              {/* ── INPUT section ─────────────────────────────────── */}
              <div
                className="px-6 pb-5 pt-5"
                style={{ backgroundColor: "var(--qm-bg)" }}
              >
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-muted">
                  What you wrote
                </p>
                <div
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: "var(--qm-border-card)",
                    backgroundColor: "var(--qm-bg-elevated)",
                  }}
                >
                  <p className="text-sm leading-relaxed text-qm-secondary">
                    &ldquo;I keep telling people I&apos;m okay, but lately even
                    small things feel heavier than they should.&rdquo;
                  </p>
                </div>
              </div>

              {/* ── OUTPUT section — accent-tinted ────────────────── */}
              <div
                className="border-t px-6 pb-6 pt-5"
                style={{
                  borderColor: "var(--qm-accent-border)",
                  backgroundColor: "var(--qm-bg-card)",
                }}
              >
                {/* Section label */}
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="h-px flex-1"
                    style={{ backgroundColor: "var(--qm-accent-border)" }}
                  />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-accent"
                    style={{ opacity: 0.7 }}
                  >
                    Quiet Mirror reflects
                  </span>
                  <div
                    className="h-px flex-1"
                    style={{ backgroundColor: "var(--qm-accent-border)" }}
                  />
                </div>

                {/* Reflection text */}
                <p className="text-[15px] leading-[1.7] text-qm-primary">
                  It sounds like you&apos;ve been carrying more than
                  you&apos;ve let yourself name. This doesn&apos;t read like
                  one bad day — it reads like a weight that&apos;s been
                  building quietly.
                </p>

                {/* Signal tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    {
                      label: "Emotional load",
                      border: "rgba(139, 157, 255, 0.25)",
                      bg: "rgba(139, 157, 255, 0.10)",
                      text: "var(--qm-accent)",
                    },
                    {
                      label: "Masking",
                      border: "rgba(154, 141, 192, 0.25)",
                      bg: "rgba(154, 141, 192, 0.10)",
                      text: "var(--qm-accent-2)",
                    },
                    {
                      label: "Burnout signal",
                      border: "rgba(200, 170, 100, 0.25)",
                      bg: "rgba(200, 170, 100, 0.10)",
                      text: "#c8aa64",
                    },
                  ].map(({ label, border, bg, text }) => (
                    <span
                      key={label}
                      className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                      style={{
                        borderColor: border,
                        backgroundColor: bg,
                        color: text,
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-[11px] text-qm-faint">
                    Never leaves your account.
                  </p>
                  <Link
                    href="/insights/preview"
                    className="text-[11px] font-medium text-qm-accent transition-colors hover:opacity-80"
                  >
                    See full example →
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <HomeBelowFold />
    </div>
  );
}
