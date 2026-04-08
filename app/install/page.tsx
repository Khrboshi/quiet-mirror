"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useInstallAvailability } from "@/app/hooks/useInstallAvailability";
import { CONFIG } from "@/app/lib/config";
import { useTranslation } from "@/app/components/I18nProvider";

// Renders **bold** markdown within translation strings as <b> elements.
// Translators wrap the UI label name in ** to preserve bold formatting.
function BoldText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <b key={i} className="text-qm-primary">{part}</b>
          : part
      )}
    </>
  );
}

export default function InstallPage() {
  const { t } = useTranslation();
  const ip = t.installPage;

  const { isStandalone, isIOS, isSafariIOS, canPromptNative, promptInstall } =
    useInstallAvailability({ allowPreventDefault: false });

  const platformHint = useMemo(() => (isIOS ? "ios" : "other"), [isIOS]);

  async function handleInstallClick() {
    await promptInstall();
  }

  const benefits = [
    { label: ip.benefit1Label, detail: ip.benefit1Detail },
    { label: ip.benefit2Label, detail: ip.benefit2Detail },
    { label: ip.benefit3Label, detail: ip.benefit3Detail },
  ];

  const iosSteps = [
    { step: "1", node: <BoldText text={ip.iosStep1} /> },
    { step: "2", node: <BoldText text={ip.iosStep2} /> },
    { step: "3", node: <BoldText text={ip.iosStep3} /> },
    { step: "4", node: <>{ip.iosStep4(CONFIG.appName)}</> },
  ];

  return (
    <main className="min-h-screen bg-qm-bg text-qm-primary">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-8 lg:py-14">

        {/* ── Left column ── */}
        <section className="hidden lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-qm-positive">
            {ip.tag(CONFIG.appName)}
          </p>
          <h1 className="font-display mt-4 max-w-xl text-5xl font-semibold leading-[1.05] tracking-tight text-qm-primary">
            {ip.headline(CONFIG.appName)}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-qm-muted">
            {ip.desc(CONFIG.appName)}
          </p>

          {/* App icon mockup */}
          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-5">
            <div className="relative shrink-0">
              <Image
                src="/pwa/icon-192.png"
                alt={`${CONFIG.appName} app icon`}
                width={64}
                height={64}
                className="rounded-[22%] shadow-xl shadow-black/40"
              />
              <span className="absolute -bottom-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-qm-accent text-[9px] font-bold text-white">
                ✓
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-qm-primary">{CONFIG.appName}</p>
              <p className="text-xs text-qm-faint">{ip.appTagline}</p>
              <p className="mt-1.5 text-xs text-qm-faint">{ip.appSubTagline}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {benefits.map(({ label, detail }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-xs text-qm-positive">✓</span>
                <p className="text-sm text-qm-secondary">
                  <span className="font-medium text-qm-primary">{label}</span>
                  {" — "}
                  <span className="text-qm-faint">{detail}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Right column — card ── */}
        <section className="mx-auto w-full max-w-2xl">
          <div className="rounded-[1.75rem] border border-white/10 bg-[var(--qm-bg-glass-80)] p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-7">

            {/* Mobile header */}
            <div className="lg:hidden">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-qm-positive">
                {ip.mobileTag(CONFIG.appName)}
              </p>
              <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-qm-primary">
                {ip.mobileHeadline(CONFIG.appName)}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-qm-muted">
                {ip.mobileDesc(CONFIG.appName)}
              </p>
            </div>

            {/* Desktop card header */}
            <div className="hidden lg:block">
              <h2 className="text-xl font-semibold text-qm-primary">{ip.cardHeadline}</h2>
              <p className="mt-1 text-sm leading-relaxed text-qm-muted">{ip.cardSubtitle}</p>
            </div>

            {isStandalone ? (
              <div className="mt-6 rounded-2xl border border-qm-positive-border bg-qm-positive-strong/[0.06] p-5">
                <h3 className="text-lg font-semibold text-qm-primary">{ip.alreadyInstalled}</h3>
                <p className="mt-2 text-sm leading-relaxed text-qm-positive">
                  {ip.alreadyDesc(CONFIG.appName)}
                </p>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-lg font-semibold text-qm-primary">{ip.addDevice}</h3>

                {canPromptNative ? (
                  <>
                    <p className="mt-2 text-sm leading-relaxed text-qm-muted">
                      {ip.oneClickDesc}
                    </p>
                    <button
                      onClick={handleInstallClick}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-qm-accent px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-qm-accent-hover"
                    >
                      {ip.installBtn(CONFIG.appName)}
                    </button>
                    <p className="mt-3 text-center text-xs leading-relaxed text-qm-faint">
                      {ip.incognitoNote}
                    </p>
                  </>
                ) : (
                  <>
                    {platformHint === "ios" && isSafariIOS ? (
                      <div className="mt-4">
                        <p className="mb-4 text-sm text-qm-muted">{ip.iosSafariIntro}</p>
                        <ol className="space-y-3">
                          {iosSteps.map(({ step, node }) => (
                            <li key={step} className="flex items-start gap-3">
                              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-qm-positive-border bg-qm-positive-soft text-xs font-bold text-qm-positive">
                                {step}
                              </span>
                              <span className="text-sm leading-relaxed text-qm-secondary">
                                {node}
                              </span>
                            </li>
                          ))}
                        </ol>
                        <p className="mt-4 text-xs leading-relaxed text-qm-faint">
                          {ip.iosSafariNote}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-qm-primary">{ip.desktopTitle}</p>
                        <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-relaxed text-qm-secondary">
                          <li>{ip.desktopStep1}</li>
                          <li>{ip.desktopStep2}</li>
                          <li>{ip.desktopStep3(CONFIG.appName)}</li>
                        </ol>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="mt-4 rounded-2xl border border-white/10 bg-qm-bg p-4">
              <p className="text-sm font-medium text-qm-primary">{ip.helpfulNote}</p>
              <p className="mt-1 text-sm leading-relaxed text-qm-muted">
                {ip.helpfulBody(CONFIG.appName)}
              </p>
            </div>

            <div className="mt-6 flex flex-col items-center gap-3 text-center">
              <Link
                href="/"
                className="text-sm font-medium text-qm-positive transition-colors hover:text-qm-positive-hover"
              >
                {ip.backHome}
              </Link>
              <p className="max-w-md text-xs leading-relaxed text-qm-faint">
                {ip.footerNote(CONFIG.appName)}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
