import { permanentRedirect } from "next/navigation";
import { Metadata } from "next";
import { getArticleBySlug, getAllArticles, articleLang, articleMeta } from "@/lib/blog-data";
import { BlogArticleView } from "@/components/BlogArticleView";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllArticles("fr").map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  // Les slugs EN redirigent vers /blog/[slug] : pas de metadata ici.
  if (!article || articleLang(article) === "en") return {};

  // hreflang only when a translated counterpart exists.
  const languages = article.translationSlug
    ? {
        en: `https://la-maille.com/blog/${article.translationSlug}`,
        fr: `https://la-maille.com/fr/blog/${article.slug}`,
        "x-default": `https://la-maille.com/blog/${article.translationSlug}`,
      }
    : undefined;

  const meta = articleMeta(article);

  return {
    title: meta.title,
    description: meta.description,
    keywords: article.keywords,
    alternates: {
      canonical: `https://la-maille.com/fr/blog/${article.slug}`,
      ...(languages ? { languages } : {}),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "article",
      publishedTime: article.publishedAt,
      url: `https://la-maille.com/fr/blog/${article.slug}`,
      images: [{ url: "https://la-maille.com/og-image.png", width: 1200, height: 630 }],
    },
  };
}

export default function BlogArticleFrPage({ params }: Props) {
  const article = getArticleBySlug(params.slug);
  // Un article EN accédé sous /fr/blog vit à la racine : redirection permanente.
  if (article && articleLang(article) === "en") {
    permanentRedirect(`/blog/${article.slug}`);
  }

  return <BlogArticleView slug={params.slug} />;
}
