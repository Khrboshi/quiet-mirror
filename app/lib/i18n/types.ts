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
    // Nav link labels
    about:          string;
    blog:           string;
    pricing:        string;
    install:        string;
    dashboard:      string;
    journal:        string;
    insights:       string;
    tools:          string;
    settings:       string;
    logout:         string;
    yourSpace:      string;
    openMenu:       string;
    closeMenu:      string;
    writeFreeEntry: string;
    privateNoCred:  string;
    privateTagline: string;
    privateJournalingTagline: string;
  };

  insights: {
    regenerateSummary: string;
    entries:           string;
    sinceJoined:       string;
    topEmotion:        string;
    topTheme:          string;
    firstSuggestion:   string;
    secondSuggestion:  string;
    momentum:          string;
    momentumDefault:   string;
    momentumDescriptions: Record<string, string>;
  };

  dashboard: {
    goodMorning:    string;
    goodAfternoon:  string;
    goodEvening:    string;
    today:          string;
    yesterday:      string;
    wroteToday:     string;
    pickUpThread:   string;
    startHere:      string;
    dayEvolved:     string;
    oneHonestSentence: string;
    alreadyWroteToday: string;
    addToToday:     string;
    writeNow:       string;
    writtenToday:   string;
    choosePrompt:   string;
    entry:          string;
    entries:        string;
    moreEntries:    (n: number) => string;
    trial:          string;
    premium:        string;
    free:           string;
    prompts: readonly {
      q: string;
      sub: string;
      accent: string;
    }[];
  };

  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: {
    // Column headers
    product:          string;
    account:          string;
    legal:            string;
    serviceGuarantees:string;
    // Product links
    about:            string;
    pricing:          string;
    blog:             string;
    installApp:       string;
    // Account links (signed in)
    dashboard:        string;
    tools:            string;
    settings:         string;
    billing:          string;
    // Account links (signed out)
    signIn:           string;
    startFree:        string;
    goPremium:        string;
    // Legal links
    termsOfService:   string;
    privacyPolicy:    string;
    contact:          string;
    // Trust badges
    noAds:            string;
    noDataSales:      string;
    // Privacy assurance
    privacyAssurance: string;
    // Copyright
    allRightsReserved:(appName: string, year: number) => string;
  };

  // ── Settings & Billing ───────────────────────────────────────────────────────
  settingsPage: {
    // Page header
    title:            string;
    subtitle:         string;
    upgradeLabel:     string;
    // Plan badges
    planPremium:      string;
    planTrial:        string;
    planFree:         string;
    // Card titles & subtitles
    accountTitle:     string;
    accountSubtitle:  string;
    transactionsLabel:string;
    planTitle:        string;
    planActivePremium:string;
    planActiveFree:   string;
    dataPrivacyTitle: string;
    dataPrivacySubtitle:string;
    installTitle:     string;
    installSubtitle:  string;
    installAppLabel:  string;
    supportTitle:     string;
    supportSubtitle:  string;
    // Data row labels
    emailLabel:       string;
    memberSinceLabel: string;
    entriesWrittenLabel:string;
    billingEmailNote: string;
    planLabel:        string;
    reflectionsLabel: string;
    resetsLabel:      string;
    aiTrainingLabel:  string;
    aiTrainingValue:  string;
    dataSharingLabel: string;
    dataSharingValue: string;
    privacyPolicyLabel:string;
    privacyReadLabel: string;
    dataRequestNote:  (email: string) => string;
    // Plan values
    reflectionsUnlimited:string;
    insightsFull:     string;
    weeklySummaryIncluded:string;
    reflectionsNone:  string;
    reflectionsRemaining: (n: number, total: number) => string;
    reflectionsResume:(date: string) => string;
    reflectionsFreeNote:(n: number) => string;
    upgradeUnlimited: string;
    // Billing page
    billingTitle:     string;
    billingSubtitle:  string;
    manageSubscription:string;
    upgradeToPremium: string;
    planSectionTitle: string;
    planStatusPremium:string;
    planStatusTrial:  string;
    planStatusFree:   string;
    premiumIncludes:  string;
    freeIncludes:     string;
    premiumItem1:     string;
    premiumItem2:     string;
    premiumItem3:     string;
    premiumItem4:     string;
    freeItem1:        string;
    freeItem2:        string;
    freeItem3:        (n: number) => string;
    freeItem4:        string;
    priceLabel:       string;
    nextBillingLabel: string;
    cancellationsLabel:string;
    noPressure:        string;
    refundWindowLast: (days: number) => string;
    refundWindowDays: (days: number) => string;
    refundContact:    string;
    accountSectionTitle:string;
    accountBillingSubtitle:string;
  };

  // ── Tools page ───────────────────────────────────────────────────────────────
  toolsPage: {
    pageLabel:        string;
    pageTitle:        string;
    pageSubtitle:     string;
    moodTitle:        string;
    moodSubtitle:     string;
    reflectionTitle:  string;
    reflectionSubtitle:string;
    suggestionsTitle: string;
    suggestionsSubtitle:string;
    openLabel:        string;
  };

  // ── Magic login ──────────────────────────────────────────────────────────────
  magicLogin: {
    quote1:           string;
    quote2:           string;
    quote3:           string;
    quote4:           string;
    quote5:           string;
    callbackError:    string;
    emailSentCode:    string;
    emailSentLink:    string;
    sendFailed:       string;
    invalidCode:      string;
  };

  // ── Journal list page ────────────────────────────────────────────────────────
  journalPage: {
    heading:          string;
    newEntry:         string;
    entryCount:       (n: number) => string;
    emptyHeading:     string;
    emptyBody:        string;
    startHere:        string;
    reflected:        string;
    draft:            string;
    open:             string;
    start:            string;
    prompt1:          string;
    prompt1Sub:       string;
    prompt2:          string;
    prompt2Sub:       string;
    prompt3:          string;
    prompt3Sub:       string;
  };

  // ── Upgrade trigger nudges ───────────────────────────────────────────────────
  upgradeTrigger: {
    seeWhatPremium:       string;
    noCharge:             (days: number, word: string) => string;
    cancelAnytime:        string;
    terms:                string;
    reflectionIntro:      string;
    seeExample:           string;
    workHeadline:         string;
    workSub:              string;
    relationshipHeadline: string;
    relationshipSub:      string;
    healthHeadline:       string;
    healthSub:            string;
    identityHeadline:     string;
    identitySub:          string;
    griefHeadline:        string;
    griefSub:             string;
    moneyHeadline:        string;
    moneySub:             string;
    parentingHeadline:    string;
    parentingSub:         string;
    creativeHeadline:     string;
    creativeSub:          string;
    fitnessHeadline:      string;
    fitnessSub:           string;
    generalHeadline:      string;
    generalSub:           string;
  };

  // ── Upgrade confirmed ────────────────────────────────────────────────────────
  upgradeConfirmed: {
    headline1:        string;
    headline2:        string;
    whatUnlocked:     string;
    feature1Label:    string;
    feature1Sub:      string;
    feature2Label:    string;
    feature2Sub:      string;
    feature3Label:    string;
    feature3Sub:      string;
    feature4Label:    string;
    feature4Sub:      string;
    ctaWrite:         string;
    ctaInsights:      string;
    refreshOnce:      string;
    manageBilling:    string;
    billingSettings:  string;
  };
}
