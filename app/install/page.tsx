"use client";

import { useMemo } from "react";
import { useInstallAvailability } from "@/app/hooks/useInstallAvailability";

export default function InstallPage() {
  // Do NOT capture here (no preventDefault).
  // This page is for instructions and browser-native install UI.
  const { isStandalone, isIOS, isSafariIOS, canPromptNative, promptInstall } =
    useInstallAvailability({ allowPreventDefault: false });

  const platformHint = useMemo(() => (isIOS ? "ios" : "other"), [isIOS]);

  async function handleInstallClick() {
    await promptInstall();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-10 md:pt-16">
      <h1 className="text-3xl font-semibold text-white">Install</h1>
      <p className="mt-2 text-slate-300">
        Installing creates an app icon and improves the login experience from email links.
      </p>

      {isStandalone ? (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Already installed</h2>
          <p className="mt-2 text-slate-300">This device already has Havenly installed.</p>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Install on this device</h2>

          {canPromptNative ? (
            <>
              <p className="mt-2 text-slate-300">Your browser supports one-click install.</p>
              <button
                onClick={handleInstallClick}
                className="mt-4 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-medium text-black hover:bg-emerald-400"
              >
                Install Havenly
              </button>
              <p className="mt-3 text-xs text-slate-400">
                If you don’t see install in Incognito, open a normal browser window.
              </p>
            </>
          ) : (
            <>
              {platformHint === "ios" && isSafariIOS ? (
                <div className="mt-4 text-slate-300">
                  <p className="text-sm text-slate-400 mb-4">Follow these steps in Safari:</p>
                  <ol className="space-y-3">
                    {[
                      { step: "1", text: <>Tap the <b className="text-white">Share</b> button — the box with an arrow pointing up, at the bottom of your screen.</> },
                      { step: "2", text: <>Scroll down and tap <b className="text-white">Add to Home Screen</b>.</> },
                      { step: "3", text: <>Tap <b className="text-white">Add</b> in the top right corner.</> },
                      { step: "4", text: <>Open Havenly from your Home Screen — sign-in links will now open directly in the app.</> },
                    ].map(({ step, text }) => (
                      <li key={step} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center mt-0.5">
                          {step}
                        </span>
                        <span className="text-sm leading-relaxed">{text}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-4 text-xs text-slate-500">
                    Not seeing the Share button? Make sure you&apos;re using Safari, not Chrome or another browser.
                  </p>
                </div>
              ) : (
                <div className="mt-2 text-slate-300">
                  <p className="font-medium text-white">Desktop (Chrome/Edge)</p>
                  <ol className="mt-2 list-decimal space-y-2 pl-5">
                    <li>Open this site in a normal (non-Incognito) window.</li>
                    <li>
                      Click the install icon in the address bar (if shown) <b>or</b> open the
                      browser menu (⋮).
                    </li>
                    <li>
                      Select <b>Install Havenly…</b>
                    </li>
                  </ol>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}
