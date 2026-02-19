import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Metadata } from "next";
import { getArticleBySlug, getAllArticles } from "@/lib/blog-data";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.keywords,
    alternates: {
      canonical: `https://la-maille.com/blog/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
      url: `https://la-maille.com/blog/${article.slug}`,
    },
  };
}

// Simple markdown to HTML (handles ##, ###, **, *, -, [](), and paragraphs)
function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let inList = false;
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(" ");
      if (text.trim()) {
        elements.push(
          <p
            key={elements.length}
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
          key={elements.length}
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

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      if (inList) flushList();
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      if (inList) flushList();
      flushParagraph();
      elements.push(
        <h3
          key={elements.length}
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
          key={elements.length}
          className="font-serif text-2xl font-medium mt-10 mb-4"
        >
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith("- ")) {
      flushParagraph();
      inList = true;
      listItems.push(trimmed.slice(2));
    } else {
      if (inList) flushList();
      currentParagraph.push(trimmed);
    }
  }

  if (inList) flushList();
  flushParagraph();

  return elements;
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong class='text-foreground'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" class="text-primary hover:underline">$1</a>'
    );
}

export default function BlogArticlePage({ params }: Props) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  return (
    <div className="container mx-auto max-w-[700px] px-4 py-12 md:py-20">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        All articles
      </Link>

      {/* Header */}
      <header className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl mb-4 text-balance">
          {article.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>La Maille Team</span>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={article.publishedAt}>
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
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
        <h2 className="font-serif text-2xl mb-3">Ready to try it?</h2>
        <p className="text-muted-foreground mb-6">
          Upload a sweater photo and get your custom knitting pattern in
          minutes.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Try La Maille — it&apos;s free
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
