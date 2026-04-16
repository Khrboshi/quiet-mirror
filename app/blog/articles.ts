export type BlogArticle = {
  slug: string;
  title: string;
  category: string;
  minutes: number;
  summary: string;
  body: string[];
  /** ISO 8601 date — used by sitemap.xml for lastModified freshness signals */
  publishedAt: string;
};

export const ARTICLES: BlogArticle[] = [
  {
    slug: "when-you-feel-behind-on-your-own-life",
    publishedAt: "2024-11-01",
    category: "Emotional load",
    minutes: 5,
    title: "When you feel behind on your own life",
    summary:
      "How to notice the quiet pressure you put on yourself, and what gentle pacing can look like in real days.",
    body: [
      "Feeling “behind” is rarely about your calendar. It’s usually about the quiet, invisible pressure you carry: the life you thought you’d have by now, the expectations you’ve picked up from other people, the pace you believe you should be keeping.",
      "On overloaded weeks, your brain starts measuring everything against an imaginary version of you who is always caught up. No inbox backlog. No emotional backlog. No fatigue.",
      "Quiet Mirror can’t fix your schedule, but it can help you see what’s actually happening underneath it. When you write honestly about your days, patterns emerge: which responsibilities drain you most, which small moments feel unexpectedly grounding, which expectations never belonged to you in the first place.",
      "Why it matters: when you see that you’re not 'behind'—you’re overloaded—it becomes easier to soften the internal narrative. You can start asking kinder questions: What can be lighter? What can be good enough for now? Where do I need to lower the bar so I can actually rest?"
    ]
  },
  {
    slug: "tiny-check-ins-for-a-very-busy-brain",
    publishedAt: "2024-11-08",
    category: "Journaling",
    minutes: 4,
    title: "Tiny check-ins for a very busy brain",
    summary:
      "You don’t need a perfect journaling habit. A few honest sentences are enough for patterns to emerge.",
    body: [
      "If journaling has never stuck for you, it’s probably not because you lack discipline. It’s because most versions of journaling were designed for spacious evenings, perfect routines, and blank notebooks that stay tidy.",
      "Real life is noisier. Your attention is fragmented. When you finally have five minutes to yourself, it rarely feels like the 'right' time to sit and write.",
      "Tiny check-ins change the rules. Instead of a full-page entry, you tell the truth about one moment: what actually happened, what it felt like in your body, what you needed but didn’t get.",
      "Over time, those small, honest snapshots give Quiet Mirror enough to reflect back to you: not as criticism, but as gentle patterns. You see what keeps coming up. You see where you’re consistently doing your best in hard conditions.",
      "Why it matters: consistency becomes less about willpower and more about friendliness. A busy brain can still have a steady inner conversation—just a few sentences at a time."
    ]
  },
  {
    slug: "difference-between-distraction-and-rest",
    publishedAt: "2024-11-15",
    category: "Rest",
    minutes: 6,
    title: "The difference between distraction and real rest",
    summary:
      "Scrolling isn’t failure. But your body can feel the difference between numbing out and actually exhaling.",
    body: [
      "Distraction has a bad reputation, but most of us reach for it because we’re tired. Our brains are asking for relief, and the fastest relief is whatever helps us not feel so much all at once.",
      "The problem isn’t that you scroll or binge or zone out. The problem is that distraction doesn’t give your nervous system what it actually needs to recover.",
      "Real rest is quieter and less glamorous. It looks like boredom, slower breathing, stretches of time where nothing is demanding a reaction from you.",
      "Quiet Mirror helps by giving what you actually did somewhere to land. When you write about how you spent the evening — what you watched, how you felt before and after — patterns start to emerge. What leaves you more grounded? What leaves you buzzing but still exhausted?",
      "Why it matters: when you can see the difference between numbing and exhaling, you can choose rest without shaming yourself for the nights that were just survival."
    ]
  },

  {
    slug: "the-sunday-dread",
    publishedAt: "2024-11-22",
    category: "Emotional load",
    minutes: 5,
    title: "The Sunday dread",
    summary:
      "That low-level anxiety before the week starts isn't weakness. It's your nervous system trying to prepare for too much at once.",
    body: [
      "Sunday evenings have a specific texture for a lot of people: not quite dread, not quite anxiety, but a kind of heaviness that settles in around 6pm. The weekend isn't quite over, but it's already gone in the way that matters. Something in your chest is already Monday.",
      "It's easy to interpret this as a personality flaw—as if you were someone who handles life well, Sunday evenings wouldn't feel this way. But the dread is usually information, not character. It's your nervous system trying to model what's ahead, scanning for threats, preparing defences against a week that hasn't started yet.",
      "What makes it worse is the pressure to fix it—to plan better, to rest more efficiently, to somehow outmanoeuvre the feeling. Most of that effort makes it bigger. Sunday dread tends to soften when you stop trying to think your way out and start just noticing it instead.",
      "Writing a few sentences about what specifically you're dreading—not the whole week, but the one thing that's actually weighing on you—can interrupt the spiral. Quiet Mirror can help you see whether certain triggers keep coming back, whether the dread reliably connects to particular people, projects, or situations.",
      "Why it matters: when you know what you're actually afraid of, the dread becomes more specific. And specific things are easier to carry than formless ones."
    ]
  },
  {
    slug: "when-youre-the-strong-one",
    publishedAt: "2024-12-01",
    category: "Self-awareness",
    minutes: 6,
    title: "When you're the strong one",
    summary:
      "Being the person everyone leans on is a role, not an identity. And it comes with a cost that rarely gets named.",
    body: [
      "Somewhere along the way, you became the one people call. The reliable one. The one who stays calm, figures it out, holds things together when other people can't. It probably happened gradually, through a series of moments where you showed up and nothing fell apart.",
      "The problem with being the strong one is that it becomes a contract you never signed. People stop asking if you're okay—not because they don't care, but because they've quietly filed you in the category of 'people who are always okay.' You've been too good at performing stability.",
      "Over time, that performance takes energy. You start to notice the gap between how you present and how you actually feel. You might carry resentment you can't quite justify, or a loneliness that's hard to explain given how many people are in your life.",
      "Journaling is one of the only places where the performance can come off—where you don't have to be the strong one for even a few sentences. Quiet Mirror notices when that exhaustion keeps appearing in your writing, when the weight of being relied on keeps surfacing underneath other topics.",
      "Why it matters: the role of the strong one can be chosen, but only once you can see it clearly enough to decide. Right now, for most people, it was assigned."
    ]
  },
  {
    slug: "why-good-things-feel-hard-to-hold",
    publishedAt: "2024-12-08",
    category: "Self-awareness",
    minutes: 5,
    title: "Why good things feel hard to hold onto",
    summary:
      "Some people find it harder to sit with good news than difficult feelings. There's a name for that, and it's more common than you think.",
    body: [
      "Something good happens—a compliment, a piece of progress, a moment of genuine connection—and instead of settling into it, you immediately start waiting for the other shoe to drop. You deflect, minimise, or move on faster than the moment deserved.",
      "This isn't ingratitude, and it isn't pessimism. For many people, it's closer to a protective habit. If good things don't quite land, they can't be taken away. If you don't let yourself want something fully, you can't fully lose it.",
      "The cost is subtle but real. Life starts to feel like a series of moments you lived through but didn't quite inhabit. You're present for the hard things—you've had to be—but you've accidentally trained yourself to be absent for the easy ones.",
      "Writing about good things, even briefly, starts to build a different habit. Quiet Mirror holds a record of the moments you named as meaningful, and over time that record can show you what actually matters to you—not just what you endure, but what you're quietly proud of and glad for.",
      "Why it matters: the ability to receive good things is a skill. It can be practised, slowly, in small doses, without pressure."
    ]
  },
  {
    slug: "saying-fine-when-you-dont-mean-it",
    publishedAt: "2024-12-15",
    category: "Emotional load",
    minutes: 5,
    title: "Saying fine when you don't mean it",
    summary:
      "Most people say 'I'm fine' dozens of times before they stop meaning it. The gap between the words and the feeling is worth paying attention to.",
    body: [
      "At some point, 'I'm fine' stopped being an answer and became a reflex. Someone asks how you are. You say fine. They move on. The conversation was never really about how you are—it was a social ritual, and you both know it.",
      "The problem is that rituals shape us. When you say fine often enough without meaning it, the distance between what you say and what you feel starts to feel normal. You stop expecting the question to ever land, and after a while, you stop expecting much from yourself either.",
      "The fine reflex usually develops for good reasons: past experiences where being honest wasn't safe, or relationships where your emotional reality was inconvenient for others. It was useful once. It costs more over time.",
      "The first step out of it isn't saying something more honest to other people—that can wait. It's saying something more honest to yourself, somewhere private. Quiet Mirror is built for that specific gap: the space between what you tell the room and what's actually going on.",
      "Why it matters: you can't close a gap you can't see. Writing 'I said I was fine but I wasn't' is a small act, but it's a different act than not writing it."
    ]
  },
  {
    slug: "emotional-backlog-why-you-feel-so-tired",
    publishedAt: "2025-01-05",
    category: "Self-awareness",
    minutes: 7,
    title: "Emotional backlog: why you feel so tired",
    summary:
      "Your exhaustion often has less to do with tasks, and more to do with feelings that never got to land.",
    body: [
      "There’s a kind of tiredness that sleep doesn’t touch. You wake up with a full battery physically, but a low battery emotionally. Everything feels heavier than it ‘should’.",
      "Often, that’s emotional backlog—moments you lived through but never had space to process. Conversations you replay. Decisions you postponed. Relief you never fully felt.",
      "When you pour a little of that backlog into Quiet Mirror, it stops living entirely in your head. You give those experiences a place to land.",
      "With Premium, Quiet Mirror reads across your entries over time and starts showing you when the backlog tends to build — after certain meetings, seasons, or relational patterns. That clarity isn’t about blaming yourself; it’s about understanding why your system is so tired.",
      "Why it matters: when exhaustion makes sense, it becomes easier to be kind to yourself—and to choose rest that meets the real need, not the imagined one."
    ]
  }
];

export function getArticle(slug: string): BlogArticle | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
