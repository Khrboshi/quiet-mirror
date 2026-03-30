// app/lib/copy.ts
//
// Single source of truth for all user-facing UI copy in Quiet Mirror.
//
// RULES:
//   • Every string a user can read lives here — not inline in components.
//   • Spelling and grammar fixes happen in one place; all components pick
//     them up automatically.
//   • Server-side API error messages (never shown to users) stay in their
//     routes — this file covers UI copy only.
//   • Long page-specific marketing paragraphs (HomeBelowFold, about, blog,
//     terms, privacy) stay inline — they are unique and do not repeat.
//
// TO FIX A SPELLING ERROR: edit the string here. Done.

// ─── Errors — shown to the user when something goes wrong ────────────────────

export const ERRORS = {
  // Journal
  entryEmpty:       "Please write a few words before saving.",
  entrySaveFailed:  "Failed to save your journal entry. Please try again.",
  entryLoadFailed:  "Failed to load this entry.",
  entryDeleteFailed:"Could not delete this entry. Please try again.",
  entryGenericFail: "Something went wrong. Please try again.",

  // Reflection
  reflectionFailed: "We couldn't generate a reflection right now.",

  // Insights
  insightsFailed:   "Failed to load insights.",
  insightsNoData:   "Not enough data yet — keep writing and generating reflections.",

  // Invoices
  invoicesFailed:   "Failed to load invoices.",

  // Network
  networkError:     "Network error. Please try again.",
  networkRetry:     "Network error. Try again in a moment.",

  // Generic safe message shown in error boundary pages
  safeReload:       "Your entries are safe. Reload to try again.",
} as const;

// ─── Navigation labels ────────────────────────────────────────────────────────

export const NAV = {
  backToDashboard: "Back to dashboard",
  backToJournal:   "← Back to journal",
  backToHome:      "Back to home",
  goToDashboard:   "Go to dashboard →",
} as const;

// ─── Journal ──────────────────────────────────────────────────────────────────

export const JOURNAL = {
  // Entry title fallback when no title was set
  untitledEntry: "Untitled entry",
  untitled:      "Untitled",

  // New entry page
  newEntryLabel:      "New entry",
  newEntryHeading:    "What's on your mind?",
  newEntrySubheading: "Write however feels natural. One sentence is always enough.",

  // Starter prompts shown on the new entry form
  starterPrompts: [
    "What has been weighing on you lately?",
    "Is there something you keep thinking about today?",
    "Did anything today leave a strong emotional impact?",
    "What conversation or moment is still on your mind?",
  ] as const,

  // Writing area
  notSureWhereToStart: "Not sure where to start?",
  textareaPlaceholder: "Start writing here…",
  addTitleOptional:    "+ Add a title (optional)",
  titlePlaceholder:    "Give this entry a title (optional)",
  privacyReminder:     "Your journal is private. No one else can read what you write. Entries are never used to train AI models.",
  patternsSoon:        (current: number, total: number) => `${current}/${total} entries — patterns emerge soon`,

  // Save bar
  saveButtonLabel:    "Write",
  savingLabel:        "Saving…",
  saveReflectNudge:   "Quiet Mirror will reflect this back when you're ready",

  // Delete flow
  removeEntryLabel:       "Remove this entry",
  deleteWarning:          "This will permanently delete the entry and its reflection. This cannot be undone.",
  deleteConfirmLabel:     "Yes, delete permanently",
  deletingLabel:          "Deleting…",
  cancelLabel:            "Cancel",

  // Empty state on journal list page
  emptyStateNudge: "Start writing — one sentence is always enough.",
} as const;

// ─── Reflection ───────────────────────────────────────────────────────────────

export const REFLECTION = {
  // Heading inside the reflection card
  cardHeading:       "Quiet Mirror's reflection",

  // Credits counter suffix (free users)
  creditsRemaining:  (n: number) => `${n} ${n === 1 ? "reflection" : "reflections"} remaining this month`,
  creditsResetsNext: "· resets next month",

  // CTA button states
  seeReflectionLabel:    "See reflection",
  reflectingLabel:       "Reflecting…",
  unlockReflectionLabel: "Unlock this reflection →",

  // Status badge (shown after reflection generated)
  savedToHistory: "Saved to your history",

  // First-entry onboarding banner
  firstEntryBanner: "This reflection starts your pattern history — Quiet Mirror will notice what repeats across your entries over time.",

  // Section headings
  whatYoureCarrying:   "What you're carrying",
  whatsReallyHappening:"What's really happening",
  deeperDirection:     "Deeper direction",
  keyPattern:          "Key pattern",
  gentleNextStep:      "Gentle Next Step",
  optionA:             "Option A",
  optionB:             "Option B",
  scriptLine:          "Script line",

  // Footer line
  savedPermanently: "Saved permanently · Quiet Mirror uses this to build your pattern history",

  // Post-reflection bridge (premium users)
  patternHistoryNote:  "This is now part of your pattern history.",
  patternHistorySub:   "Quiet Mirror tracks what keeps showing up across all your entries. Your insights view shows the thread that connects them.",
  seeFullPattern:      "See your full pattern →",

  // Busy state (loading dots)
  readingEntry: "Reading your entry…",

  // Nothing removed tagline — canonical spelling with em dash
  nothingRemoved: "Nothing removed — just a deeper layer added",
} as const;

// ─── Upgrade / paywall ────────────────────────────────────────────────────────

export const UPGRADE = {
  startTrial:      (label: string) => `Start ${label} →`,
  seeExample:      "See an example",
  seeWhatPremium:  "See what Premium shows",
  cancelAnytime:   "Cancel anytime",
  noQuestionsAsked:"No questions asked",
} as const;

// ─── Tools ────────────────────────────────────────────────────────────────────

export const TOOLS = {
  somethingWentWrong: (tool: string) => `Something went wrong generating your ${tool}. Try again in a moment.`,
  tryAgain:           "Try again →",
} as const;

// ─── Generic UI ───────────────────────────────────────────────────────────────

export const UI = {
  // Loading / async states
  loading: "…",

  // Questions heading (used in reflection card)
  questionsHeading: (count: number) => {
    if (count <= 0) return "Questions";
    if (count === 1) return "1 Question";
    return `${count} Questions`;
  },

  // Word count
  wordCount: (n: number) => `${n} ${n === 1 ? "word" : "words"}`,

  // Entry count progress
  entryCount: (current: number, total: number) => `${current}/${total}`,

  // Insights empty state
  noReflectionsYet: "No reflections yet",
} as const;
