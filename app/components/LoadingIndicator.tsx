// app/components/LoadingIndicator.tsx
//
// Shared loading spinner used by every route-level loading.tsx and any
// <Suspense fallback> that needs the same visual. Server component — reads
// the active locale from cookies so the label is always localised.
//
// Two surfaces:
//   • <LoadingIndicator />                    — async, default. For route
//     loading.tsx files. Reads cookies itself.
//   • <LoadingIndicatorInline label={...} />  — sync. For <Suspense fallback>
//     where the parent server component has already resolved the label.
//     (Async components inside a Suspense fallback can behave surprisingly —
//      keep the fallback synchronous.)
//
// Both variants share the same pill markup; only the outer container and
// dot colour differ, matching the visuals the app used before this DRY pass.

import { getRequestTranslations } from "@/app/lib/i18n/server";

type Variant = "route" | "inline";

function Pill({ label, variant }: { label: string; variant: Variant }) {
  const outerClass =
    variant === "route"
      ? "flex min-h-[60vh] items-center justify-center bg-qm-bg"
      : "flex min-h-[60vh] items-center justify-center";

  const pillClass =
    variant === "route"
      ? "flex items-center gap-3 rounded-full border border-qm-border-subtle bg-qm-card px-4 py-2 text-sm text-qm-secondary"
      : "flex items-center gap-3 rounded-full border border-qm-border-subtle bg-qm-elevated px-4 py-2 text-sm text-qm-secondary";

  const dotClass =
    variant === "route"
      ? "h-2 w-2 animate-pulse rounded-full bg-qm-accent"
      : "h-2 w-2 animate-pulse rounded-full bg-qm-positive";

  return (
    <div className={outerClass}>
      <div className={pillClass} role="status" aria-live="polite">
        <span className={dotClass} aria-hidden="true" />
        <span>{label}</span>
      </div>
    </div>
  );
}

/**
 * Synchronous inline variant for use inside <Suspense fallback>.
 * The caller (a server component) passes the already-resolved label.
 */
export function LoadingIndicatorInline({ label }: { label: string }) {
  return <Pill label={label} variant="inline" />;
}

/**
 * Default async variant used by route-level loading.tsx files.
 * Reads the locale from cookies and looks up the label.
 */
export default async function LoadingIndicator({
  variant = "route",
}: {
  variant?: Variant;
} = {}) {
  const t = await getRequestTranslations();
  return <Pill label={t.ui.loadingLabel} variant={variant} />;
}
