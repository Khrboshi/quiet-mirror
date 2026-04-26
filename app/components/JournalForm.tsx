"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/app/components/I18nProvider";

type Props = Record<string, never>;

function safeSlice(value: string, max: number) {
  const s = (value || "").trim();
  if (!s) return "";
  return s.length > max ? s.slice(0, max) : s;
}

function pickSeed(title: string, content: string) {
  const base = `${title || ""}\n${content || ""}`.trim();
  return safeSlice(base.replace(/\s+/g, " "), 180);
}

export default function JournalForm(_props: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const [title, setTitle]           = useState("");
  const [content, setContent]       = useState("");
  const [status, setStatus]         = useState<"idle" | "saving" | "error" | "success">("idle");
  const [error, setError]           = useState<string>("");
  const [entryProgress, setEntryProgress] = useState(0);
  const [showTitle, setShowTitle]   = useState(false);
  const [promptsFaded, setPromptsFaded] = useState(false);
  const [isFocused, setIsFocused]   = useState(false);

  const didPrefillRef = useRef(false);
  const textareaRef   = useRef<HTMLTextAreaElement>(null);

  // ── Auto-grow textarea ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 280)}px`;
  }, [content]);

  // ── Query-param prefill ────────────────────────────────────────────────────
  useEffect(() => {
    if (didPrefillRef.current) return;
    const qpTitle  = safeSlice(searchParams.get("title")  ?? "", 120);
    const qpPrompt = safeSlice(searchParams.get("prompt") ?? "", 2000);
    const qpMood   = safeSlice(searchParams.get("mood")   ?? "", 32);
    const nextTitle   = qpTitle || (qpMood ? `Mood: ${qpMood}` : "");
    const nextContent = qpPrompt || (qpMood ? `Right now I'm feeling ${qpMood}.\n\n` : "");
    setTitle((prev)   => (prev.trim() ? prev : nextTitle));
    setContent((prev) => (prev.trim() ? prev : nextContent));
    if (qpPrompt || qpMood) setTimeout(() => textareaRef.current?.focus(), 100);
    didPrefillRef.current = true;
  }, [searchParams]);

  // ── Insight stage ──────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const stage = Number(sessionStorage.getItem("havenly:insight_stage") || "0");
      setEntryProgress(Math.min(3, stage));
    } catch {}
  }, []);

  const canSave = useMemo(
    () => content.trim().length > 0 && status !== "saving",
    [content, status]
  );

  const incomingPrompt  = safeSlice(searchParams.get("prompt") ?? "", 200);
  const hasIncomingPrompt = Boolean(incomingPrompt);
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  function handleStarterPrompt(prompt: string) {
    setContent((prev) => {
      const trimmed = prev.trim();
      return trimmed ? prev : `${prompt}\n\n`;
    });
    setPromptsFaded(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const contentTrimmed = content.trim();
    if (!contentTrimmed) {
      setStatus("error");
      setError(t.errors.entryEmpty);
      return;
    }
    setStatus("saving");
    try {
      const res = await fetch("/api/journal/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title: title.trim() || null, content: contentTrimmed }),
        cache:   "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setError(json?.error || json?.message || t.errors.entrySaveFailed);
        return;
      }
      setStatus("success");
      try {
        sessionStorage.setItem("havenly:show_insight_preview", "1");
        sessionStorage.setItem("havenly:last_seed", pickSeed(title, contentTrimmed));
        const prev = Number(sessionStorage.getItem("havenly:insight_stage") || "0");
        const next = Math.min(3, (Number.isFinite(prev) ? prev : 0) + 1);
        sessionStorage.setItem("havenly:insight_stage", String(next));
      } catch {}
      const id = json?.entry?.id;
      if (id) { router.push(`/journal/${id}`); router.refresh(); return; }
      router.push("/journal");
      router.refresh();
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : t.errors.networkError);
    }
  }

  // ── Progress bar ──────────────────────────────────────────────────────────
  const progressPct = (entryProgress / 3) * 100;

  return (
    <form onSubmit={onSubmit} className="w-full pb-32">

      {/* ── Ambient top rule ─────────────────────────────────────────────── */}
      <div className="flex items-end pt-16 pb-1 mb-6">
        <div
          className="h-px w-7 rounded-full"
          style={{ backgroundColor: "var(--qm-accent-border)" }}
        />
      </div>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="mb-7 animate-fade-in">
        <p className="qm-eyebrow text-qm-accent" style={{ opacity: 0.65 }}>
          {t.journal.newEntryLabel}
        </p>
        <h1 className="font-display mt-2.5 text-[1.75rem] font-medium leading-[1.12] tracking-tight text-qm-primary sm:text-[2rem]">
          {hasIncomingPrompt ? incomingPrompt : t.journal.newEntryHeading}
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-qm-muted">
          {t.journal.newEntrySubheading}
        </p>
      </div>

      {/* ── Starter prompts ──────────────────────────────────────────────── */}
      {!hasIncomingPrompt && (
        <div
          className="mb-7 transition-all duration-500"
          style={{
            opacity:    promptsFaded || content.trim().length > 0 ? 0 : 1,
            pointerEvents: promptsFaded || content.trim().length > 0 ? "none" : "auto",
            transform:  promptsFaded || content.trim().length > 0
              ? "translateY(-4px)"
              : "translateY(0)",
          }}
        >
          <p className="mb-2.5 text-[11px] tracking-wide text-qm-faint">
            {t.journal.notSureWhereToStart}
          </p>
          <div className="flex flex-wrap gap-2">
            {t.journal.starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleStarterPrompt(prompt)}
                className="rounded-full px-3.5 py-[7px] text-xs text-qm-muted transition-all duration-150"
                style={{
                  border:          "1px solid var(--qm-accent-border)",
                  backgroundColor: "transparent",
                  opacity:         0.7,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity         = "1";
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--qm-accent-soft)";
                  (e.currentTarget as HTMLButtonElement).style.color           = "var(--qm-text-primary)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor     = "var(--qm-accent-border)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity         = "0.7";
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color           = "";
                  (e.currentTarget as HTMLButtonElement).style.borderColor     = "var(--qm-accent-border)";
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Writing surface ───────────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl transition-all duration-200"
        style={{
          border:     `1px solid ${isFocused ? "var(--qm-accent-border)" : "var(--qm-border-card)"}`,
          background: "var(--qm-bg-elevated)",
          boxShadow:  isFocused
            ? "0 0 0 3px var(--qm-accent-soft)"
            : "var(--qm-shadow-card)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t.journal.textareaPlaceholder}
          autoFocus={!hasIncomingPrompt}
          className="w-full resize-none bg-transparent px-6 pb-14 pt-6 text-base leading-[1.8] text-qm-primary placeholder:text-qm-faint outline-none sm:text-[16.5px]"
          style={{ minHeight: "280px" }}
        />

        {/* Word count — bottom-right of surface */}
        <span
          className="absolute bottom-5 right-5 text-[11px] tracking-wide pointer-events-none transition-opacity duration-300"
          style={{
            color:   "var(--qm-text-faint)",
            opacity: wordCount > 0 ? 0.7 : 0,
          }}
        >
          {t.ui.wordCount(wordCount)}
        </span>
      </div>

      {/* ── Below-surface row ─────────────────────────────────────────────── */}
      <div className="mt-3.5 flex items-center justify-between">
        {!showTitle ? (
          <button
            type="button"
            onClick={() => setShowTitle(true)}
            className="text-xs transition-colors duration-150"
            style={{ color: "var(--qm-text-faint)", opacity: 0.6 }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              (e.currentTarget as HTMLButtonElement).style.color   = "var(--qm-text-muted)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.6";
              (e.currentTarget as HTMLButtonElement).style.color   = "var(--qm-text-faint)";
            }}
          >
            {t.journal.addTitleOptional}
          </button>
        ) : (
          <div className="flex-1" />
        )}

        {/* Privacy note */}
        <span
          className="flex items-center gap-1.5 text-[11px]"
          style={{ color: "var(--qm-text-faint)", opacity: 0.45 }}
        >
          {/* Lock icon */}
          <svg width="9" height="11" viewBox="0 0 9 11" fill="none" aria-hidden="true">
            <rect x="0.5" y="4.5" width="8" height="6" rx="1"
              fill="var(--qm-text-faint)" />
            <path d="M2.5 4.5V3A2 2 0 016.5 3v1.5"
              stroke="var(--qm-text-faint)" strokeWidth="1.1" fill="none" />
          </svg>
          {t.journal.privacyReminderShort}
        </span>
      </div>

      {/* Optional title input */}
      {showTitle && (
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.journal.titlePlaceholder}
          autoFocus
          className="mt-3 w-full bg-transparent text-sm text-qm-primary placeholder:text-qm-faint outline-none pb-2"
          style={{ borderBottom: "1px solid var(--qm-border-subtle)" }}
          maxLength={120}
        />
      )}

      {/* ── Progress bar ─────────────────────────────────────────────────── */}
      {entryProgress < 3 && (
        <div className="mt-6 flex items-center gap-3">
          <div
            className="flex-1 h-[2px] rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--qm-accent-soft)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width:           `${progressPct}%`,
                backgroundColor: "var(--qm-accent)",
                opacity:         0.45,
              }}
            />
          </div>
          <p className="shrink-0 text-[11px]" style={{ color: "var(--qm-text-faint)", opacity: 0.5 }}>
            {t.journal.patternsSoon(entryProgress, 3)}
          </p>
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {status === "error" && (
        <div className="mt-4 rounded-xl border border-qm-danger-border bg-qm-danger-bg px-4 py-3 text-sm text-qm-danger">
          {error}
        </div>
      )}

      {/* ── Fixed save bar ────────────────────────────────────────────────── */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t px-4 py-3 pb-safe-4 backdrop-blur-sm"
        style={{
          borderColor:     "var(--qm-border-card)",
          backgroundColor: "var(--qm-bg-glass-95)",
        }}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <button
            type="submit"
            disabled={!canSave}
            className="qm-btn-primary flex-1 px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-30"
            style={{ boxShadow: canSave ? "0 6px 20px -4px rgba(139,157,255,0.28)" : "none" }}
          >
            {status === "saving" ? t.journal.savingLabel : t.journal.saveButtonLabel}
          </button>

          {/* Save nudge — fades in after 10 words */}
          <p
            className="hidden shrink-0 max-w-[180px] text-xs leading-snug sm:block transition-opacity duration-500"
            style={{
              color:   "var(--qm-text-faint)",
              opacity: wordCount > 10 ? 0.55 : 0,
            }}
          >
            {t.journal.saveReflectNudge}
          </p>
        </div>
      </div>
    </form>
  );
}
