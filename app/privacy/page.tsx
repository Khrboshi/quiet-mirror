// app/privacy/page.tsx
// Server component — no "use client" needed.

import type { Metadata } from "next";
import Link from "next/link";
import { CONFIG } from "@/app/lib/config";
import { PAYMENT } from "@/app/lib/payment";

// ─── Update this date whenever the policy changes ────────────────────────────
const LAST_UPDATED = "June 1, 2025";

// ─── SEO metadata ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Learn how ${CONFIG.appName} collects, uses, and protects your data. Your journal entries are private and never used to train AI models.`,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `Privacy Policy | ${CONFIG.appName}`,
    description: `Learn how ${CONFIG.appName} protects your privacy. Your journal entries are never sold or used to train AI models.`,
    type: "website",
  },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-qm-bg text-qm-primary">
      {/* Skip link for keyboard users */}
      <a
        href="#privacy-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-qm-accent focus:px-5 focus:py-3 focus:text-sm focus:text-white focus:shadow-lg"
      >
        Skip to privacy policy content
      </a>

      <section id="privacy-content" className="mx-auto max-w-4xl px-6 pb-16 pt-24">
        <p className="qm-eyebrow text-qm-accent">
          Privacy Policy
        </p>

        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Your privacy comes first.
        </h1>

        <p className="mt-3 max-w-2xl text-qm-secondary">
          {CONFIG.appName} is designed to be a quiet, private place for
          reflection. This page explains what we collect, what we don&apos;t,
          and how your data is handled.
        </p>

        {/* Meta box - updated with design tokens */}
        <div className="mt-6 rounded-2xl border border-qm-border-card bg-qm-elevated p-5 text-sm shadow-qm-card">
          <p className="text-xs text-qm-secondary">
            <span className="font-semibold text-qm-primary">Last updated:</span>{" "}
            {LAST_UPDATED}
          </p>
          <p className="mt-2 text-xs text-qm-secondary">
            Questions? Email us at{" "}
            <a
              href={`mailto:${CONFIG.supportEmail}`}
              className="font-semibold text-qm-accent underline underline-offset-2 transition-colors duration-150 hover:text-qm-accent-hover"
            >
              {CONFIG.supportEmail}
            </a>
            .
          </p>
        </div>

        {/* Sections */}
        <div className="mt-10 space-y-10 text-sm" role="article" aria-label="Privacy policy details">

          <section id="what-quiet-mirror-is" aria-labelledby="what-quiet-mirror-is-heading">
            <h2 id="what-quiet-mirror-is-heading" className="text-lg font-semibold text-qm-primary">
              What {CONFIG.appName} is (and is not)
            </h2>
            <p className="mt-2 text-qm-secondary">
              {CONFIG.appName} is a journaling and reflection companion. It is
              not a clinical service, not emergency support, and not a
              substitute for professional care. If you are in immediate danger
              or experiencing a crisis, please contact your local emergency
              services or a crisis helpline.
            </p>
          </section>

          <section id="what-we-collect" aria-labelledby="what-we-collect-heading">
            <h2 id="what-we-collect-heading" className="text-lg font-semibold text-qm-primary">
              What information we collect
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-qm-secondary">
              <li>
                <span className="font-semibold text-qm-primary">
                  Account details:
                </span>{" "}
                email address and basic authentication identifiers required to
                sign you in.
              </li>
              <li>
                <span className="font-semibold text-qm-primary">
                  Your content:
                </span>{" "}
                journal entries and related reflections you submit.
              </li>
              <li>
                <span className="font-semibold text-qm-primary">
                  Usage/security data:
                </span>{" "}
                limited technical data needed for reliability, abuse prevention,
                and troubleshooting (for example, timestamps and basic request
                metadata).
              </li>
              <li>
                <span className="font-semibold text-qm-primary">
                  Payment data:
                </span>{" "}
                if you subscribe to Premium, payment details are collected and
                processed directly by {PAYMENT.providerName}.{" "}
                {CONFIG.appName} does not store your card number.
              </li>
            </ul>
          </section>

          <section id="what-we-do-not-do" aria-labelledby="what-we-do-not-do-heading">
            <h2 id="what-we-do-not-do-heading" className="text-lg font-semibold text-qm-primary">
              What we do not do
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-qm-secondary">
              <li>We do not sell your personal data.</li>
              <li>
                We do not turn your private journal into public content by
                default.
              </li>
              <li>
                We do not use your private entries to train AI models — ours or
                anyone else&apos;s. Our AI provider processes your text solely
                to generate the reflection you requested and does not retain or
                train on that data.
              </li>
              <li>
                We do not serve ads or sell access to your data to advertisers.
              </li>
            </ul>
          </section>

          <section id="how-data-is-used" aria-labelledby="how-data-is-used-heading">
            <h2 id="how-data-is-used-heading" className="text-lg font-semibold text-qm-primary">
              How your data is used
            </h2>
            <p className="mt-2 text-qm-secondary">
              We use your data to provide the service (sign-in, saving entries,
              generating reflections you request), to keep the platform secure,
              and to improve reliability and user experience.
            </p>
          </section>

          <section id="ai-reflections" aria-labelledby="ai-reflections-heading">
            <h2 id="ai-reflections-heading" className="text-lg font-semibold text-qm-primary">
              AI reflections
            </h2>
            <p className="mt-2 text-qm-secondary">
              If you choose to generate an AI reflection, the text you provide
              is sent to our AI provider to produce that reflection. We aim to
              keep this processing minimal and aligned to your request. The AI
              provider does not use your data to train models.
            </p>
          </section>

          <section id="data-storage" aria-labelledby="data-storage-heading">
            <h2 id="data-storage-heading" className="text-lg font-semibold text-qm-primary">
              Data storage and subprocessors
            </h2>
            <p className="mt-2 text-qm-secondary">
              {CONFIG.appName} uses third-party infrastructure to operate. Your
              data is stored and processed by these providers strictly to
              deliver the service to you, and for no other purpose. Our current
              subprocessors are:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-qm-secondary">
              <li>
                <span className="font-semibold text-qm-primary">Vercel</span>{" "}
                — hosting and serverless functions.
              </li>
              <li>
                <span className="font-semibold text-qm-primary">Supabase</span>{" "}
                — authentication, database storage, and row-level security.
              </li>
              <li>
                <span className="font-semibold text-qm-primary">Groq</span>{" "}
                — AI inference for generating reflections.
              </li>
              <li>
                <span className="font-semibold text-qm-primary">
                  {PAYMENT.providerName}
                </span>{" "}
                — payment processing for Premium subscriptions.
              </li>
              <li>
                <span className="font-semibold text-qm-primary">Resend</span>{" "}
                — transactional email delivery (magic links, sign-in codes).
              </li>
            </ul>
            <p className="mt-3 text-qm-secondary">
              We will update this list if subprocessors change.
            </p>
          </section>

          <section id="retention" aria-labelledby="retention-heading">
            <h2 id="retention-heading" className="text-lg font-semibold text-qm-primary">
              Retention and deletion
            </h2>
            <p className="mt-2 text-qm-secondary">
              We keep your data for as long as your account is active, or as
              needed to provide the service. You can request deletion of your
              account and all associated data by emailing{" "}
              <a
                href={`mailto:${CONFIG.supportEmail}`}
                className="font-semibold text-qm-accent underline underline-offset-2 transition-colors duration-150 hover:text-qm-accent-hover"
              >
                {CONFIG.supportEmail}
              </a>
              . We will process deletion requests within 30 days.
            </p>
          </section>

          <section id="security" aria-labelledby="security-heading">
            <h2 id="security-heading" className="text-lg font-semibold text-qm-primary">
              Security
            </h2>
            <p className="mt-2 text-qm-secondary">
              We use standard security practices appropriate for a modern web
              application (secure transport, access controls, and
              least-privilege principles). No system can be guaranteed 100%
              secure, but privacy and safety are core product requirements for{" "}
              {CONFIG.appName}.
            </p>
          </section>

          <section id="cookies" aria-labelledby="cookies-heading">
            <h2 id="cookies-heading" className="text-lg font-semibold text-qm-primary">
              Cookies and analytics
            </h2>
            <p className="mt-2 text-qm-secondary">
              We use essential cookies for login and session handling. We may
              use privacy-focused analytics to understand broad usage patterns
              (such as page views and feature adoption). Analytics data is
              aggregated and is not used to identify, profile, or target
              individual users. We do not use advertising cookies or third-party
              tracking pixels.
            </p>
          </section>

          <section id="your-choices" aria-labelledby="your-choices-heading">
            <h2 id="your-choices-heading" className="text-lg font-semibold text-qm-primary">
              Your choices
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-qm-secondary">
              <li>Access and update basic account information.</li>
              <li>Request export or deletion of your data.</li>
              <li>
                Choose what you write and what you submit for reflection.
              </li>
            </ul>
          </section>

          <section id="changes" aria-labelledby="changes-heading">
            <h2 id="changes-heading" className="text-lg font-semibold text-qm-primary">
              Changes to this policy
            </h2>
            <p className="mt-2 text-qm-secondary">
              If we make material changes to this policy, we will update the
              &ldquo;Last updated&rdquo; date at the top and, where appropriate,
              notify you by email. Continued use of {CONFIG.appName} after
              changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>
        </div>

        {/* Related link */}
        <div className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <Link
            href="/terms"
            className="text-qm-accent transition-colors duration-150 hover:text-qm-accent-hover"
          >
            Terms of Service →
          </Link>
        </div>

        {/* CTA - updated with design tokens */}
        <div className="mt-6 rounded-2xl border border-qm-border-card bg-qm-elevated p-5 text-sm shadow-qm-card">
          <p className="font-semibold text-qm-primary">
            Ready to try a private check-in?
          </p>
          <p className="mt-2 max-w-2xl text-xs text-qm-secondary">
            Start free. Upgrade only if it genuinely helps you go deeper with
            insights, timelines, and richer reflections.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <Link
              href="/magic-login"
              className="qm-btn-primary inline-block px-4 py-2 text-sm"
            >
              Start free journaling
            </Link>
            <Link
              href="/upgrade"
              className="qm-btn-secondary inline-block px-4 py-2 text-sm"
            >
              See what Premium adds
            </Link>
            <Link
              href="/about"
              className="qm-btn-secondary inline-block px-4 py-2 text-sm"
            >
              Learn about {CONFIG.appName} →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
