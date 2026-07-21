import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conseils & guides tricot",
  description:
    "Apprenez à transformer vos pulls préférés en patrons de tricot sur mesure. Conseils, guides et tutoriels de La Maille.",
  alternates: {
    canonical: "https://la-maille.com/fr/blog",
  },
};

// Listing FR (/fr/blog) : même composant serveur que /blog, qui filtre les
// articles et préfixe les liens selon la locale d'URL.
export { default } from "../../blog/page";
