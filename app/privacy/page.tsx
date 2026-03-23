import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Privacy Policy
        </p>

        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Your privacy comes first.
        </h1>

        <p className="mt-3 max-w-2xl text-sm text-slate-300">
          Havenly is designed to be a quiet, private place for reflection. This
          page explains what we collect, what we don&apos;t, and how your data is
          handled.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-sm">
          <p className="text-xs text-slate-300">
            <span className="font-semibold text-slate-100">Last updated:</span>{" "}
            June 1, 2025
          </p>
          <p className="mt-2 text-xs text-slate-300">
            If you have questions, contact us at{" "}
            <span className="font-semibold text-slate-100">
              havenly.support@gmail.com
            </span>
            .
          </p>
        </div>

        <div className="mt-10 space-y-10 text-sm">
          <section>
            <h2 className="text-lg font-semibold text-slate-100">
              What Havenly is (and is not)
            </h2>
            <p className="mt-2 text-slate-300">
              Havenly is a journaling and reflection companion. It is not a
              clinical service, not emergency support, and not a substitute for
              professional care. If you are in immediate danger or experiencing a
              crisis, please contact your local emergency services or a crisis
              helpline.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">
              What information we collect
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
              <li>
                <span className="font-semibold text-slate-100">
                  Account details:
                </span>{" "}
                email address and basic authentication identifiers required to
                sign you in.
              </li>
              <li>
                <span className="font-semibold text-slate-100">
                  Your content:
                </span>{" "}
                journal entries and related reflections you submit.
              </li>
              <li>
                <span className="font-semibold text-slate-100">
                  Usage/security data:
                </span>{" "}
                limited technical data needed for reliability, abuse prevention,
                and troubleshooting (for example, timestamps and basic request
                metadata).
              </li>
              <li>
                <span className="font-semibold text-slate-100">
                  Payment data:
                </span>{" "}
                if you subscribe to Premium, payment details are collected and
                processed directly by Stripe. Havenly does not store your card
                number.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">
              What we do not do
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
              <li>We do not sell your personal data.</li>
              <li>
                We do not turn your private journal into public content by
                default.
              </li>
              <li>
                We do not use your private entries to train AI models — ours or
                anyone else&apos;s. Our AI provider processes your text solely to
                generate the reflection you requested and does not retain or
                train on that data.
              </li>
              <li>We do not serve ads or sell access to your data to advertisers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">
              How your data is used
            </h2>
            <p className="mt-2 text-slate-300">
              We use your data to provide the service (sign-in, saving entries,
              generating reflections you request), to keep the platform secure,
              and to improve reliability and user experience.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">
              AI reflections
            </h2>
            <p className="mt-2 text-slate-300">
              If you choose to generate an AI reflection, the text you provide
              is sent to our AI provider to produce that reflection. We aim to
              keep this processing minimal and aligned to your request. The AI
              provider does not use your data to train models.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">
              Data storage and subprocessors
            </h2>
            <p className="mt-2 text-slate-300">
              Havenly uses third-party infrastructure to operate. Your data is
              stored and processed by these providers strictly to deliver the
              service to you, and for no other purpose. Our current
              subprocessors are:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
              <li>
                <span className="font-semibold text-slate-100">Vercel</span>{" "}
                — hosting and serverless functions.
              </li>
              <li>
                <span className="font-semibold text-slate-100">Supabase</span>{" "}
                — authentication, database storage, and row-level security.
              </li>
              <li>
                <span className="font-semibold text-slate-100">Groq</span>{" "}
                — AI inference for generating reflections.
              </li>
              <li>
                <span className="font-semibold text-slate-100">Stripe</span>{" "}
                — payment processing for Premium subscriptions.
              </li>
              <li>
                <span className="font-semibold text-slate-100">Resend</span>{" "}
                — transactional email delivery (magic links, sign-in codes).
              </li>
            </ul>
            <p className="mt-3 text-slate-300">
              We will update this list if subprocessors change.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">
              Retention and deletion
            </h2>
            <p className="mt-2 text-slate-300">
              We keep your data for as long as your account is active, or as
              needed to provide the service. You can request deletion of your
              account and all associated data by emailing{" "}
              <span className="font-semibold text-slate-100">
                havenly.support@gmail.com
              </span>
              . We will process deletion requests within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">Security</h2>
            <p className="mt-2 text-slate-300">
              We use standard security practices appropriate for a modern web
              application (secure transport, access controls, and least-privilege
              principles). No system can be guaranteed 100% secure, but privacy
              and safety are core product requirements for Havenly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">
              Cookies and analytics
            </h2>
            <p className="mt-2 text-slate-300">
              We use essential cookies for login and session handling. We may use
              privacy-focused analytics to understand broad usage patterns (such
              as page views and feature adoption). Analytics data is aggregated
              and is not used to identify, profile, or target individual users. We
              do not use advertising cookies or third-party tracking pixels.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">
              Your choices
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
              <li>Access and update basic account information.</li>
              <li>Request export or deletion of your data.</li>
              <li>Choose what you write and what you submit for reflection.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">
              Changes to this policy
            </h2>
            <p className="mt-2 text-slate-300">
              If we make material changes to this policy, we will update the
              &ldquo;Last updated&rdquo; date at the top and, where appropriate,
              notify you by email. Continued use of Havenly after changes are
              posted constitutes acceptance of the updated policy.
            </p>
          </section>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700">
          <Link
            href="/terms"
            className="text-emerald-600 transition-colors hover:text-emerald-500"
          >
            Terms of Service →
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-sm">
          <p className="font-semibold text-slate-100">
            Ready to try a private check-in?
          </p>
          <p className="mt-2 max-w-2xl text-xs text-slate-300">
            Start free. Upgrade only if it genuinely helps you go deeper with
            insights, timelines, and richer reflections.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <Link
              href="/magic-login"
              className="rounded-full bg-emerald-400 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-300"
            >
              Start free journaling
            </Link>
            <Link
              href="/upgrade"
              className="rounded-full border border-slate-700 px-4 py-2 font-semibold text-slate-100 hover:border-slate-500 hover:bg-slate-900"
            >
              See what Premium adds
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-slate-700 px-4 py-2 font-semibold text-slate-100 hover:border-slate-500 hover:bg-slate-900"
            >
              Learn about Havenly →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
