"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useInstallAvailability } from "@/app/hooks/useInstallAvailability";
import { CONFIG } from "@/app/lib/config";

export default function InstallPage() {
  const { isStandalone, isIOS, isSafariIOS, canPromptNative, promptInstall } =
    useInstallAvailability({ allowPreventDefault: false });

  const platformHint = useMemo(() => (isIOS ? "ios" : "other"), [isIOS]);

  async function handleInstallClick() {
    await promptInstall();
  }

  return (
    <main className="min-h-screen bg-qm-bg text-qm-primary">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-8 lg:py-14">

        {/* ── Left column ── */}
        <section className="hidden lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400/80">
            Install {CONFIG.appName}
          </p>
          <h1 className="font-display mt-4 max-w-xl text-5xl font-semibold leading-[1.05] tracking-tight text-white">
            Keep {CONFIG.appName} one tap away.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-400">
            Installing {CONFIG.appName} creates an app icon and makes returning to your
            journal faster, cleaner, and more reliable.
          </p>

          {/* App icon mockup — FIXED: /pwa/icon-192.png */}
          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-5">
            <div className="relative shrink-0">
              <Image
                src="/pwa/icon-192.png"
                alt={`${CONFIG.appName} app icon`}
                width={64}
                height={64}
                className="rounded-[22%] shadow-xl shadow-black/40"
              />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-qm-accent text-[9px] font-bold text-white">
                ✓
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{CONFIG.appName}</p>
              <p className="text-xs text-slate-500">Write honestly. Reflect clearly.</p>
              <p className="mt-1.5 text-xs text-slate-600">Lives on your Home Screen, opens instantly.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              { label: "One tap to open", detail: "No browser tabs to hunt through." },
              { label: "Feels like an app", detail: "Full screen, no address bar, no distractions." },
              { label: "Smoother sign-in on iPhone", detail: "Code sign-in works more reliably from the Home Screen." },
            ].map(({ label, detail }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-xs text-emerald-400">✓</span>
                <p className="text-sm text-slate-300">
                  <span className="font-medium text-white">{label}</span>
                  {" — "}
                  <span className="text-slate-500">{detail}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Right column — card ── */}
        <section className="mx-auto w-full max-w-2xl">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-7">

            {/* Mobile header */}
            <div className="lg:hidden">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400/80">
                Install {CONFIG.appName}
              </p>
              <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-white">
                Install {CONFIG.appName}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Add {CONFIG.appName} to your device for faster access and a smoother return to your
                journal.
              </p>
            </div>

            {/* Desktop card header */}
            <div className="hidden lg:block">
              <h2 className="text-xl font-semibold text-white">Add to your device</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                Works on iPhone, Android, and desktop Chrome or Edge.
              </p>
            </div>

            {isStandalone ? (
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5">
                <h3 className="text-lg font-semibold text-white">Already installed</h3>
                <p className="mt-2 text-sm leading-relaxed text-emerald-100">
                  This device already has {CONFIG.appName} installed. You can open it from your Home
                  Screen or app launcher.
                </p>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-lg font-semibold text-white">Add to this device</h3>

                {canPromptNative ? (
                  <>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      Your browser supports one-click installation.
                    </p>
                    <button
                      onClick={handleInstallClick}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-qm-accent px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-qm-accent-hover"
                    >
                      Install {CONFIG.appName}
                    </button>
                    <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
                      If installation does not appear in Incognito, open a normal browser window.
                    </p>
                  </>
                ) : (
                  <>
                    {platformHint === "ios" && isSafariIOS ? (
                      <div className="mt-4">
                        <p className="mb-4 text-sm text-slate-400">
                          Follow these steps in Safari:
                        </p>
                        <ol className="space-y-3">
                          {[
                            {
                              step: "1",
                              text: (
                                <>
                                  Tap the <b className="text-white">Share</b> button — the box
                                  with an arrow pointing up, at the bottom of your screen.
                                </>
                              ),
                            },
                            {
                              step: "2",
                              text: (
                                <>
                                  Scroll down and tap{" "}
                                  <b className="text-white">Add to Home Screen</b>.
                                </>
                              ),
                            },
                            {
                              step: "3",
                              text: (
                                <>
                                  Tap <b className="text-white">Add</b> in the top right corner.
                                </>
                              ),
                            },
                            {
                              step: "4",
                              text: (
                                <>
                                  Open {CONFIG.appName} from your Home Screen for the more app-like experience.
                                </>
                              ),
                            },
                          ].map(({ step, text }) => (
                            <li key={step} className="flex items-start gap-3">
                              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 text-xs font-bold text-emerald-400">
                                {step}
                              </span>
                              <span className="text-sm leading-relaxed text-slate-300">
                                {text}
                              </span>
                            </li>
                          ))}
                        </ol>
                        <p className="mt-4 text-xs leading-relaxed text-slate-500">
                          Not seeing the Share button? Make sure you are using Safari, not
                          Chrome or another browser.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-white">
                          Desktop or Android (Chrome / Edge)
                        </p>
                        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-300">
                          <li>Open this site in a normal, non-Incognito window.</li>
                          <li>
                            Click the install icon in the address bar, if shown, or open the
                            browser menu.
                          </li>
                          <li>
                            Select <b className="text-white">Install {CONFIG.appName}</b>.
                          </li>
                        </ol>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-sm font-medium text-white">Helpful note</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                Installation improves convenience, but you can still use {CONFIG.appName} in your
                browser whenever you prefer.
              </p>
            </div>

            <div className="mt-6 flex flex-col items-center gap-3 text-center">
              <Link
                href="/"
                className="text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
              >
                ← Back to Home
              </Link>
              <p className="max-w-md text-xs leading-relaxed text-slate-600">
                {CONFIG.appName} works in the browser too. Installing it simply makes returning feel
                quicker and more app-like.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
