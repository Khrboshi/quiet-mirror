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

export default function LegalLanguageNotice({ notice, linkLabel }: Props) {
  const parts = notice.split(linkLabel);
  const before = parts[0] ?? "";
  const after  = parts[1] ?? "";

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
