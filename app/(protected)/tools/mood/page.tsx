/**
 * app/(protected)/tools/mood/page.tsx
 *
 * Mood check-in tool — lets users log a 1–5 mood score with an optional note.
 * Premium/Trial only. Results feed into the weekly insights summary.
 */
"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import Link from "next/link";
import RequirePremium from "@/app/components/RequirePremium";
import { useTranslation } from "@/app/components/I18nProvider";

type Accent = "slate"|"violet"|"amber"|"sky"|"emerald"|"rose";
const ACCENT_STYLES: Record<Accent,{idle:string;active:string;dot:string}> = {
  slate:   {idle:"border-qm-border-subtle hover:border-qm-border-subtle bg-qm-elevated hover:bg-qm-elevated",active:"border-qm-border-subtle bg-qm-card",dot:"bg-qm-muted"},
  violet:  {idle:"border-qm-premium-border hover:border-qm-premium-border bg-qm-premium-strong/[0.03] hover:bg-qm-premium-strong/[0.06]",active:"border-qm-premium-border bg-qm-premium-strong/[0.08]",dot:"bg-qm-premium"},
  amber:   {idle:"border-qm-warning-border hover:border-qm-warning-border bg-qm-warning-strong/[0.03] hover:bg-qm-warning-strong/[0.06]",active:"border-qm-warning-border bg-qm-warning-strong/[0.08]",dot:"bg-qm-warning"},
  sky:     {idle:"border-qm-premium-border hover:border-qm-premium-border bg-qm-premium-strong/[0.03] hover:bg-qm-premium-strong/[0.06]",active:"border-qm-premium-border bg-qm-premium-strong/[0.08]",dot:"bg-qm-premium"},
  emerald: {idle:"border-qm-positive-border hover:border-qm-positive-border bg-qm-positive-strong/[0.03] hover:bg-qm-positive-strong/[0.06]",active:"border-qm-positive-border bg-qm-positive-strong/[0.08]",dot:"bg-qm-positive"},
  rose:    {idle:"border-qm-danger-border hover:border-qm-danger-border bg-qm-danger-strong/[0.03] hover:bg-qm-danger-strong/[0.06]",active:"border-qm-danger-border bg-qm-danger-strong/[0.08]",dot:"bg-qm-danger"},
};
const ACCENTS: Accent[] = ["slate","violet","slate","sky","amber","emerald","emerald","rose"];

export default function MoodPage() {
  const { t } = useTranslation();
  const m = t.moodTool;
  const MOODS = [
    {label:m.m1Label,description:m.m1Desc,prompt:m.m1Prompt,accent:"slate" as Accent},
    {label:m.m2Label,description:m.m2Desc,prompt:m.m2Prompt,accent:"violet" as Accent},
    {label:m.m3Label,description:m.m3Desc,prompt:m.m3Prompt,accent:"slate" as Accent},
    {label:m.m4Label,description:m.m4Desc,prompt:m.m4Prompt,accent:"sky" as Accent},
    {label:m.m5Label,description:m.m5Desc,prompt:m.m5Prompt,accent:"amber" as Accent},
    {label:m.m6Label,description:m.m6Desc,prompt:m.m6Prompt,accent:"emerald" as Accent},
    {label:m.m7Label,description:m.m7Desc,prompt:m.m7Prompt,accent:"emerald" as Accent},
    {label:m.m8Label,description:m.m8Desc,prompt:m.m8Prompt,accent:"rose" as Accent},
  ];
  const [selected, setSelected] = useState<number|null>(null);
  const mood = selected !== null ? MOODS[selected] : null;
  return (
    <RequirePremium>
      <div className="mx-auto max-w-2xl px-5 py-10">
        {!mood ? (
          <>
            <h1 className="font-display text-2xl font-semibold text-qm-primary sm:text-3xl">{m.heading}</h1>
            <p className="mt-2 text-sm text-qm-muted">{m.choosePrompt}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {MOODS.map((mood, i) => {
                const s = ACCENT_STYLES[mood.accent];
                return (
                  <button key={mood.label} onClick={() => setSelected(i)}
                    className={`group rounded-2xl border px-4 py-4 text-start transition-all duration-150 ${s.idle}`}>
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
                      <div>
                        <p className="text-sm font-semibold text-qm-primary">{mood.label}</p>
                        <p className="text-xs text-qm-faint">{mood.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => setSelected(null)} className="mb-6 text-sm text-qm-muted hover:text-qm-primary transition-colors">{m.backLabel}</button>
            <div className={`rounded-2xl border p-6 ${ACCENT_STYLES[mood.accent].active}`}>
              <p className="text-sm font-semibold text-qm-primary">{mood.label}</p>
              <p className="mt-3 text-base leading-relaxed text-qm-secondary">{mood.prompt}</p>
            </div>
            <div className="mt-6">
              <Link href={`/journal/new?prompt=${encodeURIComponent(mood.prompt)}`}
                className="inline-flex w-full items-center justify-center rounded-full bg-qm-accent px-6 py-3.5 text-sm font-semibold text-white shadow transition-all hover:bg-qm-accent-hover">
                {m.writeEntry}
              </Link>
            </div>
          </>
        )}
      </div>
    </RequirePremium>
  );
}
