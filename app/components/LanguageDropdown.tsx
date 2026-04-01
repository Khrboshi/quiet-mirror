"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe, ChevronsUpDown } from "lucide-react";
import { useTranslation } from "@/app/components/I18nProvider";
import { CONFIG } from "@/app/lib/config";

export default function LanguageDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { i18n } = useTranslation();

  // Find the current language's label for display, default to the first available
  const currentLangLabel =
    CONFIG.i18n.all.find((l) => l.code === i18n.language)?.label ||
    CONFIG.i18n.all[0].label;

  const changeLanguage = (newLocale: string) => {
    // This logic assumes you are using next-international or a similar library
    // that uses URL-based routing for locales (e.g., /en/about, /fr/about)
    const segments = pathname.split("/");
    if (CONFIG.i18n.all.some(l => l.code === segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join("/"));
    setIsOpen(false);
  };

  // Effect to close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* The button that triggers the dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-qm-secondary transition-colors hover:bg-qm-accent-soft hover:text-qm-accent"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe size={16} />
        <span>{currentLangLabel}</span>
        <ChevronsUpDown size={14} className="opacity-50" />
      </button>

      {/* The dropdown menu itself */}
      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 w-48 origin-top-right rounded-xl border border-qm-border-card bg-qm-bg p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {CONFIG.i18n.all.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm ${
                i18n.language === lang.code
                  ? "bg-qm-accent-soft font-semibold text-qm-accent"
                  : "text-qm-primary hover:bg-qm-soft"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
