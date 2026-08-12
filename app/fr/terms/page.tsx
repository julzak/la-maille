import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description:
    "Conditions d'utilisation de La Maille, le générateur de patrons de tricot par IA : droits d'usage et limitations.",
  alternates: {
    canonical: "https://la-maille.com/fr/terms",
    languages: {
      en: "https://la-maille.com/terms",
      fr: "https://la-maille.com/fr/terms",
      "x-default": "https://la-maille.com/terms",
    },
  },
};

export { default } from "../../terms/page";
