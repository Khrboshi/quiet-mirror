/**
 * app/blog/[slug]/page.tsx
 *
 * Individual blog article page — statically generated from articles.ts.
 * Returns 404 for unknown slugs via notFound().
 */
import Link from "next/link";
import type { Metadata } from "next";
import { ARTICLES, getArticle } from "../articles";
import EmailCapture from "@/app/components/EmailCapture";
import { CONFIG } from "@/app/lib/config";
import { PRICING } from "@/app/lib/pricing";
import { getRequestTranslations } from "@/app/lib/i18n/server";

const SITE_URL = CONFIG.siteUrl;

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article not found" };

  // JSON-LD structured data for Google rich results.
  // Rendered via Next.js metadata.other — no dangerouslySetInnerHTML needed.
  // Next.js serializes and escapes the value server-side.
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
    other: {
      "script:ld+json": JSON.stringify(jsonLd),
    },
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  const t = await getRequestTranslations();

  if (!article) {
    return (
      <main className="min-h-screen bg-qm-bg text-qm-primary">
        <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 pt-24 text-center">
          <p className="text-sm text-qm-muted">{t.blogPage.articleNotFound}</p>
          <Link
            href="/blog"
            className="mt-4 text-sm text-qm-accent hover:text-qm-accent-hover"
          >
            {t.legalPagesCta.backToArticles}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-qm-bg text-qm-primary">
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-24">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-qm-accent">
          {article.category}
        </p>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight">
          {article.title}
        </h1>
        <p className="mt-2 text-xs text-qm-muted">
          {article.minutes} min read
        </p>

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-qm-secondary">
          {article.body.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-qm-border-card bg-qm-card p-5 text-sm">
          <p className="font-semibold text-qm-primary">
            {t.legalPagesCta.blogCtaHeading}
          </p>
          <p className="mt-2 text-xs text-qm-secondary">
            {t.legalPagesCta.blogCtaBody}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <Link
              href="/upgrade"
              className="rounded-full bg-qm-accent px-4 py-2 font-semibold text-white hover:bg-qm-accent-hover"
            >
              {t.legalPagesCta.seePremiumBlog}
            </Link>
            <Link
              href="/magic-login"
              className="rounded-full border border-qm-border-subtle px-4 py-2 font-semibold text-qm-primary hover:bg-qm-soft"
            >
              {t.legalPagesCta.startFreeLabel}
            </Link>
          </div>
          <p className="mt-3 text-[11px] text-qm-faint">{t.legalPagesCta.refundNote(PRICING.trialDays)}</p>
        </div>

        <EmailCapture source={`blog-article-${article.slug}`} variant="article-inline" />

        <div className="mt-6 border-t border-qm-border-subtle pt-6 text-center text-xs text-qm-muted">
          <Link
            href="/blog"
            className="text-qm-accent hover:text-qm-accent-hover"
          >
            {t.legalPagesCta.backToArticles}
          </Link>
        </div>
      </section>
    </main>
  );
}
