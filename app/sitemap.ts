import { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/blog-data";
import { createAnonClient } from "@/lib/public-patterns";

// Les pages patrons publiques evoluent avec les publications des
// utilisateurs : le sitemap est regenere au plus toutes les heures.
export const revalidate = 3600;

/**
 * Slugs des patrons publics (BRIEF-03), via le client Supabase anonyme
 * (la RLS ne laisse sortir que is_public = true). Si la requete echoue
 * (migration non appliquee, DB indisponible), le sitemap rend le reste
 * sans crasher.
 */
async function getPublicPatternEntries(
  baseUrl: string
): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = createAnonClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("saved_patterns")
      .select("public_slug, updated_at")
      .eq("is_public", true)
      .not("public_slug", "is", null)
      .order("updated_at", { ascending: false })
      .limit(1000);

    if (error || !data) return [];

    return data.map((row) => ({
      url: `${baseUrl}/patron/p/${row.public_slug}`,
      lastModified: new Date(row.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://la-maille.com";

  const publicPatternEntries = await getPublicPatternEntries(baseUrl);

  return [
    {
      url: `${baseUrl}/`,
      alternates: {
        languages: {
          en: `${baseUrl}/`,
          fr: `${baseUrl}/fr`,
          "x-default": `${baseUrl}/`,
        },
      },
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/knitting-pattern-generator`,
      alternates: {
        languages: {
          en: `${baseUrl}/knitting-pattern-generator`,
          fr: `${baseUrl}/fr/knitting-pattern-generator`,
          "x-default": `${baseUrl}/knitting-pattern-generator`,
        },
      },
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/how-it-works`,
      alternates: {
        languages: {
          en: `${baseUrl}/how-it-works`,
          fr: `${baseUrl}/fr/how-it-works`,
          "x-default": `${baseUrl}/how-it-works`,
        },
      },
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      alternates: {
        languages: {
          en: `${baseUrl}/blog`,
          fr: `${baseUrl}/fr/blog`,
          "x-default": `${baseUrl}/blog`,
        },
      },
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...getAllArticles("en").map((article) => ({
      url: `${baseUrl}/blog/${article.slug}`,
      ...(article.translationSlug
        ? {
            alternates: {
              languages: {
                en: `${baseUrl}/blog/${article.slug}`,
                fr: `${baseUrl}/fr/blog/${article.translationSlug}`,
                "x-default": `${baseUrl}/blog/${article.slug}`,
              },
            },
          }
        : {}),
      lastModified: new Date(article.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${baseUrl}/fr/knitting-pattern-generator`,
      alternates: {
        languages: {
          en: `${baseUrl}/knitting-pattern-generator`,
          fr: `${baseUrl}/fr/knitting-pattern-generator`,
          "x-default": `${baseUrl}/knitting-pattern-generator`,
        },
      },
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/fr/how-it-works`,
      alternates: {
        languages: {
          en: `${baseUrl}/how-it-works`,
          fr: `${baseUrl}/fr/how-it-works`,
          "x-default": `${baseUrl}/how-it-works`,
        },
      },
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/fr`,
      alternates: {
        languages: {
          en: `${baseUrl}/`,
          fr: `${baseUrl}/fr`,
          "x-default": `${baseUrl}/`,
        },
      },
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/fr/blog`,
      alternates: {
        languages: {
          en: `${baseUrl}/blog`,
          fr: `${baseUrl}/fr/blog`,
          "x-default": `${baseUrl}/blog`,
        },
      },
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...getAllArticles("fr").map((article) => ({
      url: `${baseUrl}/fr/blog/${article.slug}`,
      ...(article.translationSlug
        ? {
            alternates: {
              languages: {
                en: `${baseUrl}/blog/${article.translationSlug}`,
                fr: `${baseUrl}/fr/blog/${article.slug}`,
                "x-default": `${baseUrl}/blog/${article.translationSlug}`,
              },
            },
          }
        : {}),
      lastModified: new Date(article.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...publicPatternEntries,
    {
      url: `${baseUrl}/privacy`,
      alternates: {
        languages: {
          en: `${baseUrl}/privacy`,
          fr: `${baseUrl}/fr/privacy`,
          "x-default": `${baseUrl}/privacy`,
        },
      },
      lastModified: new Date("2026-02-02"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      alternates: {
        languages: {
          en: `${baseUrl}/terms`,
          fr: `${baseUrl}/fr/terms`,
          "x-default": `${baseUrl}/terms`,
        },
      },
      lastModified: new Date("2026-02-02"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/fr/privacy`,
      alternates: {
        languages: {
          en: `${baseUrl}/privacy`,
          fr: `${baseUrl}/fr/privacy`,
          "x-default": `${baseUrl}/privacy`,
        },
      },
      lastModified: new Date("2026-02-02"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/fr/terms`,
      alternates: {
        languages: {
          en: `${baseUrl}/terms`,
          fr: `${baseUrl}/fr/terms`,
          "x-default": `${baseUrl}/terms`,
        },
      },
      lastModified: new Date("2026-02-02"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
