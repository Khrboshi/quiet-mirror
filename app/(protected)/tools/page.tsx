/**
 * app/(protected)/tools/page.tsx
 *
 * Tools hub — server-rendered page listing available Premium tools.
 * Designed to reassure subscribers they made the right decision: clear,
 * warm, unhurried. No feature counts, no comparison to free tier.
 * Links to Mood, Reflection, and Suggestions.
 *
 * Copy → app/lib/i18n/en.ts → toolsPage
 * Trust signals → app/lib/marketing.ts → MARKETING
 * Design standards → docs/REQUIREMENTS.md §6 (tools hub surface)
 */
import Link from "next/link";
import { getRequestTranslations } from "@/app/lib/i18n/server";
import { MARKETING } from "@/app/lib/marketing";

export const dynamic = "force-dynamic";

/** Inline SVG icons — kept as components to avoid an icon library dep. */
function MoodIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="7.5" cy="8.5" r="1" fill="currentColor" />
      <circle cx="12.5" cy="8.5" r="1" fill="currentColor" />
      <path
        d="M7 13 Q10 15 13 13"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function ReflectionIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 6h12M4 10h8M4 14h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle
        cx="15.5"
        cy="14"
        r="2.8"
        fill="var(--qm-accent-soft)"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function SuggestionsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.5 C10 2.5 4.5 7 4.5 11.5 a5.5 5.5 0 0 0 11 0 C15.5 7 10 2.5 10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        strokeLinejoin="round"
      />
      <path d="M8 16v1.5M12 16v1.5M8 17.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/** Individual tool card. */
function ToolCard({
  href,
  tag,
  title,
  description,
  openLabel,
  iconColorClass,
  iconBgClass,
  icon,
}: {
  href: string;
  tag: string;
  title: string;
  description: string;
  openLabel: string;
  iconColorClass: string;
  iconBgClass: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "group relative flex flex-col overflow-hidden rounded-2xl p-6",
        "border border-qm-border-subtle bg-qm-elevated",
        "transition-all duration-200",
        "hover:border-qm-accent-border hover:bg-qm-soft",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[var(--qm-focus-ring-color)] focus-visible:ring-offset-2",
        "focus-visible:ring-offset-[var(--qm-bg)]",
      ].join(" ")}
    >
      {/* Icon */}
      <div
        className={[
          "mb-4 flex h-9 w-9 items-center justify-center rounded-xl",
          iconBgClass,
          iconColorClass,
        ].join(" ")}
      >
        {icon}
      </div>

      {/* Tag + Title */}
      <p className="qm-eyebrow mb-1.5 text-qm-faint">{tag}</p>
      <h2 className="mb-2 font-display text-base font-semibold text-qm-primary leading-snug">
        {title}
      </h2>

      {/* Description */}
      <p className="flex-1 text-sm text-qm-muted leading-relaxed">{description}</p>

      {/* CTA */}
      <p className="mt-5 text-xs font-medium text-qm-accent transition-colors duration-150 group-hover:text-qm-accent-hover">
        {openLabel}
      </p>
    </Link>
  );
}

export default async function ToolsPage() {
  const t = await getRequestTranslations();

  const tools = [
    {
      href: "/tools/mood",
      tag: t.toolsPage.moodTag,
      title: t.toolsPage.moodTitle,
      description: t.toolsPage.moodSubtitle,
      icon: <MoodIcon />,
      iconBgClass: "bg-qm-premium-soft",
      iconColorClass: "text-qm-premium",
    },
    {
      href: "/tools/reflection",
      tag: t.toolsPage.reflectionTag,
      title: t.toolsPage.reflectionTitle,
      description: t.toolsPage.reflectionSubtitle,
      icon: <ReflectionIcon />,
      iconBgClass: "bg-qm-accent-soft",
      iconColorClass: "text-qm-accent",
    },
    {
      href: "/tools/suggestions",
      tag: t.toolsPage.suggestionsTag,
      title: t.toolsPage.suggestionsTitle,
      description: t.toolsPage.suggestionsSubtitle,
      icon: <SuggestionsIcon />,
      iconBgClass: "bg-qm-positive-soft",
      iconColorClass: "text-qm-positive",
    },
  ] as const;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 space-y-8">
      {/* Header */}
      <header className="space-y-2 animate-fade-in-up anim-delay-0">
        <p className="qm-eyebrow text-qm-premium">{t.toolsPage.pageLabel}</p>
        <h1 className="font-display text-3xl font-semibold text-qm-primary">
          {t.toolsPage.pageTitle}
        </h1>
        <p className="text-sm text-qm-muted max-w-md leading-relaxed">
          {t.toolsPage.pageSubtitle}
        </p>
      </header>

      {/* Tool cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 stagger-children is-visible">
        {tools.map((tool) => (
          <ToolCard key={tool.href} openLabel={t.toolsPage.openLabel} {...tool} />
        ))}
      </div>

      {/* Trust strip */}
      <footer
        className="border-t border-qm-border-subtle pt-5 animate-fade-in-up anim-delay-400"
        aria-label="Privacy commitments"
      >
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {[
            MARKETING.privateByDefault,
            MARKETING.neverTrainsAI,
            MARKETING.noAds,
          ].map((signal) => (
            <li
              key={signal}
              className="flex items-center gap-2 text-[11px] text-qm-faint"
            >
              <span
                className="h-1 w-1 rounded-full bg-qm-positive-muted flex-shrink-0"
                aria-hidden="true"
              />
              {signal}
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}
