"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Props = Record<string, never>;

const starterPrompts = [
  "What has been weighing on you lately?",
  "Is there something you keep thinking about today?",
  "Did anything today leave a strong emotional impact?",
  "What conversation or moment is still on your mind?",
];

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
  const searchParams = useSearchParams();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "success">("idle");
  const [error, setError] = useState<string>("");
  const [entryProgress, setEntryProgress] = useState(0);
  const [showTitle, setShowTitle] = useState(false);

  const didPrefillRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (didPrefillRef.current) return;
    const qpTitle = safeSlice(searchParams.get("title") ?? "", 120);
    const qpPrompt = safeSlice(searchParams.get("prompt") ?? "", 2000);
    const qpMood = safeSlice(searchParams.get("mood") ?? "", 32);
    const nextTitle = qpTitle || (qpMood ? `Mood: ${qpMood}` : "");
    const nextContent = qpPrompt || (qpMood ? `Right now I'm feeling ${qpMood}.\n\n` : "");
    setTitle((prev) => (prev.trim() ? prev : nextTitle));
    setContent((prev) => (prev.trim() ? prev : nextContent));
    if (qpPrompt || qpMood) setTimeout(() => textareaRef.current?.focus(), 100);
    didPrefillRef.current = true;
  }, [searchParams]);

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

  const incomingPrompt = safeSlice(searchParams.get("prompt") ?? "", 200);
  const hasIncomingPrompt = Boolean(incomingPrompt);

  function handleStarterPrompt(prompt: string) {
    setContent((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return `${prompt}\n\n`;
      return prev;
    });
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const contentTrimmed = content.trim();
    if (!contentTrimmed) {
      setStatus("error");
      setError("Please write a few words before saving.");
      return;
    }
    setStatus("saving");
    try {
      const res = await fetch("/api/journal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() || null, content: contentTrimmed }),
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setError(json?.error || json?.message || "Failed to save journal entry. Please try again.");
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
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    }
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <form onSubmit={onSubmit} className="w-full pb-32">

      {/* Header */}
      <div className="mb-8 pt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-qm-accent" style={{ opacity: 0.7 }}>
          New entry
        </p>
        <h1 className="font-display mt-2 text-2xl font-semibold leading-snug text-qm-primary sm:text-3xl">
          {hasIncomingPrompt ? incomingPrompt : "What's on your mind?"}
        </h1>
        <p className="mt-2 text-sm text-qm-secondary">
          Write however feels natural. One sentence is always enough.
        </p>
      </div>

      {/* Starter prompts */}
      {!hasIncomingPrompt && content.trim().length === 0 && (
        <div className="mb-6">
          <p className="mb-2.5 text-xs text-qm-muted">Not sure where to start?</p>
          <div className="flex flex-wrap gap-2">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleStarterPrompt(prompt)}
                className="rounded-full border border-qm-card bg-qm-card px-3.5 py-2 text-xs text-qm-secondary transition hover:border-qm-accent hover:bg-qm-accent-soft hover:text-qm-primary"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Writing area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing here…"
          autoFocus={!hasIncomingPrompt}
          className="qm-input w-full min-h-[50vh] resize-none px-5 py-5 text-base leading-relaxed placeholder:text-qm-faint outline-none sm:text-[17px]"
        />
        {wordCount > 0 && (
          <span className="absolute bottom-4 right-4 text-[11px] text-qm-faint pointer-events-none">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
        )}
      </div>

      {/* Optional title */}
      <div className="mt-4">
        {!showTitle ? (
          <button
            type="button"
            onClick={() => setShowTitle(true)}
            className="text-xs text-qm-muted transition hover:text-qm-secondary"
          >
            + Add a title (optional)
          </button>
        ) : (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give this entry a title (optional)"
            autoFocus
            className="qm-input w-full px-4 py-3 text-sm placeholder:text-qm-faint outline-none"
            maxLength={120}
          />
        )}
      </div>

      {/* Privacy reminder */}
      <p className="mt-4 text-xs text-qm-faint">
        Your journal is private. No one else can read what you write. Entries are never used to train AI models.
      </p>

      {/* Progress nudge */}
      {entryProgress < 3 && (
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-0.5 rounded-full bg-qm-card">
            <div
              className="h-0.5 rounded-full bg-qm-accent transition-all"
              style={{ width: `${(entryProgress / 3) * 100}%`, opacity: 0.5 }}
            />
          </div>
          <p className="shrink-0 text-xs text-qm-faint">{entryProgress}/3 entries — patterns emerge soon</p>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Fixed bottom save bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-sm px-4 py-3 pb-safe-4"
        style={{
          borderColor: "var(--qm-border-card)",
          backgroundColor: "var(--qm-bg-glass-95)",
        }}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button
            type="submit"
            disabled={!canSave}
            className="qm-btn-primary flex-1 px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "saving" ? "Saving…" : "Write"}
          </button>
          {canSave && (
            <p className="hidden shrink-0 text-xs text-qm-muted sm:block">
              Quiet Mirror will reflect this back when you&apos;re ready
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
