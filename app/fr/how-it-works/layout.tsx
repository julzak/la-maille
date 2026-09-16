// HowTo FR : le titre et les intitules d'etape reprennent mot pour mot les
// cles howItWorks.heroTitle / step1Title / step3Title / step4Title de
// lib/i18n.ts (translations.fr, memes libelles que sur la page). Le reste
// du schema (description, outils, texte detaille des etapes) n'a pas
// d'equivalent visible sur la page et est traduit directement ici.
//
// Ces textes ne sont pas importes depuis lib/i18n.ts : ce module appelle
// createContext au niveau racine (pour le store de langue client), ce qui
// interdit tout import depuis un Server Component comme ce layout ("You're
// importing a component that needs createContext"). D'ou la duplication
// volontaire ci-dessous plutot qu'un import.
export default function HowItWorksFrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "Comment créer un patron de tricot à partir de n'importe quelle photo",
            description:
              "Transformez la photo d'un vêtement tricoté en patron sur-mesure avec des instructions rang par rang, grâce au générateur de patron de tricot par IA de La Maille.",
            totalTime: "PT5M",
            tool: [
              { "@type": "HowToTool", name: "Une photo d'un vêtement tricoté" },
              { "@type": "HowToTool", name: "Vos mensurations" },
              { "@type": "HowToTool", name: "Votre échantillon de tricot" },
            ],
            step: [
              {
                "@type": "HowToStep",
                position: 1,
                name: "Uploadez votre photo",
                text: "Prenez ou uploadez une photo nette et bien éclairée, de face, du vêtement tricoté que vous voulez recréer. Posez-le à plat ou photographiez-le sur un cintre pour un meilleur résultat.",
              },
              {
                "@type": "HowToStep",
                position: 2,
                name: "L'IA analyse le vêtement",
                text: "L'IA de La Maille lit votre photo et identifie le type de vêtement, la méthode de construction, le point utilisé, l'encolure, le style de manches et les proportions.",
              },
              {
                "@type": "HowToStep",
                position: 3,
                name: "Entrez vos mesures et votre échantillon",
                text: "Indiquez votre tour de poitrine, la longueur souhaitée et votre échantillon de tricot (mailles et rangs pour 10 cm). Cela garantit que le patron vous ira parfaitement.",
              },
              {
                "@type": "HowToStep",
                position: 4,
                name: "Recevez votre patron sur-mesure",
                text: "Recevez un patron de tricot complet avec des instructions rang par rang, adapté à vos mesures et à votre échantillon. Imprimez-le ou sauvegardez-le dans votre compte.",
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
