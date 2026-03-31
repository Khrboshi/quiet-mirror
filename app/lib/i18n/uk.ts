// app/lib/i18n/uk.ts
// Ukrainian (Українська) translations.
// Natural, modern Ukrainian — not machine-translated.
// Reviewed string by string for accuracy and tone.

import type { Translations } from "./types";

// Ukrainian pluralisation helper for "відображення" (reflection)
// Ukrainian has three plural forms:
//   1       → singular   (1 відображення)
//   2–4     → plural 1   (2 відображення)
//   5–20    → plural 2   (5 відображень)
//   21, 31… → singular again
function ukReflections(n: number): string {
  const mod10  = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11)              return `${n} відображення`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} відображення`;
  return `${n} відображень`;
}

// Ukrainian pluralisation helper for "слово" (word)
function ukWords(n: number): string {
  const mod10  = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11)              return `${n} слово`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} слова`;
  return `${n} слів`;
}

export const uk: Translations = {
  errors: {
    entryEmpty:        "Будь ласка, напишіть кілька слів перед збереженням.",
    entrySaveFailed:   "Не вдалося зберегти запис. Будь ласка, спробуйте ще раз.",
    entryLoadFailed:   "Не вдалося завантажити цей запис.",
    entryDeleteFailed: "Не вдалося видалити цей запис. Будь ласка, спробуйте ще раз.",
    entryGenericFail:  "Щось пішло не так. Будь ласка, спробуйте ще раз.",
    reflectionFailed:  "Наразі не вдалося створити відображення.",
    insightsFailed:    "Не вдалося завантажити аналітику.",
    insightsNoData:    "Даних ще недостатньо — продовжуйте писати та створювати відображення.",
    invoicesFailed:    "Не вдалося завантажити рахунки.",
    networkError:      "Помилка мережі. Будь ласка, спробуйте ще раз.",
    networkRetry:      "Помилка мережі. Спробуйте за мить.",
    safeReload:        "Ваші записи в безпеці. Перезавантажте сторінку, щоб спробувати ще раз.",
  },

  nav: {
    backToDashboard: "Повернутись до панелі",
    backToJournal:   "← До щоденника",
    backToHome:      "На головну",
    goToDashboard:   "До панелі →",
  },

  journal: {
    untitledEntry:       "Запис без назви",
    untitled:            "Без назви",
    newEntryLabel:       "Новий запис",
    newEntryHeading:     "Що у вас на думці?",
    newEntrySubheading:  "Пишіть, як вам зручно. Одного речення завжди достатньо.",
    starterPrompts: [
      "Що вас турбує останнім часом?",
      "Чи є щось, про що ви постійно думаєте сьогодні?",
      "Чи щось сьогодні справило на вас сильний емоційний вплив?",
      "Яка розмова чи момент досі у вас на думці?",
    ],
    notSureWhereToStart: "Не знаєте, з чого почати?",
    textareaPlaceholder: "Починайте писати тут…",
    addTitleOptional:    "+ Додати назву (необов'язково)",
    titlePlaceholder:    "Дайте запису назву (необов'язково)",
    privacyReminder:     "Ваш щоденник є приватним. Ніхто інший не може читати те, що ви пишете. Записи ніколи не використовуються для навчання моделей ШІ.",
    patternsSoon:        (current, total) => `${current}/${total} записів — закономірності скоро з'являться`,
    saveButtonLabel:     "Записати",
    savingLabel:         "Збереження…",
    saveReflectNudge:    "Quiet Mirror відобразить це, коли ви будете готові",
    removeEntryLabel:    "Видалити цей запис",
    deleteWarning:       "Це назавжди видалить запис та його відображення. Цю дію неможливо скасувати.",
    deleteConfirmLabel:  "Так, видалити назавжди",
    deletingLabel:       "Видалення…",
    cancelLabel:         "Скасувати",
    emptyStateNudge:     "Починайте писати — одного речення завжди достатньо.",
  },

  reflection: {
    cardHeading:           "Відображення Quiet Mirror",
    creditsRemaining:      (n) => `${ukReflections(n)} залишилось цього місяця`,
    creditsResetsNext:     "· оновлюється наступного місяця",
    seeReflectionLabel:    "Переглянути відображення",
    reflectingLabel:       "Відображення…",
    unlockReflectionLabel: "Розблокувати це відображення →",
    savedToHistory:        "Збережено у вашу історію",
    firstEntryBanner:      "Це відображення починає вашу історію закономірностей — Quiet Mirror помітить, що повторюється у ваших записах з часом.",
    whatYoureCarrying:     "Що вас обтяжує",
    whatsReallyHappening:  "Що насправді відбувається",
    deeperDirection:       "Глибший напрямок",
    keyPattern:            "Ключова закономірність",
    gentleNextStep:        "М'який наступний крок",
    optionA:               "Варіант А",
    optionB:               "Варіант Б",
    scriptLine:            "Рядок сценарію",
    savedPermanently:      "Збережено назавжди · Quiet Mirror використовує це для побудови вашої історії закономірностей",
    patternHistoryNote:    "Це тепер є частиною вашої історії закономірностей.",
    patternHistorySub:     "Quiet Mirror відстежує те, що постійно з'являється у ваших записах. Ваш перегляд аналітики показує нитку, що їх пов'язує.",
    seeFullPattern:        "Переглянути вашу повну закономірність →",
    readingEntry:          "Читання вашого запису…",
    nothingRemoved:        "Нічого не видалено — лише додано глибший шар",
  },

  upgrade: {
    startTrial:       (label) => `Розпочати ${label} →`,
    seeExample:       "Переглянути приклад",
    seeWhatPremium:   "Що показує Premium",
    cancelAnytime:    "Скасувати будь-коли",
    noQuestionsAsked: "Без зайвих запитань",
  },

  tools: {
    somethingWentWrong: (tool) => `Під час створення ${tool} сталася помилка. Спробуйте за мить.`,
    tryAgain:           "Спробувати ще раз →",
  },

  ui: {
    loading:          "…",
    questionsHeading: (count) => {
      if (count <= 0) return "Запитання";
      if (count === 1) return "1 запитання";
      return `${count} запитання`;
    },
    wordCount:          (n) => ukWords(n),
    entryCount:         (current, total) => `${current}/${total}`,
    noReflectionsYet:   "Відображень ще немає",
    reflectionsSoFar:   (n) => `${ukReflections(n)} поки що`,
    moreNeeded:         (n) => `Ще ${ukReflections(n)} — і Quiet Mirror почне виявляти те, що тихо повторюється у ваших записах.`,
    patternsGenerating: "Ваші особисті закономірності генеруються — поверніться після наступного відображення.",
    writeAnEntry:       "Написати запис →",
    summaryFailed:      "Не вдалося створити зведення.",
  },

  navbar: {
    signIn:         "Увійти",
    startFree:      "Почати безкоштовно",
    about:          "Про нас",
    blog:           "Блог",
    pricing:        "Ціни",
    install:        "Встановити",
    dashboard:      "Панель",
    journal:        "Щоденник",
    insights:       "Аналітика",
    tools:          "Інструменти",
    settings:       "Налаштування",
    logout:         "Вийти",
    yourSpace:      "Ваш простір",
    openMenu:       "Відкрити меню",
    closeMenu:      "Закрити меню",
    writeFreeEntry: "Написати перший запис безкоштовно →",
    privateNoCred:  "Без стрічки, без тиску, без картки. Просто спокійне місце для ваших думок.",
    privateTagline: "Почніть із приватного запису у щоденнику.",
    privateJournalingTagline: "Приватний щоденник, який відображає вас",
  },

  insights: {
    regenerateSummary: "Оновити зведення",
    entries:           "Записи",
    sinceJoined:       "З початку",
    topEmotion:        "Головна емоція",
    topTheme:          "Головна тема",
    firstSuggestion:   "Перша підказка",
    secondSuggestion:  "Друга підказка",
    momentum:          "Динаміка",
    momentumDefault:   "Стабільно",
    momentumDescriptions: {
      Heavy:    "Останні записи несуть більше емоційного навантаження",
      Lifting:  "Емоційний тягар останнім часом зменшується",
      Shifting: "У нещодавніх записах щось змінюється",
      Softening:"Інтенсивність нещодавно спадає",
      Steady:   "Стабільний емоційний тон у записах",
    },
  },

  dashboard: {
    goodMorning:       "Доброго ранку",
    goodAfternoon:     "Добрий день",
    goodEvening:       "Добрий вечір",
    today:             "сьогодні",
    yesterday:         "вчора",
    wroteToday:        "Ви писали сьогодні",
    pickUpThread:      "Продовжити думку",
    startHere:         "Почати тут",
    dayEvolved:        "Як пройшов день із того часу, як ви востаннє писали?",
    oneHonestSentence: "Одного чесного речення завжди достатньо, щоб почати.",
    alreadyWroteToday: "Ви вже писали сьогодні — як пройшов день?",
    addToToday:        "Додати до сьогодні",
    writeNow:          "Писати зараз",
    writtenToday:      "Ви вже писали сьогодні.",
    choosePrompt:      "Оберіть підказку, щоб почати.",
    entry:             "запис",
    entries:           "записів",
    moreEntries:       (n) => {
      const mod10 = n % 10, mod100 = n % 100;
      const word = (mod10 === 1 && mod100 !== 11) ? "запис"
        : (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) ? "записи"
        : "записів";
      return `Ще ${n} ${word}`;
    },
    trial:   "Пробний",
    premium: "Premium",
    free:    "Безкоштовний",
    prompts: [
      { q: "Як ваше тіло почувається прямо зараз?",       sub: "Напруга, спокій, втома, неспокій — все, що ви помічаєте.", accent: "emerald" },
      { q: "Яка одна думка зараз займає вашу увагу?",      sub: "Одного речення достатньо.",                                 accent: "violet"  },
      { q: "Про що ви уникаєте думати?",                   sub: "Не потрібно вирішувати — просто назвіть це.",               accent: "amber"   },
      { q: "Чого вам зараз потрібно більше?",              sub: "Відпочинку, простору, зв'язку, ясності — будь-чого.",       accent: "sky"     },
      { q: "Що було важким цього тижня?",                  sub: "Пояснювати не потрібно.",                                   accent: "rose"    },
      { q: "Чим ви пишаєтесь, навіть тихо?",              sub: "Дрібниці теж рахуються.",                                   accent: "emerald" },
      { q: "Просто пишіть вільно",                         sub: "Без структури. Без правил. Починайте з будь-чого.",         accent: "slate"   },
    ],
  },
};
