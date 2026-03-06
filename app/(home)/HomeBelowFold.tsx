// app/(home)/HomeBelowFold.tsx
import Link from "next/link";

export default function HomeBelowFold() {
  return (
    <>
      {/* WHO IT'S FOR — emotionally resonant */}
      <section className="border-y border-slate-800/60 bg-slate-950/80 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-5">
          <p className="mb-7 text-xs font-semibold uppercase tracking-widest text-slate-600">
            Havenly is for you if —
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: "◎",
                line: "You're always checking in on everyone else, and no one ever asks how you are.",
                color: "text-violet-400",
              },
              {
                icon: "◎",
                line: "You know something keeps happening in your life. You just can't see what.",
                color: "text-emerald-400",
              },
              {
                icon: "◎",
                line: "You've tried journaling before. You want to, but you never know what to say.",
                color: "text-amber-400",
              },
            ].map(({ icon, line, color }) => (
              <div
                key={line}
                className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5"
              >
                <span className={`text-lg ${color}`}>{icon}</span>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-300 sm:text-sm">
                  {line}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b border-slate-800/60 bg-slate-950/90 py-12 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-8 max-w-lg">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              A practice that fits around your life
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              No streaks to maintain. No goals to set. Just a quiet place to
              be honest &mdash; and something that pays attention.
            </p>
          </div>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "One sentence is enough",
                body: "You don't need to be a writer. Just open Havenly and say what's actually going on. Messy, incomplete &mdash; it doesn't matter. Havenly pays attention so you don't have to.",
                accent: "text-emerald-400",
              },
              {
                step: "2",
                title: "Havenly reflects it back",
                body: "Havenly reads what you wrote and offers a gentler version of what it heard &mdash; the emotions underneath, the patterns surfacing, the things you couldn't quite name.",
                accent: "text-violet-400",
              },
              {
                step: "3",
                title: "Start seeing what repeats",
                body: "Over weeks, Havenly shows you what keeps coming up &mdash; what drains you, what lifts you, what you keep circling back to without realising it.",
                accent: "text-amber-400",
              },
            ].map(({ step, title, body, accent }) => (
              <div key={step} className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5">
                <p className={`text-xs font-semibold uppercase tracking-widest ${accent}`}>{step}</p>
                <h3 className="mt-2 text-[15px] font-medium text-white sm:text-sm">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-xs" dangerouslySetInnerHTML={{ __html: body }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — placeholder quotes, replace before launch */}
      <section className="border-b border-slate-800/60 bg-slate-950 py-12 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <p className="mb-8 text-xs font-semibold uppercase tracking-widest text-slate-600">
            What people have said
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                quote: "I've tried journaling apps before and always gave up. This is different — it actually says something back. I've written more in the last month than in the last three years.",
                name: "M.L.",
                detail: "Using Havenly for 6 weeks",
                color: "border-violet-500/15",
              },
              {
                quote: "The pattern section is what got me. I didn't realise how often I was writing about the same thing until Havenly showed me. It's oddly relieving to see it laid out.",
                name: "T.A.",
                detail: "Using Havenly for 3 months",
                color: "border-emerald-500/15",
              },
              {
                quote: "It doesn't try to fix you or give you advice. It just notices. That's all I needed — something to notice without judging.",
                name: "R.K.",
                detail: "Using Havenly for 5 weeks",
                color: "border-amber-500/15",
              },
            ].map(({ quote, name, detail, color }) => (
              <div key={name} className={`rounded-2xl border bg-slate-900/30 p-5 sm:p-6 ${color}`}>
                <p className="text-[13px] leading-relaxed text-slate-300 italic sm:text-xs">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-slate-700/60" />
                  <div>
                    <p className="text-xs font-medium text-slate-300">{name}</p>
                    <p className="text-[10px] text-slate-600">{detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Remove this line when real quotes are in */}
          <p className="mt-5 text-[10px] text-slate-800 text-center">placeholder quotes — replace before launch</p>
        </div>
      </section>

      {/* WHAT HAVENLY SHOWS YOU */}
      <section className="border-b border-slate-800/60 bg-slate-950 py-12 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-8 max-w-lg">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Your hidden patterns &mdash; finally visible
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Not summaries of your day. The things that are harder to see from the inside.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {[
              { label: "What you feel most", example: "Curiosity &mdash; 14 times across 22 entries", color: "border-violet-500/20 bg-violet-500/5", tag: "text-violet-400", premium: false },
              { label: "What keeps coming back", example: "Communication &mdash; in 10 of your last 15 entries", color: "border-emerald-500/20 bg-emerald-500/5", tag: "text-emerald-400", premium: false },
              { label: "Your hidden pattern right now", example: "&ldquo;You&rsquo;re trying to make sense of the moment while protecting your self-respect.&rdquo;", color: "border-amber-500/20 bg-amber-500/5", tag: "text-amber-400", premium: true },
              { label: "What's shifting in you", example: "Hope, Openness, and Curiosity all rising &mdash; something is lifting", color: "border-sky-500/20 bg-sky-500/5", tag: "text-sky-400", premium: true },
              { label: "Your weekly mirror", example: "A personal paragraph written just for you &mdash; what Havenly noticed this week across all your entries", color: "border-rose-500/20 bg-rose-500/5", tag: "text-rose-400", premium: true },
              { label: "Questions worth sitting with", example: "&ldquo;What would it mean to stop saying you&rsquo;re fine &mdash; just for today?&rdquo;", color: "border-slate-500/20 bg-slate-500/5", tag: "text-slate-400", premium: false },
            ].map(({ label, example, color, tag, premium }) => (
              <div key={label} className={`relative rounded-2xl border p-4 sm:p-5 ${color}`}>
                {premium && (
                  <span className="absolute right-3 top-3 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-emerald-400">
                    Premium
                  </span>
                )}
                <p className={`text-[10px] font-semibold uppercase tracking-widest ${tag}`}>{label}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400 italic sm:text-xs" dangerouslySetInnerHTML={{ __html: example }} />
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/insights/preview" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              See a full example of insights &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section className="border-b border-slate-800/60 bg-slate-950 py-12 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-8 max-w-lg">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">Start free. Upgrade when it earns it.</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">Free is where you put thoughts down. Premium is where they start making sense.</p>
          </div>
          <div className="flex flex-col-reverse gap-4 md:grid md:grid-cols-2 md:gap-5">
            <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Free</p>
              <p className="mt-1 text-xl font-semibold text-white sm:text-2xl">The perfect private space to vent</p>
              <p className="mt-2 text-sm text-slate-500">A calm place to write honestly &mdash; no commitment, no pressure, no audience.</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                {["Write anytime, entries stay private","3 AI reflections per month","Gentle daily prompts","Basic pattern insights"].map((f) => (
                  <li key={f} className="flex items-start gap-2"><span className="mt-0.5 shrink-0 text-emerald-600">&#10003;</span>{f}</li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <Link href="/magic-login" className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors">Start for free</Link>
                <p className="mt-2 text-center text-xs text-slate-700">No credit card. No expiry.</p>
              </div>
            </div>
            <div className="relative flex flex-col rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-5 sm:p-6">
              <div className="absolute right-4 top-4 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-400">Early access</div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500/70">Premium</p>
              <p className="mt-1 text-xl font-semibold text-white sm:text-2xl">The roadmap to understanding yourself</p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-white">$30</span>
                <span className="text-sm text-slate-400">/ month</span>
              </div>
              {/* Before/after framing */}
              <div className="mt-3 rounded-xl border border-slate-700/60 bg-slate-900/40 p-4 space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="text-slate-600 text-xs mt-0.5 shrink-0">Before</span>
                  <p className="text-xs text-slate-500 leading-relaxed">You know something keeps happening. You just can't see what.</p>
                </div>
                <div className="h-px bg-slate-800" />
                <div className="flex items-start gap-2.5">
                  <span className="text-emerald-500 text-xs mt-0.5 shrink-0">After</span>
                  <p className="text-xs text-slate-300 leading-relaxed">Havenly shows you the pattern — what it is, when it peaks, and what tends to shift it.</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
                {["Everything in Free","Unlimited reflections","Full hidden pattern insights","Weekly personal summary from Havenly",'"Why does this keep happening?" insights',"Cancel anytime"].map((f) => (
                  <li key={f} className="flex items-start gap-2"><span className="mt-0.5 shrink-0 text-emerald-400">&#10003;</span>{f}</li>
                ))}
              </ul>
              <div className="mt-auto pt-6 flex flex-col gap-2">
                <Link href="/upgrade" className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-colors">Upgrade to Premium</Link>
                <Link href="/insights/preview" className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 px-5 py-2.5 text-xs font-medium text-slate-400 hover:bg-slate-900 transition-colors">Preview what Premium shows you</Link>
              </div>
              <p className="mt-3 text-center text-xs text-slate-700">Secure checkout via Stripe &middot; Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-950 py-12 sm:py-14">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">A few honest answers</h2>
          <div className="mt-6 space-y-5 sm:mt-7 sm:space-y-6">
            {[
              { q: "Is this therapy?", a: "No. Havenly is a journaling companion &mdash; it can sit alongside therapy, coaching, or your own personal practices, but it is not a clinical tool and can't replace professional support." },
              { q: "Do I have to write every day?", a: "Not at all. Some people check in a few times a week. Others only when life feels particularly full. The patterns Havenly notices get richer over time, but there's no pressure." },
              { q: "What happens to my journal entries?", a: "They're yours. Stored securely, never used to train AI models, never shared. Havenly is built around the idea that your inner life belongs to you &mdash; not the internet." },
              { q: "What makes Premium worth $30/month?", a: "Free gives you a private space to write and reflect. Premium gives you the full picture &mdash; what repeats across weeks and months, a personal weekly summary written just for you, and the hidden patterns you can't see from inside them." },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-slate-800/60 pb-5">
                <p className="text-[15px] font-medium text-white sm:text-base">{q}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500" dangerouslySetInnerHTML={{ __html: a }} />
              </div>
            ))}
          </div>
          <div className="mt-8 text-xs text-slate-700">
            <Link href="/privacy" className="text-emerald-600 hover:text-emerald-500 transition-colors">Read the Privacy Policy &rarr;</Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-slate-800/60 bg-slate-950 py-12 sm:py-14">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Your thoughts deserve a quieter place to land.</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm text-slate-500 sm:max-w-md">Start with a single entry. No pressure, no performance. Just write what's actually going on.</p>
          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Link href="/magic-login" className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-7 py-3.5 text-[15px] font-semibold text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-colors sm:py-3 sm:text-sm">
              Start for free &mdash; no card needed
            </Link>
            <Link href="/about" className="inline-flex items-center justify-center rounded-full border border-slate-700 px-7 py-3.5 text-[15px] font-medium text-slate-400 hover:bg-slate-900 transition-colors sm:py-3 sm:text-sm">
              Learn more about Havenly
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
