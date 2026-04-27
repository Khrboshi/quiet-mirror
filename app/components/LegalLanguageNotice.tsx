// app/components/LegalLanguageNotice.tsx
// Shown at the top of Privacy Policy and Terms of Service pages
// when the user's locale is not English. Explains the policy is in
// English and links to the support email for questions.

import { CONFIG } from "@/app/lib/config";

type Props = {
  /** Full notice string, e.g. "This policy is written in English. For questions, contact us." */
  notice:    string;
  /** The exact substring used as the clickable link, e.g. "contact us" */
  linkLabel: string;
};

/**
 * app/components/LegalLanguageNotice.tsx
 *
 * Disclaimer shown on privacy and terms pages noting that the
 * authoritative version of legal documents is in English.
 */
export default function LegalLanguageNotice({ notice, linkLabel }: Props) {
  // If the linkLabel placeholder isn't found in the notice string,
  // render the notice as plain text to avoid malformed output.
  if (!notice.includes(linkLabel)) {
    return (
      <div className="mb-8 rounded-xl border border-qm-border-card bg-qm-elevated px-5 py-3 text-sm text-qm-secondary">
        {notice}
      </div>
    );
  }

  const parts  = notice.split(linkLabel);
  const before = parts[0];
  // Join remaining parts in case linkLabel appears more than once
  const after  = parts.slice(1).join(linkLabel);

  return (
    <div className="mb-8 rounded-xl border border-qm-border-card bg-qm-elevated px-5 py-3 text-sm text-qm-secondary">
      {before}
      <a
        href={`mailto:${CONFIG.supportEmail}`}
        className="font-semibold text-qm-accent underline underline-offset-2 hover:text-qm-accent-hover"
      >
        {linkLabel}
      </a>
      {after}
    </div>
  );
}
