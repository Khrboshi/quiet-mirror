// app/lib/i18n/types.ts — audited 2026-04-08
//
// Shared TypeScript interface for all translation files.
// Every locale (en, uk, …) must satisfy this shape exactly.
// TypeScript will error at compile time if a locale is missing a string.

// ─── Translation shape ────────────────────────────────────────────────────────
// All locale metadata (Locale type, SUPPORTED_LOCALES, etc.) lives in locales.ts.

export interface Translations {
  errors: {
    entryEmpty:        string;
    entrySaveFailed:   string;
    entryLoadFailed:   string;
    entryDeleteFailed: string;
    entryGenericFail:  string;
    entryNotFound:     string;
    notFoundTitle:     string;
    notFoundBody:      string;
    reflectionFailed:  string;
    insightsFailed:    string;
    insightsNoData:    string;
    invoicesFailed:    string;
    networkError:      string;
    networkRetry:      string;
    safeReload:        string;
    somethingWrong:    string;
    tryAgain:          string;
    genericPageError:  (appName: string) => string;
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
    privacyReminderShort: string;
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
    limitReachedHeadline: (n: number) => string;
    limitReachedBody:     string;
    themesLabel:          string;
    emotionsLabel:        string;
    crisisMatters:        string;
    crisisSupportLabel:   string;
    crisisPrivacy:        string;
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
    loadingLabel:     string;
    questionsHeading: (count: number) => string;
    wordCount:        (n: number) => string;
    entryCount:       (current: number, total: number) => string;
    noReflectionsYet: string;
    reflectionsSoFar: (n: number) => string;
    moreNeeded:       (n: number) => string;
    patternsGenerating: string;
    writeAnEntry:     string;
    summaryFailed:    string;
    // Language switcher aria-labels
    switchToLanguage: (label: string) => string;
    currentLanguage:  (label: string) => string;
    // Accessibility labels and placeholders
    mainContentLabel:    string;
    closeMenuBackdrop:   string;
    selectLanguage:      string;
    emailPlaceholder:    string;
    // Skip-to-content links (keyboard / screen-reader a11y)
    skipToMainContent:   string;
    skipToLoginForm:     string;
    // Protected area announcement (SR-only)
    protectedAreaSRLabel: string;
    // Reusable aria labels
    homeAriaLabel:       (appName: string) => string;
    opensInNewTab:       string;
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
    writeFreeEntry:           string;
    privateNoCred:            string;
    privateTagline:           string;
    privateJournalingTagline: string;
    mobileFooterNote:         string;
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
    // InsightsClient (full premium page) hardcoded fixes
    pageHeading:      string;
    pageSubheading:   string;
    recentlyLabel:    string;
    patternsNote:     string;
    // Domain section
    domainSectionLabel:      string;
    domainSectionSub:        string;
    domainEntryOf:           (count: number, total: number) => string;
    domainClearLeader:       string;
    domainPatternsClearer:   string;
    // Weekly trends section
    weeklyTrendsLabel:       string;
    weeklyTrendsSub:         string;
    weeklyTrendsLast:        (n: number) => string;
    weeklyTrendsThemes:      string;
    weeklyTrendsEmotions:    string;
    // Recurring themes / emotions sections
    recurringThemesLabel:    string;
    recurringThemesSub:      (n: number) => string;
    notEnoughThemes:         string;
    whatKeepsSurfacingLabel: string;
    whatKeepsSurfacingSub:   (n: number) => string;
    notEnoughEmotions:       string;
    // Show more / less
    showLess:                string;
    showMore:                (n: number) => string;
    // AI-summary card (top of page)
    aiSummaryHeading:        (appName: string) => string;
    aiSummarySubheading:     string;
    aiSummaryRefresh:        string;
    aiSummaryGenerating:     string;
    aiSummaryEmpty:          (appName: string) => string;
    aiSummaryTryAgain:       string;
    // "The pattern underneath" section + "What you keep coming back to" section
    patternUnderneathHeading:string;
    whatYouKeepComingBackTo: string;
    patternUnderneathSub:    (appName: string) => string;
    mostRecurringPattern:    string;
    corepatternCount:        (count: number, total: number) => string;
    // Closing CTA card
    patternClearer:          string;
    patternNextEntry:        string;
    writeAboutThisCta:       string;
    insightsDeepen:          string;
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
    // Pattern teaser card
    patternForming:       string;
    patternFormingYours:  string;
    patternTeaser:        string;
    patternTeaserNoHint:  string;
    unlockInsights:       string;
    // Last entry card
    openLastEntry:        string;
    // Stats bar
    reflUnlimited:        string;
    reflPaused:           (date: string) => string;
    reflRemaining:        string;
    reflLabel:            string;
    reflUnlimitedShort:   string;
    // History section
    totalEntries:         string;
    writingDays:          string;
    lastEntryLabel:       string;
    yourHistory:          string;
    allEntriesCta:        string;
    viewInsightsCta:      string;
    // Zero-credit upgrade nudge + trial badge
    unlockUnlimitedCta:   string;
    trialBadgeFull:       (days: number) => string;
    // Section labels
    todaysPromptsLabel:   string;
    // Prompts
    startArrow:           string;
    prompts: readonly {
      q: string;
      sub: string;
      accent: string;
    }[];
    welcomeTag:                 string;
    welcomeHeading:             string;
    welcomeBody:                (appName: string) => string;
    writeFirstEntry:            string;
    welcomePrivacy:             string;
    patternStartedTag:          string;
    patternStartedBody:         (emotion: string | null, theme: string | null) => string;
    writeAnotherEntry:          string;
    yourPatternNow:             string;
    seeFullInsights:            string;
    reflectRecentEntry:         string;
    yourPatterns:               string;
    freeNudge:                  (appName: string, n: number) => string;
    threadBodyWritten:          (when: string, emotion: string) => string;
    threadBodyWrittenNoEmotion: (when: string) => string;
    threadPromptEmotion:        (emotion: string) => string;
    threadPromptNoEmotion:      string;
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
    // Brand
    tagline:          string;
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
    accountEmailHint: string;
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
    insightsFull:          string;
    insightsLabel:         string;
    weeklySummaryIncluded: string;
    weeklySummaryLabel:    string;
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
    freeItem1:        string;
    freeItem2:        string;
    freeItem3:        (n: number) => string;
    freeItem4:        string;
    priceLabel:       string;
    nextBillingLabel: string;
    cancellationsLabel:string;
    cancelVia:         (manageLabel: string, provider: string) => string;
    premiumUnlocksDesc:string;
    nextCharge:        string;
    cancelViaPrefix:   string;
    cancelViaSuffix:   (provider: string) => string;
    noPressure:        string;
    refundWindowLast: (days: number) => string;
    refundWindowDays: (days: number) => string;
    refundContact:    (email: string) => string;
    accountSectionTitle:string;
    accountBillingSubtitle:string;
    // Transactions table columns
    colDate:          string;
    colStatus:        string;
    colAmount:        string;
    colReceipt:       string;
    noInvoicesYet:    string;
    viewLabel:        string;
    // Billing page — premium-path hardcoded fixes
    thankYouSupporting:   (appName: string) => string;
    cancelContactPrompt:  (email: string) => string;
    supportSidebarLabel:  string;
    supportSidebarText:   string;
    viewPremium:          string;
    // Settings page misc
    readArrow:            string;
    // Transactions page
    transactionsHeading:  string;
    backToSettings:       string;
    subscriptionHeading:  string;
    planColPrefix:        string;
    creditsColLabel:      string;
    paymentHistoryHeading:string;
    totalPaidLabel:       string;
    loadingInvoices:      string;
    goToBillingPage:      string;
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
    modalTitle:           string;
    modalDesc:            string;
    notNow:               string;
    perMonth:             string;
  };

  // ── Upgrade confirmed ────────────────────────────────────────────────────────
  upgradeConfirmed: {
    metaTitle:        (appName: string) => string;
    headline1:        string;
    headline2:        string;
    subDesc:          (appName: string, trialFor: string) => string;
    whatUnlocked:     string;
    patternsNote:     (appName: string) => string;
    ctaWrite:         string;
    ctaInsights:      string;
    dashboardDelay:   string;
    refreshOnce:      string;
    manageBilling:    string;
    billingNote:      string;
    billingSettings:  string;
  };
  // ── Homepage (marketing page) ────────────────────────────────────────────────
  homepage: {
    metaTitle:        (appName: string) => string;
    metaDescription:  string;
    ogTitle:          (appName: string) => string;
    ogDescription:    string;
    heroTag:          string;
    heroHeadline1:    string;
    heroHeadline2:    string;
    heroDesc:         string;
    heroQuote:        string;
    heroQuoteSub:     string;
    heroCta1:         string;
    heroCta2:         string;
    heroPromise:      string;
    trust1:           string;
    trust2:           string;
    trust3:           string;
    trust4:           string;
    previewTag:       string;
    previewPrivate:   string;
    previewWhatYouWrote: string;
    previewEntry:     string;
    previewReflects:  string;
    previewReflection:string;
    previewTag1:      string;
    previewTag2:      string;
    previewTag3:      string;
    previewNeverLeaves:string;
    previewSeeExample:string;
  };

  // ── Language selection page ───────────────────────────────────────────────────
  languagePage: {
    metaTitle:       (appName: string) => string;
    metaDescription: (appName: string) => string;
    title:       string;
    subtitle:    string;
    active:      string;
    select:      string;
    continueBtn: string;
  };

  homeBelowFold: {
    proofTag: string; proofH1: string; proofH2: string;
    proofCardTitle: string; proofBadge: string; proofQuote: string;
    proofBarsLabel: string;
    proofBar1: string; proofBar2: string; proofBar3: string; proofBar4: string;
    proofStat1: string; proofStat2: string;
    proofNote: string; proofUnlock: string; proofSeeEx: string;
    recTag: string; rec1: string; rec2: string; rec3: string;
    demoTag: string; demoH1: string; demoH2: string; demoDesc: string;
    step: string;
    demoInput: string; demoTime: string; demoEntry: string;
    demoBadge1: string; demoBadge2: string; demoBadge3: string;
    demoOutput: string; demoImmediate: string; demoReflection: string;
    demoTag1: string; demoTag2: string; demoTag3: string;
    step1Label: string; step1Sub: string;
    step2Label: string; step2Sub: string;
    step3Label: string; step3Sub: string;
    demoCta: string;
    insightsTag: string; insightsH1: string; insightsH2: string; insightsDesc: string;
    insightsBadge: string;
    cardATitle: string; cardAHead: string;
    cardABar1: string; cardABar2: string; cardABar3: string; cardABar4: string;
    cardBTitle: string; cardBHead: string;
    cardBT1: string; cardBT2: string; cardBT3: string; cardBT4: string;
    cardBPer: string;
    cardCTitle: string; cardCHead: string; cardCNote: string;
    cardDTitle: string; cardDHead: string; cardDNote: string;
    cardETitle: string; cardEHead: string; cardENote: string;
    cardFTitle: string; cardFHead: string; cardFNote: string;
    insightsSeeMore: string;
    diffTag: string; diffH1: string; diffH2: string;
    isTag: string; is1: string; is2: string; is3: string; is4: string;
    isNotTag: string; isNot1: string; isNot2: string; isNot3: string; isNot4: string;
    exTag: string; exH1: string; exH2: string; exDesc: string;
    exWroteLabel: string; exReflectedLabel: string;
    ex1W: string; ex1R: string; ex1T1: string; ex1T2: string; ex1T3: string;
    ex2W: string; ex2R: string; ex2T1: string; ex2T2: string; ex2T3: string;
    ex3W: string; ex3R: string; ex3T1: string; ex3T2: string; ex3T3: string;
    exCta: string; exNote: string;
    trustTag: string; trustH: string; trustDesc: string;
    trust1Title: string; trust1Body: string;
    trust3Title: string; trust3Body: string;
    patternQ1: string; patternQ2: string;
    pricingTag: string; pricingH: string; pricingDesc: string;
    freeLabel: string; freeTagline: string; freeDesc: string;
    freeF2Sub: string; freeF3Label: string; freeF3Sub: string;
    freeF4Label: string; freeF4Sub: string; freeCta: string; freeNote: string;
    premiumLabel: string; premiumTagline: string;
    premiumCancelNote: string; premiumDesc: string;
    premiumWithout: string; premiumWith: string;
    premiumCta: string; premiumPreview: string;
    faqH: string;
    faq1Q: string; faq1A: string; faq2Q: string; faq2A: string;
    faq3Q: string; faq3A: string; faq4Q: string; faq4A: string;
    faq5Q: string; faq5A: (n: number) => string;
    privacyLink: string;
    ctaTag: string; ctaH1: string; ctaH2: string; ctaDesc: string; ctaBtn: string;
    ctaT1: string; ctaT2: string; ctaT4: string;
  };
  moodTool: {
    heading: string; choosePrompt: string; writeEntry: string; backLabel: string;
    m1Label: string; m1Desc: string; m1Prompt: string;
    m2Label: string; m2Desc: string; m2Prompt: string;
    m3Label: string; m3Desc: string; m3Prompt: string;
    m4Label: string; m4Desc: string; m4Prompt: string;
    m5Label: string; m5Desc: string; m5Prompt: string;
    m6Label: string; m6Desc: string; m6Prompt: string;
    m7Label: string; m7Desc: string; m7Prompt: string;
    m8Label: string; m8Desc: string; m8Prompt: string;
  };
  requirePremium: {
    checking: string; heading: string; desc: string;
    cta: string;
    noPressure: (n: number) => string;
    // Gate screen (shown when a non-premium user hits a premium-only page)
    headingPrimary:        string;
    headingAccent:         string;
    body:                  string;
    premiumFeatureBadge:   string;
    perMonthSuffix:        string;
    previewCta:            string;
    continueFreeCta:       string;
    trustLine:             string;
  };
  magicLoginPage: {
    returningGreeting: string; newGreeting: string;
    returningWaiting: string; newTagline: string;
    feat1: string; feat2: string; feat3: string;
    ctaReturning: string; ctaNew: string;
    codeHint: string; deviceHint: string; noPasswordHint: string;
    codeLabel: string; linkLabel: string;
    codeBest: string; linkBest: string;
    sendLink: string; sendEmail: string; sending: string;
    codePlaceholder: string; verify: string; verifying: string;
    emailAddressLabel: string;
    backToHome:        string;
    formAriaLabel:     string;
    metaTitle:       (appName: string) => string;
    metaDescription: (appName: string) => string;
    ogTitle:         (appName: string) => string;
    ogDescription:   string;
  };
  upgradePage: {
    metaTitle: (appName: string) => string;
    metaDescription: (appName: string, cadence: string) => string;
    faq1Q: (appName: string) => string; faq1A: string; faq2Q: string; faq2A: (n: number) => string;
    faq3Q: string; faq3A: string; faq4Q: string; faq4A: string;
    faq5Q: string; faq5A: string;
    compRow1: string; compRow2: string; compRow3: string;
    compRow4: string; compRow5: string; compRow6: string;
    compUnlimited: string;
    redirecting: string;
  };

  // ── Subscription confirmation email ──────────────────────────────────────────
  email: {
    confirmTitle:      (newsletterName: string) => string;
    confirmHeading:    string;
    confirmBody:       string;
    whatToExpectLabel: string;
    whatToExpectBody:  string;
    readLatestCta:     string;
    footerLine1:       (appName: string) => string;
    footerLine2:       string;
    privacyPolicy:     string;
  };

  // ── Insights preview page ────────────────────────────────────────────────────
  insightPreview: {
    // Banner
    bannerLabel:          string;
    bannerText:           string;
    bannerCta:            string;
    // Header
    heading:              string;
    subHasDataPrefix:     string;
    subHasDataCount:      (count: number) => string;
    subNoData:            string;
    // Stat cards
    statBuilds:           string;
    statMomentumRecent:   string;
    // Weekly summary lock
    weeklySectionLabel:   string;
    weeklySectionSub:     string;
    weeklyLockTitle:      string;
    weeklyLockBody:       string;
    weeklyLockCta:        string;
    // Domain section
    domainSectionLabel:   string;
    domainSubHasData:     string;
    domainSubNoData:      string;
    domainTopArea:        string;
    domainEmptyBody:      string;
    // Domain labels (keys match DOMAIN_LABELS record keys)
    domainMoney:          string;
    domainWork:           string;
    domainRelationship:   string;
    domainHealth:         string;
    domainGrief:          string;
    domainParenting:      string;
    domainCreative:       string;
    domainIdentity:       string;
    domainFitness:        string;
    // Pattern underneath
    patternSectionLabel:  string;
    patternHasData:       (emotion: string, theme: string) => string;
    patternRecentlyLabel: string;
    patternNote:          string;
    patternNoDataBody:    string;
    patternNoDataAfter:   string;
    // What you keep coming back to
    corepatternLabel:     string;
    corepatternSub:       string;
    corepatternHasData:   (theme: string) => string;
    corepatternNoData:    string;
    corepatternSubHasData:string;
    corepatternSubNoData: string;
    corepatternBlur1:     string;
    corepatternBlur2:     string;
    corepatternBlur3:     string;
    corepatternLockCta:   string;
    // Themes + Emotions sections (shared strings)
    themesSectionLabel:   string;
    themesSubHasData:     (count: number) => string;
    emotionsSectionLabel: string;
    emotionsSubHasData:   (count: number) => string;
    detectedFromReflections: string;
    appearsAfterEntries:  string;
    // Upgrade CTA
    upgradePremiumLabel:  string;
    upgradeHeadingHasData:string;
    upgradeHeadingNoData: string;
    upgradeBodyHasData:   (count: number) => string;
    upgradeBodyNoData:    string;
    upgradeCta:           (price: string) => string;
    upgradeBack:          string;
    upgradeRefund:        (days: number) => string;
    // Blurred weekly-summary demo (behind the Premium lock)
    demoParagraph1:       string;
    demoParagraph2:       string;
    demoParagraph3:       string;
    // Footer
    footerNote:           string;
  };

  // ── Install prompt (PWA banner) ───────────────────────────────────────────
  installPrompt: {
    title:          (appName: string) => string;
    iOSPart1:       string;
    iOSShare:       string;
    iOSThen:        string;
    iOSAddHome:     string;
    androidDesc:    string;
    close:          string;
    install:        string;
    later:          string;
    gotIt:          string;
    footerNote:     string;
  };

  // ── Auth complete (magic-link callback tab) ───────────────────────────────
  authComplete: {
    metaTitle:       (appName: string) => string;
    metaDescription: (appName: string) => string;
    signingIn:       string;
    signedIn:        string;
    closeTab:        string;
    continuePremium: string;
    gotoDashboard:   string;
  };

  // ── Install page ──────────────────────────────────────────────────────────
  installPage: {
    metaTitle:         (appName: string) => string;
    metaDescription:   (appName: string) => string;
    tag:               (appName: string) => string;
    headline:          (appName: string) => string;
    desc:              (appName: string) => string;
    appTagline:        string;
    appSubTagline:     string;
    benefit1Label:     string;
    benefit1Detail:    string;
    benefit2Label:     string;
    benefit2Detail:    string;
    benefit3Label:     string;
    benefit3Detail:    string;
    mobileTag:         (appName: string) => string;
    mobileHeadline:    (appName: string) => string;
    mobileDesc:        (appName: string) => string;
    cardHeadline:      string;
    cardSubtitle:      string;
    alreadyInstalled:  string;
    alreadyDesc:       (appName: string) => string;
    addDevice:         string;
    oneClickDesc:      string;
    installBtn:        (appName: string) => string;
    incognitoNote:     string;
    iosSafariIntro:    string;
    iosStep1:          string;
    iosStep2:          string;
    iosStep3:          string;
    iosStep4:          (appName: string) => string;
    iosSafariNote:     string;
    desktopTitle:      string;
    desktopStep1:      string;
    desktopStep2:      string;
    desktopStep3:      (appName: string) => string;
    helpfulNote:       string;
    helpfulBody:       (appName: string) => string;
    backHome:          string;
    footerNote:        (appName: string) => string;
  };

  // ── About page ────────────────────────────────────────────────────────────
  aboutPage: {
    metaTitle:         (appName: string) => string;
    metaDescription:   string;
    ogTitle:           (appName: string) => string;
    ogDescription:     string;
    tag:               (appName: string) => string;
    headline1:         string;
    headline2:         string;
    subheadline:       (appName: string) => string;
    ctaStart:          string;
    ctaPricing:        string;
    noCreditCard:      string;
    whyNameTag:        (appName: string) => string;
    why1:              string;
    why2:              string;
    why3:              (appName: string) => string;
    pullQuote:         (appName: string) => string;
    builtIndepTag:     string;
    card1Label:        string;
    card1Body:         (appName: string) => string;
    card2Label:        string;
    card2Body:         string;
    card3Label:        string;
    card3Body:         (appName: string, email: string) => string;
    contactNote:       (email: string) => string;
    differentTag:      string;
    different1:        (appName: string) => string;
    different2:        (appName: string) => string;
    isTag:             (appName: string) => string;
    is1:               string;
    is2:               string;
    is3:               string;
    is4:               string;
    isNotTag:          (appName: string) => string;
    isNot1:            string;
    isNot2:            string;
    isNot3:            string;
    isNot4:            string;
    aiTag:             string;
    ai1:               string;
    ai2:               string;
    ai3:               string;
    privacyTag:        string;
    privacy1:          string;
    privacy2:          (appName: string) => string;
    privacyLink:       string;
    footerNote:        (appName: string) => string;
    ctaStartFree:      string;
    ctaBlog:           string;
  };

  // ── Email capture widget ──────────────────────────────────────────────────
  emailCapture: {
    successHeading:  string;
    successSub:      string;
    inlineHeading:   string;
    inlineSub:       string;
    placeholder:     string;
    subscribe:       string;
    loading:         string;
    errorMsg:        string;
    indexHeading:    string;
    indexSub:        string;
    successConfirm:  string;
    successLookOut:  string;
    noSpam:          string;
  };

  // ── Upgrade page (remaining hardcoded strings) ────────────────────────────
  upgradeFull: {
    // Hero
    heroTag:              string;
    heroH1:               string;
    heroH1Accent:         string;
    heroDesc:             (appName: string) => string;
    // Proof card labels
    proofCardHeader:      string;
    proofCardBadge:       string;
    proofFromEntries:     string;
    proofBar1:            string;
    proofBar2:            string;
    proofBar3:            string;
    proofBar4:            string;
    proofStat1:           string;
    proofStat2:           string;
    proofReflects:        string;
    proofQuote:           string;
    proofNote:            string;
    proofPrivacy:         string;
    // Price / billing
    perMonth:             string;
    trialNoCharge:        string;
    trialExplainer:       (trialLabel: string) => string;
    previewInsights:      string;
    bySubscribing:        string;
    termsOfService:       string;
    privacyPolicy:        string;
    alreadyFree:          string;
    alreadyFreeDesc:      string;
    // What Premium surfaces section
    surfacesTag:          string;
    surfacesH2:           string;
    surfacesH2Accent:     string;
    surfacesDesc:         (appName: string) => string;
    surfacesNote:         string;
    // Proof cards
    card1Tag:             string;
    card1Headline:        string;
    card2Tag:             string;
    card2Headline:        string;
    card2PerMonth:        string;
    card3Tag:             string;
    card3Quote:           string;
    card3Note:            string;
    card4Tag:             string;
    card4Text:            string;
    card4TextAccent:      string;
    card4TextPost:        string;
    card4Note:            string;
    card5Tag:             string;
    card5Text:            string;
    card5Note:            string;
    card6Tag:             string;
    card6Quote:           string;
    card6Note:            string;
    cardLabel1:           string;
    cardLabel2:           string;
    cardLabel3:           string;
    cardLabel4:           string;
    seeFullExample:       string;
    // Mid CTA
    midH:                 string;
    midAccent:            string;
    // FAQ
    faqHeading:           string;
    faq1Q:                (appName: string) => string;
    faq1A:                string;
    faq2Q:                string;
    faq2A:                (n: number) => string;
    faq3Q:                string;
    faq3A:                (trialLabel: string, noChargeUntil: string, email: string) => string;
    faq4Q:                string;
    faq4A:                string;
    faq5Q:                string;
    faq5A:                string;
    faq6Q:                string;
    faq6A:                (appName: string) => string;
    faq7Q:                (cadence: string) => string;
    faq7A:                (appName: string, cadence: string) => string;
    faqTerms:             string;
    faqPrivacy:           string;
    // Closing CTA
    closingH:             string;
    closingAccent:        string;
    closingDesc:          (appName: string) => string;
    closingStartFree:     string;
    closingTrust:         string;
    andConnector:         string;
  };

  // ── Blog page chrome ─────────────────────────────────────────────────────
  blogPage: {
    metaTitle:       (appName: string) => string;
    metaDescription: string;
    ogTitle:         (appName: string) => string;
    ogDescription:   string;
    tag:            (appName: string) => string;
    heading:        string;
    subheading:     string;
    note:           (appName: string) => string;
    topic1:         string;
    topic2:         string;
    topic3:         string;
    ctaJournal:     string;
    ctaPremium:     string;
    minRead:        (n: number) => string;
    readArticle:    string;
    bottomH:        string;
    bottomDesc:     (appName: string) => string;
    bottomCta:      string;
    bottomPrivacy:  string;
    catEmotionalLoad: string;
    catJournaling:    string;
    catRest:          string;
    catSelfAwareness: string;
    // Article slug page
    articleNotFound:  string;
  };

  // ── Locale-aware pricing display strings ─────────────────────────────────
  pricingStrings: {
    trialLabel:         (days: number) => string;
    valueLabel:         (days: number) => string;
    trialFreeFor:       (days: number) => string;
    trialNoChargeUntil: (untilDay: number) => string;
    perMonth:           (price: string) => string;
    perMonthLabel:      string;
    perMoShort:         string;
    thenPerMonth:       (cadence: string) => string;
    noChargeToday:      string;
    fullAccess:         string;
    step:               string;
    startTrialCta:      (label: string) => string;
    cancelAnytimeLong:  string;
  };


  // ── Premium feature labels — single source of truth ─────────────────────────
  // Referenced by: HomeBelowFold, RequirePremium, UpgradeTriggerModal,
  //                upgrade/page, upgrade/confirmed, settings/billing
  premiumFeatures: {
    f1Label: string; f1Sub: string;
    f2Label: string; f2Sub: string;
    f3Label: string; f3Sub: string;
    f4Label: string; f4Sub: string;
    f5Label: string; f5Sub: string;
  };

  // ── Legal pages — language notice banner ─────────────────────────────────
  // Privacy Policy and Terms of Service stay in English.
  // Only this notice banner and the page titles are translated.
  legalPages: {
    languageNotice:             string;
    contactUs:                  string;
    privacyTitle:               string;
    privacyHeadline:            string;
    termsTitle:                 string;
    termsHeadline:              string;
    lastUpdated:                string;
    questions:                  string;
    termsOfService:             string;
    privacyPolicy:              string;
    privacyMetaTitle:           (appName: string) => string;
    privacyMetaDescription:     (appName: string) => string;
    privacyOgTitle:             (appName: string) => string;
    privacyOgDescription:       (appName: string) => string;
    termsMetaTitle:             (appName: string) => string;
    termsMetaDescription:       (appName: string) => string;
    termsOgTitle:               (appName: string) => string;
    termsOgDescription:         (appName: string) => string;
  };

}