import { permanentRedirect } from "next/navigation";
import { Metadata } from "next";
import { getArticleBySlug, getAllArticles, articleLang, articleMeta } from "@/lib/blog-data";
import { BlogArticleView } from "@/components/BlogArticleView";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllArticles("en").map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  // Les slugs FR redirigent vers /fr/blog/[slug] : pas de metadata ici.
  if (!article || articleLang(article) === "fr") return {};

  // hreflang only when a translated counterpart exists.
  const languages = article.translationSlug
    ? {
        en: `https://la-maille.com/blog/${article.slug}`,
        fr: `https://la-maille.com/fr/blog/${article.translationSlug}`,
        "x-default": `https://la-maille.com/blog/${article.slug}`,
      }
    : undefined;

  const meta = articleMeta(article);

  return {
    title: meta.title,
    description: meta.description,
    keywords: article.keywords,
    alternates: {
      canonical: `https://la-maille.com/blog/${article.slug}`,
      ...(languages ? { languages } : {}),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "article",
      publishedTime: article.publishedAt,
      url: `https://la-maille.com/blog/${article.slug}`,
      images: [{ url: "https://la-maille.com/og-image.png", width: 1200, height: 630 }],
    },
  };
}

export default function BlogArticlePage({ params }: Props) {
  const article = getArticleBySlug(params.slug);
  // Un article FR accédé à la racine vit désormais sous /fr/blog : redirection
  // permanente (seul cas de redirection d'URL autorisé par le chantier i18n).
  if (article && articleLang(article) === "fr") {
    permanentRedirect(`/fr/blog/${article.slug}`);
  }

  return <BlogArticleView slug={params.slug} />;
}
