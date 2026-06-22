import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Metadata } from "next";
import { getArticleBySlug, getAllArticles, articleLang } from "@/lib/blog-data";
import type { Language } from "@/lib/i18n/detect";

interface Props {
  params: { slug: string };
}

const chrome: Record<
  Language,
  {
    back: string;
    related: string;
    byline: string;
    ctaTitle: string;
    ctaText: string;
    ctaButton: string;
    locale: string;
  }
> = {
  fr: {
    back: "Tous les articles",
    related: "Articles similaires",
    byline: "Dominique de La Maille",
    ctaTitle: "Envie d'essayer ?",
    ctaText:
      "Importez la photo d'un pull et obtenez votre patron de tricot sur mesure en quelques minutes.",
    ctaButton: "Essayer La Maille, c'est gratuit",
    locale: "fr-FR",
  },
  en: {
    back: "All articles",
    related: "Related articles",
    byline: "Dominique from La Maille",
    ctaTitle: "Ready to try it?",
    ctaText:
      "Upload a sweater photo and get your custom knitting pattern in minutes.",
    ctaButton: "Try La Maille, it's free",
    locale: "en-US",
  },
};

export async function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  if (!article) return {};

  const lang = articleLang(article);
  const base = "https://la-maille.com/blog";

  // hreflang only when a translated counterpart exists.
  const languages = article.translationSlug
    ? {
        en: `${base}/${lang === "en" ? article.slug : article.translationSlug}`,
        fr: `${base}/${lang === "fr" ? article.slug : article.translationSlug}`,
        "x-default": `${base}/${lang === "en" ? article.slug : article.translationSlug}`,
      }
    : undefined;

  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.keywords,
    alternates: {
      canonical: `${base}/${article.slug}`,
      ...(languages ? { languages } : {}),
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
      url: `https://la-maille.com/blog/${article.slug}`,
      images: [{ url: "https://la-maille.com/og-image.png", width: 1200, height: 630 }],
    },
  };
}

// Simple markdown to HTML (handles ##, ###, **, *, -, [](), and paragraphs)
function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let keyCounter = 0;
  let currentParagraph: string[] = [];
  let inList = false;
  let listItems: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHasHeader = false;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(" ");
      if (text.trim()) {
        elements.push(
          <p
            key={keyCounter++}
            className="text-muted-foreground leading-relaxed mb-4"
            dangerouslySetInnerHTML={{ __html: formatInline(text) }}
          />
        );
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={keyCounter++}
          className="list-disc pl-6 mb-4 space-y-1 text-muted-foreground"
        >
          {listItems.map((item, i) => (
            <li
              key={i}
              dangerouslySetInnerHTML={{ __html: formatInline(item) }}
            />
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      const headerRow = tableHasHeader ? tableRows[0] : null;
      const bodyRows = tableHasHeader ? tableRows.slice(1) : tableRows;
      elements.push(
        <div key={keyCounter++} className="overflow-x-auto mb-6 mt-4">
          <table className="w-full text-sm border-collapse">
            {headerRow && (
              <thead>
                <tr className="border-b border-border">
                  {headerRow.map((cell, i) => (
                    <th
                      key={i}
                      className="text-left py-2 px-3 font-medium text-foreground"
                      dangerouslySetInnerHTML={{ __html: formatInline(cell) }}
                    />
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {bodyRows.map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="py-2 px-3 text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: formatInline(cell) }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
      tableHasHeader = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      if (inTable) flushTable();
      if (inList) flushList();
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      if (inList) flushList();
      flushParagraph();
      elements.push(
        <h3
          key={keyCounter++}
          className="font-serif text-lg font-medium mt-8 mb-3"
        >
          {trimmed.slice(4)}
        </h3>
      );
    } else if (trimmed.startsWith("## ")) {
      if (inList) flushList();
      flushParagraph();
      elements.push(
        <h2
          key={keyCounter++}
          className="font-serif text-2xl font-medium mt-10 mb-4"
        >
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith("- ")) {
      flushParagraph();
      inList = true;
      listItems.push(trimmed.slice(2));
    } else if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (inList) flushList();
      flushParagraph();
      // Separator row (|---|---|)
      if (trimmed.match(/^\|[\s\-:|]+\|$/)) {
        tableHasHeader = tableRows.length === 1;
      } else {
        const cells = trimmed.slice(1, -1).split("|").map((c) => c.trim());
        tableRows.push(cells);
      }
      inTable = true;
    } else if (trimmed.match(/^!\[.*\]\(.*\)$/)) {
      if (inList) flushList();
      flushParagraph();
      const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (match) {
        const [, alt, src] = match;
        elements.push(
          <figure key={keyCounter++} className="my-8">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg">
              <Image
                src={src}
                alt={alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 700px"
                loading="lazy"
              />
            </div>
          </figure>
        );
      }
    } else {
      if (inList) flushList();
      currentParagraph.push(trimmed);
    }
  }

  if (inTable) flushTable();
  if (inList) flushList();
  flushParagraph();

  return elements;
}

function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url, "https://la-maille.com");
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.href;
    }
    return "#";
  } catch {
    return "#";
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong class='text-foreground'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      (_, label, url) =>
        `<a href="${sanitizeUrl(url)}" class="text-primary hover:underline">${label}</a>`
    );
}

function getRelatedArticles(currentSlug: string, count = 3) {
  const current = getArticleBySlug(currentSlug);
  if (!current) return [];
  // Only suggest articles in the same language.
  const all = getAllArticles(articleLang(current)).filter(
    (a) => a.slug !== currentSlug
  );
  // Score by keyword overlap
  const scored = all.map((a) => {
    const overlap = a.keywords.filter((k) =>
      current.keywords.some(
        (ck) => ck.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(ck.toLowerCase())
      )
    ).length;
    return { article: a, score: overlap };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((s) => s.article);
}

export default function BlogArticlePage({ params }: Props) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  const relatedArticles = getRelatedArticles(params.slug);
  const lang = articleLang(article);
  const c = chrome[lang];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    inLanguage: lang,
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@type": "Person",
      name: c.byline,
    },
    publisher: {
      "@type": "Organization",
      name: "La Maille",
      url: "https://la-maille.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://la-maille.com/blog/${article.slug}`,
    },
    image: "https://la-maille.com/og-image.png",
    keywords: article.keywords.join(", "),
  };

  return (
    <div lang={lang} className="container mx-auto max-w-[700px] px-4 py-12 md:py-20">
      {/* Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        {c.back}
      </Link>

      {/* Header */}
      <header className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl mb-4 text-balance">
          {article.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{c.byline}</span>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={article.publishedAt}>
            {new Date(article.publishedAt).toLocaleDateString(c.locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span aria-hidden="true">&middot;</span>
          <span>{article.readingTime}</span>
        </div>
      </header>

      {/* Content */}
      <article className="prose-custom">{renderMarkdown(article.content)}</article>

      {/* CTA */}
      <section className="mt-16 p-8 bg-primary/5 rounded-xl border border-primary/20 text-center">
        <h2 className="font-serif text-2xl mb-3">{c.ctaTitle}</h2>
        <p className="text-muted-foreground mb-6">{c.ctaText}</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {c.ctaButton}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl mb-6">{c.related}</h2>
          <div className="grid gap-4">
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group block p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <h3 className="font-medium group-hover:text-primary transition-colors mb-1">
                  {related.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {related.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
