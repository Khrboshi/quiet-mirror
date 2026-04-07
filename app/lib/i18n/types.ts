// app/lib/i18n/types.ts
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
    // Language switcher aria-labels
    switchToLanguage: (label: string) => string;
    currentLanguage:  (label: string) => string;
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
    // Transactions table columns
    colDate:          string;
    colStatus:        string;
    colAmount:        string;
    colReceipt:       string;
    noInvoicesYet:    string;
    viewLabel:        string;
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
  // ── Homepage (marketing page) ────────────────────────────────────────────────
  homepage: {
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
    pF1Label: string; pF1Sub: string; pF2Label: string; pF2Sub: string;
    pF3Label: string; pF3Sub: string; pF4Label: string; pF4Sub: string;
    pF5Label: string; pF5Sub: string;
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
    f1Label: string; f1Sub: string; f2Label: string; f2Sub: string;
    f3Label: string; f3Sub: string; f4Label: string; f4Sub: string;
    cta: string;
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
  };
  upgradePage: {
    faq1Q: string; faq1A: string; faq2Q: string; faq2A: (n: number) => string;
    faq3Q: string; faq3A: string; faq4Q: string; faq4A: string;
    faq5Q: string; faq5A: string;
    compRow1: string; compRow2: string; compRow3: string;
    compRow4: string; compRow5: string; compRow6: string;
    compUnlimited: string;
    pF1Label: string; pF1Sub: string; pF2Label: string; pF2Sub: string;
    pF3Label: string; pF3Sub: string; pF4Label: string; pF4Sub: string;
    pF5Label: string; pF5Sub: string;
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
    // Footer
    footerNote:           string;
  };

}
