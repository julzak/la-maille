import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment La Maille traite vos données : collecte, utilisation et vos droits RGPD.",
  alternates: {
    canonical: "https://la-maille.com/fr/privacy",
    languages: {
      en: "https://la-maille.com/privacy",
      fr: "https://la-maille.com/fr/privacy",
      "x-default": "https://la-maille.com/privacy",
    },
  },
};

export { default } from "../../privacy/page";
