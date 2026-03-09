"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  userId?: string; // kept for compatibility with your current import usage
};

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
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "success">(
    "idle"
  );
  const [error, setError] = useState<string>("");

  const didPrefillRef = useRef(false);

  useEffect(() => {
    if (didPrefillRef.current) return;

    const qpTitle = safeSlice(searchParams.get("title") ?? "", 120);
    const qpPrompt = safeSlice(searchParams.get("prompt") ?? "", 2000);
    const qpMood = safeSlice(searchParams.get("mood") ?? "", 32);

    const nextTitle = qpTitle || (qpMood ? `Mood: ${qpMood}` : "");
    const nextContent =
      qpPrompt || (qpMood ? `Right now I'm feeling ${qpMood}.\n\n` : "");

    setTitle((prev) => (prev.trim() ? prev : nextTitle));
    setContent((prev) => (prev.trim() ? prev : nextContent));

    didPrefillRef.current = true;
  }, [searchParams]);

  const canSave = useMemo(
    () => content.trim().length > 0 && status !== "saving",
    [content, status]
  );

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
        body: JSON.stringify({
          title: title.trim() || null,
          content: contentTrimmed,
        }),
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setError(
          json?.error ||
            json?.message ||
            "Failed to save journal entry. Please try again."
        );
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
      if (id) {
        router.push(`/journal/${id}`);
        router.refresh();
        return;
      }

      router.push("/journal");
      router.refresh();
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Network error. Please try again.");
    }
  }

  function handleStarterPrompt(prompt: string) {
    setContent((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return `${prompt}\n\n`;
      return prev;
    });
  }

  return (
    <form onSubmit={onSubmit} className="w-full pb-24">
      <div className="space-y-3">
        <div>
          <div className="text-sm font-medium text-white/80 mb-2">
            Write your thoughts
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Optional title (e.g., A quick check-in)"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 outline-none focus:border-white/20 focus:bg-white/[0.07]"
            maxLength={120}
          />

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm text-slate-300">
              Not sure how to start? Try one of these:
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleStarterPrompt(prompt)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/10"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="How are you feeling today?"
            className="mt-3 w-full min-h-[40vh] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 outline-none focus:border-white/20 focus:bg-white/[0.07] resize-none"
          />
        </div>

        {status === "error" && <div className="text-sm text-red-400">{error}</div>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#020617]/95 backdrop-blur px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <button
          type="submit"
          disabled={!canSave}
          className="w-full rounded-xl bg-emerald-400/90 px-4 py-4 font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "saving" ? "Saving..." : "Save Entry"}
        </button>
      </div>
    </form>
  );
}
