// app/lib/i18n/types.ts
//
// Shared TypeScript interface for all translation files.
// Every locale (en, uk, …) must satisfy this shape exactly.
// TypeScript will error at compile time if a locale is missing a string.

export type Locale = "en" | "uk";

export const SUPPORTED_LOCALES: Locale[] = ["en", "uk"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "qm:locale";

export interface LocaleMetadata {
  code: Locale;
  /** Native name shown in the language switcher */
  label: string;
  /** ISO flag emoji */
  flag: string;
}

export const LOCALE_META: Record<Locale, LocaleMetadata> = {
  en: { code: "en", label: "English",    flag: "🇬🇧" },
  uk: { code: "uk", label: "Українська", flag: "🇺🇦" },
};

// ─── Translation shape ────────────────────────────────────────────────────────
// Mirrors app/lib/copy.ts exactly.
// Functions that accept runtime values (counts, labels) must be included here.

export interface Translations {
  errors: {
    entryEmpty:        string;
    entrySaveFailed:   string;
    entryLoadFailed:   string;
    entryDeleteFailed: string;
    entryGenericFail:  string;
    reflectionFailed:  string;
    insightsFailed:    string;
    insightsNoData:    string;
    invoicesFailed:    string;
    networkError:      string;
    networkRetry:      string;
    safeReload:        string;
  };

  nav: {
    backToDashboard: string;
    backToJournal:   string;
    backToHome:      string;
    goToDashboard:   string;
  };

  journal: {
    untitledEntry:      string;
    untitled:           string;
    newEntryLabel:      string;
    newEntryHeading:    string;
    newEntrySubheading: string;
    starterPrompts:     readonly [string, string, string, string];
    notSureWhereToStart:string;
    textareaPlaceholder:string;
    addTitleOptional:   string;
    titlePlaceholder:   string;
    privacyReminder:    string;
    patternsSoon:       (current: number, total: number) => string;
    saveButtonLabel:    string;
    savingLabel:        string;
    saveReflectNudge:   string;
    removeEntryLabel:   string;
    deleteWarning:      string;
    deleteConfirmLabel: string;
    deletingLabel:      string;
    cancelLabel:        string;
    emptyStateNudge:    string;
  };

  reflection: {
    cardHeading:          string;
    creditsRemaining:     (n: number) => string;
    creditsResetsNext:    string;
    seeReflectionLabel:   string;
    reflectingLabel:      string;
    unlockReflectionLabel:string;
    savedToHistory:       string;
    firstEntryBanner:     string;
    whatYoureCarrying:    string;
    whatsReallyHappening: string;
    deeperDirection:      string;
    keyPattern:           string;
    gentleNextStep:       string;
    optionA:              string;
    optionB:              string;
    scriptLine:           string;
    savedPermanently:     string;
    patternHistoryNote:   string;
    patternHistorySub:    string;
    seeFullPattern:       string;
    readingEntry:         string;
    nothingRemoved:       string;
  };

  upgrade: {
    startTrial:       (label: string) => string;
    seeExample:       string;
    seeWhatPremium:   string;
    cancelAnytime:    string;
    noQuestionsAsked: string;
  };

  tools: {
    somethingWentWrong: (tool: string) => string;
    tryAgain:           string;
  };

  ui: {
    loading:          string;
    questionsHeading: (count: number) => string;
    wordCount:        (n: number) => string;
    entryCount:       (current: number, total: number) => string;
    noReflectionsYet: string;
    reflectionsSoFar: (n: number) => string;
    moreNeeded:       (n: number) => string;
    patternsGenerating: string;
    writeAnEntry:     string;
    summaryFailed:    string;
  };

  navbar: {
    signIn:         string;
    startFree:      string;
    logout:         string;
    yourSpace:      string;
    openMenu:       string;
    closeMenu:      string;
    writeFreeEntry: string;
    privateNoCred:  string;
    privateTagline: string;
  };
}
