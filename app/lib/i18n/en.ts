// app/lib/i18n/en.ts
// English translations.
// Structure: nested namespaces matching app/lib/i18n/types.ts (Translations interface).
// Note: app/lib/copy.ts uses flat named exports (ERRORS, NAV, etc.) — en.ts mirrors
// the same strings but in the nested Translations shape, and adds the navbar namespace
// that copy.ts does not have. When updating a string, update both files.

import type { Translations } from "./types";

export const en: Translations = {
  errors: {
    entryEmpty:        "Please write a few words before saving.",
    entrySaveFailed:   "Failed to save your journal entry. Please try again.",
    entryLoadFailed:   "Failed to load this entry.",
    entryDeleteFailed: "Could not delete this entry. Please try again.",
    entryGenericFail:  "Something went wrong. Please try again.",
    reflectionFailed:  "We couldn't generate a reflection right now.",
    insightsFailed:    "Failed to load insights.",
    insightsNoData:    "Not enough data yet — keep writing and generating reflections.",
    invoicesFailed:    "Failed to load invoices.",
    networkError:      "Network error. Please try again.",
    networkRetry:      "Network error. Try again in a moment.",
    safeReload:        "Your entries are safe. Reload to try again.",
  },

  nav: {
    backToDashboard: "Back to dashboard",
    backToJournal:   "← Back to journal",
    backToHome:      "Back to home",
    goToDashboard:   "Go to dashboard →",
  },

  journal: {
    untitledEntry:       "Untitled entry",
    untitled:            "Untitled",
    newEntryLabel:       "New entry",
    newEntryHeading:     "What's on your mind?",
    newEntrySubheading:  "Write however feels natural. One sentence is always enough.",
    starterPrompts: [
      "What has been weighing on you lately?",
      "Is there something you keep thinking about today?",
      "Did anything today leave a strong emotional impact?",
      "What conversation or moment is still on your mind?",
    ],
    notSureWhereToStart: "Not sure where to start?",
    textareaPlaceholder: "Start writing here…",
    addTitleOptional:    "+ Add a title (optional)",
    titlePlaceholder:    "Give this entry a title (optional)",
    privacyReminder:     "Your journal is private. No one else can read what you write. Entries are never used to train AI models.",
    patternsSoon:        (current, total) => `${current}/${total} entries — patterns emerge soon`,
    saveButtonLabel:     "Write",
    savingLabel:         "Saving…",
    saveReflectNudge:    "Quiet Mirror will reflect this back when you're ready",
    removeEntryLabel:    "Remove this entry",
    deleteWarning:       "This will permanently delete the entry and its reflection. This cannot be undone.",
    deleteConfirmLabel:  "Yes, delete permanently",
    deletingLabel:       "Deleting…",
    cancelLabel:         "Cancel",
    emptyStateNudge:     "Start writing — one sentence is always enough.",
  },

  reflection: {
    cardHeading:           "Quiet Mirror's reflection",
    creditsRemaining:      (n) => `${n} ${n === 1 ? "reflection" : "reflections"} remaining this month`,
    creditsResetsNext:     "· resets next month",
    seeReflectionLabel:    "See reflection",
    reflectingLabel:       "Reflecting…",
    unlockReflectionLabel: "Unlock this reflection →",
    savedToHistory:        "Saved to your history",
    firstEntryBanner:      "This reflection starts your pattern history — Quiet Mirror will notice what repeats across your entries over time.",
    whatYoureCarrying:     "What you're carrying",
    whatsReallyHappening:  "What's really happening",
    deeperDirection:       "Deeper direction",
    keyPattern:            "Key pattern",
    gentleNextStep:        "Gentle Next Step",
    optionA:               "Option A",
    optionB:               "Option B",
    scriptLine:            "Script line",
    savedPermanently:      "Saved permanently · Quiet Mirror uses this to build your pattern history",
    patternHistoryNote:    "This is now part of your pattern history.",
    patternHistorySub:     "Quiet Mirror tracks what keeps showing up across all your entries. Your insights view shows the thread that connects them.",
    seeFullPattern:        "See your full pattern →",
    readingEntry:          "Reading your entry…",
    nothingRemoved:        "Nothing removed — just a deeper layer added",
  },

  upgrade: {
    startTrial:       (label) => `Start ${label} →`,
    seeExample:       "See an example",
    seeWhatPremium:   "See what Premium shows",
    cancelAnytime:    "Cancel anytime",
    noQuestionsAsked: "No questions asked",
  },

  tools: {
    somethingWentWrong: (tool) => `Something went wrong generating your ${tool}. Try again in a moment.`,
    tryAgain:           "Try again →",
  },

  ui: {
    loading:          "…",
    questionsHeading: (count) => {
      if (count <= 0) return "Questions";
      if (count === 1) return "1 Question";
      return `${count} Questions`;
    },
    wordCount:          (n) => `${n} ${n === 1 ? "word" : "words"}`,
    entryCount:         (current, total) => `${current}/${total}`,
    noReflectionsYet:   "No reflections yet",
    reflectionsSoFar:   (n) => `${n} ${n === 1 ? "reflection" : "reflections"} so far`,
    moreNeeded:         (n) => `${n} more ${n === 1 ? "reflection" : "reflections"} and Quiet Mirror will start surfacing what quietly repeats across your entries.`,
    patternsGenerating: "Generating your personal patterns now — check back after your next reflection.",
    writeAnEntry:       "Write an entry →",
    summaryFailed:      "Couldn't generate summary.",
  },

  navbar: {
    signIn:         "Sign in",
    startFree:      "Start free",
    logout:         "Logout",
    yourSpace:      "Your space",
    openMenu:       "Open menu",
    closeMenu:      "Close menu",
    writeFreeEntry: "Write your first entry free →",
    privateNoCred:  "No feed, no pressure, no card required. Just a calmer place to put what is on your mind.",
    privateTagline: "Start with a private journal entry.",
  },
};
