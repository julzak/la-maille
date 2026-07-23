import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Générateur de patron de tricot par IA | De la photo au patron",
  description:
    "Transformez la photo d'un pull ou d'un cardigan en patron de tricot sur-mesure. Instructions rang par rang adaptées à votre échantillon. Gratuit.",
  alternates: {
    canonical: "https://la-maille.com/fr/knitting-pattern-generator",
    languages: {
      en: "https://la-maille.com/knitting-pattern-generator",
      fr: "https://la-maille.com/fr/knitting-pattern-generator",
      "x-default": "https://la-maille.com/knitting-pattern-generator",
    },
  },
};

export { default } from "../../knitting-pattern-generator/page";
