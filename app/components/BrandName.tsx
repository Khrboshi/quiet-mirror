/**
 * app/components/BrandName.tsx
 *
 * Renders CONFIG.appName wrapped in the font-brand-name class so the
 * Latin display font is preserved in RTL (Arabic) contexts.
 * Server-safe — usable in both server and client components.
 * See docs/DESIGN.md §10 and the [dir="rtl"] .font-brand-name rule in globals.css.
 */
import { CONFIG } from "@/app/lib/config";

interface BrandNameProps {
  /** Additional Tailwind classes to apply alongside font-brand-name */
  className?: string;
}

export default function BrandName({ className }: BrandNameProps) {
  const classes = ["font-brand-name", className].filter(Boolean).join(" ");
  return <span className={classes}>{CONFIG.appName}</span>;
}
