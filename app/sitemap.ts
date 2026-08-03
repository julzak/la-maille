import { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/blog-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://la-maille.com";

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
    {
      url: `${baseUrl}/photo-to-knitting-pattern`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...getAllArticles("en").map((article) => ({
      url: `${baseUrl}/blog/${article.slug}`,
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
      lastModified: new Date(article.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date("2026-02-02"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date("2026-02-02"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
