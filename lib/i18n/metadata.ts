import type { Language } from "./detect";

export interface SeoMetadata {
  title: string;
  titleTemplate: string;
  description: string;
  ogLocale: string;
  ogAlt: string;
  keywords: string[];
  siteName: string;
  twitterDescription: string;
  applicationDescription: string;
}

export const seoMetadata: Record<Language, SeoMetadata> = {
  fr: {
    title: "Générateur de patron de tricot à partir d'une photo | La Maille",
    titleTemplate: "%s | La Maille",
    description:
      "Uploadez une photo de pull ou de cardigan et obtenez un patron de tricot sur-mesure avec instructions rang par rang. Générateur IA gratuit.",
    twitterDescription:
      "Uploadez une photo de pull ou de cardigan et obtenez un patron de tricot sur-mesure. Générateur IA gratuit.",
    applicationDescription:
      "Uploadez une photo de pull ou de cardigan et obtenez un patron de tricot sur-mesure avec instructions rang par rang.",
    ogLocale: "fr_FR",
    ogAlt: "La Maille — Générateur de patron de tricot à partir d'une photo",
    keywords: [
      "générateur patron tricot",
      "patron tricot photo",
      "patron pull personnalisé",
      "patron cardigan",
      "tricot IA",
      "patron sur-mesure tricot",
      "créer patron tricot",
    ],
    siteName: "La Maille",
  },
  en: {
    title: "Photo to Knitting Pattern Generator | La Maille",
    titleTemplate: "%s | La Maille",
    description:
      "Upload any sweater or cardigan photo and get a custom knitting pattern with row-by-row instructions. Free AI-powered pattern generator.",
    twitterDescription:
      "Upload any sweater or cardigan photo and get a custom knitting pattern. Free AI-powered generator.",
    applicationDescription:
      "Upload any sweater or cardigan photo and get a custom knitting pattern with row-by-row instructions.",
    ogLocale: "en_US",
    ogAlt: "La Maille - Photo to Knitting Pattern Generator",
    keywords: [
      "knitting pattern generator",
      "photo to knitting pattern",
      "custom knitting pattern",
      "sweater pattern",
      "cardigan pattern",
      "AI knitting",
      "knit pattern from photo",
    ],
    siteName: "La Maille",
  },
};
