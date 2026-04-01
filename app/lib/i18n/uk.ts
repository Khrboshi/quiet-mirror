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

  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: {
    product:           "Продукт",
    account:           "Обліковий запис",
    legal:             "Правова інформація",
    serviceGuarantees: "Гарантії сервісу",
    about:             "Про нас",
    pricing:           "Тарифи",
    blog:              "Блог",
    installApp:        "Встановити застосунок",
    dashboard:         "Дашборд",
    tools:             "Інструменти",
    settings:          "Налаштування",
    billing:           "Оплата",
    signIn:            "Увійти",
    startFree:         "Почати безкоштовно",
    goPremium:         "Отримати Premium",
    termsOfService:    "Умови використання",
    privacyPolicy:     "Політика конфіденційності",
    contact:           "Зв'язатися",
    noAds:             "Без реклами",
    noDataSales:       "Без продажу даних",
    privacyAssurance:  "Ваші записи залишаються приватними і ніколи не використовуються для навчання ШІ.",
    allRightsReserved: (appName, year) => `© ${year} ${appName}. Усі права захищені.`,
  },

  // ── Settings & Billing ───────────────────────────────────────────────────────
  settingsPage: {
    title:                "Налаштування",
    subtitle:             "Обліковий запис, тариф і конфіденційність.",
    upgradeLabel:         "Оновити",
    planPremium:          "Premium",
    planTrial:            "Пробний",
    planFree:             "Безкоштовний",
    accountTitle:         "Обліковий запис",
    accountSubtitle:      "Ваш логін та дані облікового запису.",
    transactionsLabel:    "Транзакції",
    planTitle:            "Тариф",
    planActivePremium:    "Premium активний.",
    planActiveFree:       "Ви на безкоштовному тарифі.",
    dataPrivacyTitle:     "Дані та конфіденційність",
    dataPrivacySubtitle:  "Ваші записи належать вам — завжди.",
    installTitle:         "Встановити",
    installSubtitle:      "Додайте на домашній екран для швидшого, схожого на застосунок досвіду — працює офлайн.",
    installAppLabel:      "Встановити застосунок",
    supportTitle:         "Підтримка",
    supportSubtitle:      "Допомога з оплатою або обліковим записом.",
    emailLabel:           "Електронна пошта",
    memberSinceLabel:     "Учасник з",
    entriesWrittenLabel:  "Записів написано",
    billingEmailNote:     "Листи про оплату надсилаються на цю адресу.",
    planLabel:            "Тариф",
    reflectionsLabel:     "Відображень цього місяця",
    resetsLabel:          "Оновлення",
    aiTrainingLabel:      "Навчання ШІ",
    aiTrainingValue:      "Ніколи не використовується",
    dataSharingLabel:     "Передача даних",
    dataSharingValue:     "Відсутня",
    privacyPolicyLabel:   "Політика конфіденційності",
    privacyReadLabel:     "Читати →",
    dataRequestNote:      (email) => `Для запиту на експорт даних або видалення облікового запису напишіть на ${email} з вашої адреси.`,
    reflectionsUnlimited: "Необмежено",
    insightsFull:         "Повний доступ",
    weeklySummaryIncluded:"Включено",
    reflectionsNone:      "0 залишилось",
    reflectionsRemaining: (n, total) => `${n} з ${total} залишилось`,
    reflectionsResume:    (date) => `Відображення відновляться ${date}. Оновіть для необмеженого доступу.`,
    reflectionsFreeNote:  (n) => `Безкоштовний тариф включає ${n} ШІ-відображень на місяць.`,
    upgradeUnlimited:     "Оновити для необмеженого →",
    billingTitle:         "Оплата",
    billingSubtitle:      "Керуйте підпискою та даними оплати.",
    manageSubscription:   "Керувати підпискою",
    upgradeToPremium:     "Перейти на Premium",
    planSectionTitle:     "Тариф",
    planStatusPremium:    "Ваш план Premium активний.",
    planStatusTrial:      "Ви на пробному тарифі — повний доступ Premium.",
    planStatusFree:       "Ви на безкоштовному тарифі. Оновіть будь-коли.",
    premiumIncludes:      "Premium включає",
    freeIncludes:         "Безкоштовний включає",
    premiumItem1:         "Необмежені ШІ-відображення",
    premiumItem2:         "Ясність шаблонів у часі",
    premiumItem3:         "Щотижневе особисте резюме",
    premiumItem4:         "Глибші інсайти без більшого написання",
    freeItem1:            "Необмежений щоденник",
    freeItem2:            "М'які підказки для початку",
    freeItem3:            (n) => `${n} ШІ-відображень на місяць`,
    freeItem4:            "Приватний за замовчуванням",
    priceLabel:           "Ціна",
    nextBillingLabel:     "Наступне списання",
    cancellationsLabel:   "Скасування",
    noPressure:            "Без тиску. Безкоштовний тариф залишається повністю доступним.",
    refundWindowLast:     (days) => `Останній день вашого ${days}-денного вікна повернення коштів`,
    refundWindowDays:     (days) => `${days} днів залишилось у вашому ${days}-денному вікні повернення`,
    refundContact:        "Не те, що очікували? Напишіть нам для повного повернення — без питань.",
    accountSectionTitle:  "Обліковий запис",
    accountBillingSubtitle: "Оплата прив'язана до вашого входу.",
  },

  // ── Tools page ───────────────────────────────────────────────────────────────
  toolsPage: {
    pageLabel:          "Ваш простір",
    pageTitle:          "Зануртесь трохи глибше",
    pageSubtitle:       "Невеликі, цілеспрямовані способи перевірити себе — окремо від записів у щоденнику.",
    moodTitle:          "Тихий момент",
    moodSubtitle:       "Зупиніться і помітьте, де ви насправді — без оцінок, просто чесність.",
    reflectionTitle:    "Кероване відображення",
    reflectionSubtitle: "Підказка, сформована навколо того, що з'являлося у ваших записах останнім часом.",
    suggestionsTitle:   "Невеликі пропозиції",
    suggestionsSubtitle:"Одна-дві м'які ідеї, засновані на ваших шаблонах — не інструкції, просто запрошення.",
    openLabel:          "Відкрити →",
  },

  // ── Magic login ──────────────────────────────────────────────────────────────
  magicLogin: {
    quote1:      "Щоб написати це, не потрібно все розуміти.",
    quote2:      "Щось намагається прояснитися. Написання допомагає.",
    quote3:      "Ваш щоденник вас не судить. Він просто слухає.",
    quote4:      "Шаблони, яких ви ще не бачите, вже є в тому, що ви написали.",
    quote5:      "Повернення — це вся практика.",
    callbackError: "Вхід не завершився в цьому браузері. На iPhone Safari та застосунок на домашньому екрані можуть не спільно використовувати вхід. Використовуйте вхід з кодом нижче там, де ви використовуєте Quiet Mirror.",
    emailSentCode: "Лист надіслано. Якщо він містить код, введіть його нижче. Якщо замість цього показується кнопка або посилання, ви все одно можете відкрити його для входу.",
    emailSentLink: "Лист надіслано. Відкрийте кнопку або посилання в тому ж браузері. Якщо ви встановили Quiet Mirror на iPhone, вхід з кодом зазвичай надійніший.",
    sendFailed:    "Не вдалося надіслати лист.",
    invalidCode:   "Недійсний код.",
  },

  // ── Journal list page ────────────────────────────────────────────────────────
  journalPage: {
    heading:      "Ваш щоденник",
    newEntry:     "Новий запис",
    entryCount:   (n) => {
      const mod10 = n % 10; const mod100 = n % 100;
      if (mod10 === 1 && mod100 !== 11) return `${n} запис`;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} записи`;
      return `${n} записів`;
    },
    emptyHeading: "Ви ще не написали жодного запису.",
    emptyBody:    "Одного речення завжди достатньо, щоб почати.",
    startHere:    "Почніть тут",
    reflected:    "Відображено",
    draft:        "Чернетка",
    open:         "Відкрити \u2192",
    start:        "Почати \u2192",
    prompt1:      "Що останнім часом вас пригнічує?",
    prompt1Sub:   "Не потрібно вирішувати \u2014 просто назвіть.",
    prompt2:      "Чи є щось, про що ви постійно думаєте сьогодні?",
    prompt2Sub:   "Розмова, відчуття, момент.",
    prompt3:      "Що відчувалося важким цього тижня?",
    prompt3Sub:   "Не потрібно пояснювати чому.",
  },

  // ── Upgrade trigger nudges ───────────────────────────────────────────────────
  upgradeTrigger: {
    seeWhatPremium:       "Дізнайтесь, що показує Premium",
    noCharge:             (days, word) => `\uD83D\uDEE1\uFE0F Без списання ${days} ${word} \u00B7 Скасування будь-коли \u00B7 `,
    cancelAnytime:        "Скасування будь-коли",
    terms:                "Умови",
    reflectionIntro:      "Коли будете готові, Quiet Mirror відобразить те, що помітив \u2014 теми, емоції та м\u2019який наступний крок. Кожен запис отримує одне відображення, збережене назавжди, щоб ваші шаблони залишались точними.",
    seeExample:           "Побачити приклад",
    workHeadline:         "Ви писали про тиск роботи.",
    workSub:              "Premium показує, коли цей шаблон повторюється \u2014 і що він має спільного протягом тижнів. Більшість людей дивуються тому, що знаходять.",
    relationshipHeadline: "Ви писали про стосунки, які вас турбують.",
    relationshipSub:      "Premium показує, коли подібне повертається \u2014 емоційну нитку у ваших записах, яку важко побачити зсередини.",
    healthHeadline:       "Ви писали про виснаження.",
    healthSub:            "Premium відстежує, коли втома продовжує з\u2019являтися і що зазвичай поруч з нею. Шаблон зазвичай починається раніше, ніж люди усвідомлюють.",
    identityHeadline:     "Ви писали про відчуття, що не схожі на себе.",
    identitySub:          "Premium показує версію себе, яка постійно з\u2019являється у ваших записах \u2014 і що зазвичай відтягує вас від неї.",
    griefHeadline:        "Ви писали про втрату.",
    griefSub:             "Premium показує, як горе проявляється і змінюється у ваших записах з часом. Іноді шаблон розкриває те, що ще треба сказати.",
    moneyHeadline:        "Ви писали про фінансовий тиск.",
    moneySub:             "Premium показує, коли грошовий стрес повертається і що він зазвичай провокує разом з ним. Шаблон рідко тільки про цифри.",
    parentingHeadline:    "Ви писали про батьківство.",
    parentingSub:         "Premium показує емоційні шаблони того, як ви з\u2019являєтеся \u2014 повторювані моменти, їхні тригери та те, що змінюється з часом.",
    creativeHeadline:     "Ви писали про творчий блок.",
    creativeSub:          "Premium показує, коли це з\u2019являється, що передує цьому та чи стає краще чи гірше. Шаблон зазвичай не такий, як ви думаєте.",
    fitnessHeadline:      "Ви писали про своє тіло.",
    fitnessSub:           "Premium відстежує емоційні шаблони навколо того, як ви почуваєтеся щодо свого фізичного стану \u2014 що змінюється, що залишається і з чим це пов\u2019язано.",
    generalHeadline:      "Це відображення тепер є частиною вашої історії шаблонів.",
    generalSub:           "Premium показує, що продовжує повторюватися у ваших записах \u2014 емоційну нитку, яку не завжди видно зсередини.",
  },

  // ── Upgrade confirmed ────────────────────────────────────────────────────────
  upgradeConfirmed: {
    headline1:     "Ваш пробний період розпочався.",
    headline2:     "Глибший рівень відкритий.",
    whatUnlocked:  "Що щойно розблоковано",
    feature1Label: "Необмежені відображення",
    feature1Sub:   "Відображайте кожен запис — без місячних обмежень.",
    feature2Label: "Повні інсайти шаблонів",
    feature2Sub:   "Подивіться, що регулярно з'являється протягом тижнів і місяців.",
    feature3Label: "Щотижневе особисте резюме",
    feature3Sub:   "Щопонеділка — написане дзеркало того, що помітив Quiet Mirror.",
    feature4Label: "Інсайти чому-це-продовжується",
    feature4Sub:   "Повторювальна емоційна петля — названа, м'яко.",
    ctaWrite:      "Написати наступний запис →",
    ctaInsights:   "Подивитися інсайти",
    refreshOnce:   "оновити один раз",
    manageBilling: "Керувати оплатою →",
    billingSettings: "налаштуваннях оплати",
  },
};
