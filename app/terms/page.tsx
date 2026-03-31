// app/terms/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { CONFIG } from "@/app/lib/config";
import { PRICING } from "@/app/lib/pricing";
import { PAYMENT } from "@/app/lib/payment";

const LAST_UPDATED = "June 1, 2025";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms governing your use of ${CONFIG.appName}. Your privacy and rights are clearly outlined here.`,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `Terms of Service | ${CONFIG.appName}`,
    description: `Read the terms governing your use of ${CONFIG.appName}.`,
    type: "website",
  },
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-qm-bg text-qm-primary">
      {/* Skip link for keyboard users */}
      <a
        href="#terms-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-qm-accent focus:px-5 focus:py-3 focus:text-sm focus:text-white focus:shadow-lg"
      >
        Skip to terms of service content
      </a>

      <section id="terms-content" className="mx-auto max-w-4xl px-6 pb-16 pt-24">
        <p className="qm-eyebrow text-qm-accent">
          Terms of Service
        </p>

        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Terms of Service
        </h1>

        <p className="mt-3 max-w-2xl text-qm-secondary">
          These terms govern your use of {CONFIG.appName}. By creating an account or
          using the service, you agree to these terms. If you do not agree,
          please do not use {CONFIG.appName}.
        </p>

        <div className="mt-6 rounded-2xl border border-qm-border-card bg-qm-elevated p-5 text-sm shadow-qm-card">
          <p className="text-xs text-qm-secondary">
            <span className="font-semibold text-qm-primary">Last updated:</span>{" "}
            {LAST_UPDATED}
          </p>
          <p className="mt-2 text-xs text-qm-secondary">
            Questions? Contact{" "}
            <a
              href={`mailto:${CONFIG.supportEmail}`}
              className="font-semibold text-qm-accent underline underline-offset-2 transition-colors duration-150 hover:text-qm-accent-hover"
            >
              {CONFIG.supportEmail}
            </a>
            .
          </p>
        </div>

        <div className="mt-10 space-y-10 text-sm" role="article" aria-label="Terms of service details">

          <section id="what-quiet-mirror-is" aria-labelledby="what-quiet-mirror-is-heading">
            <h2 id="what-quiet-mirror-is-heading" className="text-lg font-semibold text-qm-primary">
              1. What {CONFIG.appName} is
            </h2>
            <p className="mt-2 text-qm-secondary">
              {CONFIG.appName} is a private journaling and AI reflection companion. It is
              not therapy, clinical care, crisis support, or a substitute for
              professional mental-health services. If you are in immediate danger
              or experiencing a crisis, please contact your local emergency
              services or a crisis helpline.
            </p>
          </section>

          <section id="eligibility" aria-labelledby="eligibility-heading">
            <h2 id="eligibility-heading" className="text-lg font-semibold text-qm-primary">
              2. Eligibility
            </h2>
            <p className="mt-2 text-qm-secondary">
              You must be at least 16 years old to use {CONFIG.appName}. By creating an
              account you represent that you meet this requirement.
            </p>
          </section>

          <section id="your-account" aria-labelledby="your-account-heading">
            <h2 id="your-account-heading" className="text-lg font-semibold text-qm-primary">
              3. Your account
            </h2>
            <p className="mt-2 text-qm-secondary">
              You are responsible for maintaining the security of your account
              credentials (including the email used for magic-link sign-in). You
              agree to notify us promptly if you believe your account has been
              compromised.
            </p>
          </section>

          <section id="your-content" aria-labelledby="your-content-heading">
            <h2 id="your-content-heading" className="text-lg font-semibold text-qm-primary">
              4. Your content
            </h2>
            <p className="mt-2 text-qm-secondary">
              You retain ownership of all journal entries and content you create
              in {CONFIG.appName}. By submitting content, you grant {CONFIG.appName} a limited
              licence to store, process, and display that content back to you —
              and only to you — as part of the service. We do not claim any
              other rights to your content.
            </p>
          </section>

          <section id="acceptable-use" aria-labelledby="acceptable-use-heading">
            <h2 id="acceptable-use-heading" className="text-lg font-semibold text-qm-primary">
              5. Acceptable use
            </h2>
            <p className="mt-2 text-qm-secondary">You agree not to use {CONFIG.appName} to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-qm-secondary">
              <li>Violate any applicable law or regulation.</li>
              <li>Attempt to gain unauthorised access to {CONFIG.appName} systems or other users&apos; data.</li>
              <li>Transmit malware, spam, or any content designed to disrupt the service.</li>
              <li>Use automated tools (bots, scrapers) to access or extract data from {CONFIG.appName} without written permission.</li>
            </ul>
            <p className="mt-3 text-qm-secondary">
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section id="free-plan" aria-labelledby="free-plan-heading">
            <h2 id="free-plan-heading" className="text-lg font-semibold text-qm-primary">
              6. Free plan
            </h2>
            <p className="mt-2 text-qm-secondary">
              The free plan includes core journaling features and a limited
              number of AI reflections per month (currently {PRICING.freeMonthlyCredits}). We may adjust
              free-plan limits over time. Free accounts that remain inactive for
              an extended period may be subject to deletion after prior notice.
            </p>
          </section>

          <section id="premium" aria-labelledby="premium-heading">
            <h2 id="premium-heading" className="text-lg font-semibold text-qm-primary">
              7. Premium subscription
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-qm-secondary">
              <li>
                <span className="font-semibold text-qm-primary">Pricing:</span>{" "}
                Premium is billed monthly at the price shown on the upgrade page at the time of purchase.
              </li>
              <li>
                <span className="font-semibold text-qm-primary">Free trial:</span>{" "}
                New Premium subscriptions begin with a {PRICING.trialLabel}. You
                will not be charged until the trial ends. If you cancel before
                day {PRICING.trialDays + 1}, no charge is made.
              </li>
              <li>
                <span className="font-semibold text-qm-primary">Renewal:</span>{" "}
                After the trial, your subscription renews automatically each month until you cancel.
              </li>
              <li>
                <span className="font-semibold text-qm-primary">Cancellation:</span>{" "}
                You can cancel at any time from your Settings page. When you cancel, you retain
                access to Premium features until the end of the current billing period.
              </li>
              <li>
                <span className="font-semibold text-qm-primary">Refunds:</span>{" "}
                If Premium is not what you expected, email{" "}
                <a
                  href={`mailto:${CONFIG.supportEmail}`}
                  className="text-qm-accent underline underline-offset-2 transition-colors duration-150 hover:text-qm-accent-hover"
                >
                  {CONFIG.supportEmail}
                </a>{" "}
                and we will issue a full refund for the first subscription period — no questions
                asked. This applies to the first billing cycle only.
              </li>
            </ul>
          </section>

          <section id="payment" aria-labelledby="payment-heading">
            <h2 id="payment-heading" className="text-lg font-semibold text-qm-primary">
              8. Payment processing
            </h2>
            <p className="mt-2 text-qm-secondary">
              Payments are processed by {PAYMENT.providerName}. By subscribing, you also agree
              to {PAYMENT.providerName}&apos;s terms. {CONFIG.appName} does not store your card details.
            </p>
          </section>

          <section id="ai-content" aria-labelledby="ai-content-heading">
            <h2 id="ai-content-heading" className="text-lg font-semibold text-qm-primary">
              9. AI-generated content
            </h2>
            <p className="mt-2 text-qm-secondary">
              Reflections and insights generated by {CONFIG.appName} are produced by AI
              and are intended as prompts for personal reflection only. They are
              not professional advice — medical, psychological, legal, or
              otherwise. You should not rely on AI-generated content as a
              substitute for qualified professional guidance.
            </p>
          </section>

          <section id="privacy" aria-labelledby="privacy-heading">
            <h2 id="privacy-heading" className="text-lg font-semibold text-qm-primary">
              10. Privacy
            </h2>
            <p className="mt-2 text-qm-secondary">
              Your privacy is fundamental to {CONFIG.appName}. Please read our{" "}
              <Link
                href="/privacy"
                className="text-qm-accent underline underline-offset-2 transition-colors hover:text-qm-accent-hover"
              >
                Privacy Policy
              </Link>{" "}
              for details on how we collect, use, and protect your data.
            </p>
          </section>

          <section id="availability" aria-labelledby="availability-heading">
            <h2 id="availability-heading" className="text-lg font-semibold text-qm-primary">
              11. Availability and changes
            </h2>
            <p className="mt-2 text-qm-secondary">
              We strive to keep {CONFIG.appName} available and reliable, but we do not
              guarantee uninterrupted access. We may modify, suspend, or
              discontinue features at any time. We will make reasonable efforts to notify you of
              material changes.
            </p>
          </section>

          <section id="liability" aria-labelledby="liability-heading">
            <h2 id="liability-heading" className="text-lg font-semibold text-qm-primary">
              12. Limitation of liability
            </h2>
            <p className="mt-2 text-qm-secondary">
              To the fullest extent permitted by applicable law, {CONFIG.appName} and its
              operators are not liable for any indirect, incidental, special,
              consequential, or punitive damages, or any loss of data, profits,
              or goodwill arising out of or related to your use of the service.
              Our total cumulative liability for all claims related to the
              service is limited to the amount you have paid us in the 12 months
              preceding the claim.
            </p>
          </section>

          <section id="warranties" aria-labelledby="warranties-heading">
            <h2 id="warranties-heading" className="text-lg font-semibold text-qm-primary">
              13. Disclaimer of warranties
            </h2>
            <p className="mt-2 text-qm-secondary">
              {CONFIG.appName} is provided &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; without warranties of any kind, whether express or
              implied, including but not limited to implied warranties of
              merchantability, fitness for a particular purpose, and
              non-infringement.
            </p>
          </section>

          <section id="changes" aria-labelledby="changes-heading">
            <h2 id="changes-heading" className="text-lg font-semibold text-qm-primary">
              14. Changes to these terms
            </h2>
            <p className="mt-2 text-qm-secondary">
              We may update these terms from time to time. If we make material
              changes, we will update the &ldquo;Last updated&rdquo; date at the
              top and, where appropriate, notify you by email. Continued use of{" "}
              {CONFIG.appName} after changes are posted constitutes acceptance of the
              updated terms.
            </p>
          </section>

          <section id="contact" aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="text-lg font-semibold text-qm-primary">
              15. Contact
            </h2>
            <p className="mt-2 text-qm-secondary">
              For questions, concerns, or requests related to these terms, email us at{" "}
              <a
                href={`mailto:${CONFIG.supportEmail}`}
                className="font-semibold text-qm-accent underline underline-offset-2 transition-colors duration-150 hover:text-qm-accent-hover"
              >
                {CONFIG.supportEmail}
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <Link href="/privacy" className="text-qm-accent transition-colors hover:text-qm-accent-hover">
            Privacy Policy →
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-qm-border-card bg-qm-elevated p-5 text-sm shadow-qm-card">
          <p className="font-semibold text-qm-primary">Ready to try a private check-in?</p>
          <p className="mt-2 max-w-2xl text-xs text-qm-secondary">
            Start free. Upgrade only if it genuinely helps you go deeper with insights, timelines,
            and richer reflections.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <Link href="/magic-login" className="qm-btn-primary inline-block px-4 py-2 text-sm">
              Start free journaling
            </Link>
            <Link href="/upgrade" className="qm-btn-secondary inline-block px-4 py-2 text-sm">
              See what Premium adds
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
