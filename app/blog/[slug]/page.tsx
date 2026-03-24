import Link from "next/link";
import type { Metadata } from "next";
import { ARTICLES, getArticle } from "../articles";
import EmailCapture from "@/app/components/EmailCapture";
import { CONFIG } from "@/app/lib/config";
import { PRICING } from "@/app/lib/pricing";

const SITE_URL = CONFIG.siteUrl;

type BlogArticlePageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: BlogArticlePageProps): Metadata {
  const article = getArticle(params.slug);
  if (!article) return { title: "Article not found" };

  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      url: `${SITE_URL}/blog/${article.slug}`,
      siteName: CONFIG.appName,
    },
    twitter: {
      card: "summary",
      title: article.title,
      description: article.summary,
    },
  };
}

export default function BlogArticlePage({ params }: BlogArticlePageProps) {
  const article = getArticle(params.slug);

  if (!article) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 pt-24 text-center">
          <p className="text-sm text-slate-400">Article not found.</p>
          <Link
            href="/blog"
            className="mt-4 text-sm text-emerald-300 hover:text-emerald-200"
          >
            ← Back to all articles
          </Link>
        </section>
      </main>
    );
  }

  // JSON-LD structured data for Google rich results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    url: `${SITE_URL}/blog/${article.slug}`,
    publisher: {
      "@type": "Organization",
      name: CONFIG.appName,
      url: SITE_URL,
    },
    articleSection: article.category,
    timeRequired: `PT${article.minutes}M`,
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-24">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-emerald-300">
          {article.category}
        </p>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight">
          {article.title}
        </h1>
        <p className="mt-2 text-xs text-slate-400">
          {article.minutes} min read
        </p>

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-200">
          {article.body.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-sm">
          <p className="font-semibold text-slate-100">
            Want to see what keeps returning?
          </p>
          <p className="mt-2 text-xs text-slate-300">
            Premium reads across your entries over time and shows you what
            quietly repeats — the emotions, themes, and patterns you
            couldn&apos;t see from inside them.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <Link
              href="/upgrade"
              className="rounded-full bg-emerald-400 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-300"
            >
              See Premium benefits →
            </Link>
            <Link
              href="/magic-login"
              className="rounded-full border border-slate-700 px-4 py-2 font-semibold text-slate-100 hover:border-slate-500 hover:bg-slate-900"
            >
              Start free journaling
            </Link>
          </div>
          <p className="mt-3 text-[11px] text-slate-600">🛡️ {PRICING.trialDays}-day full refund on Premium · Cancel anytime</p>
        </div>

        <EmailCapture source={`blog-article-${article.slug}`} variant="article-inline" />

        <div className="mt-6 border-t border-slate-800 pt-6 text-center text-xs text-slate-400">
          <Link
            href="/blog"
            className="text-emerald-300 hover:text-emerald-200"
          >
            ← Back to all articles
          </Link>
        </div>
      </section>
    </main>
  );
}
