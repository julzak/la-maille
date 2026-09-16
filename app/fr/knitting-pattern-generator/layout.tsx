// FAQPage FR : memes questions/reponses (mot pour mot) que les cles
// generator.faqNQ/faqNA dans lib/i18n.ts (translations.fr) et que le
// JSON-LD EN de app/knitting-pattern-generator/layout.tsx.
//
// Ces textes ne sont pas importes depuis lib/i18n.ts : ce module appelle
// createContext au niveau racine (pour le store de langue client), ce qui
// interdit tout import depuis un Server Component comme ce layout ("You're
// importing a component that needs createContext"). D'ou la duplication
// volontaire ci-dessous plutot qu'un import.
export default function KnittingPatternGeneratorFrLayout({
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
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Comment fonctionne le générateur de patron de tricot par IA ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Uploadez la photo d'un vêtement tricoté. Notre IA analyse la construction, le point utilisé et les proportions, puis génère un patron de tricot complet avec des instructions rang par rang adaptées à votre échantillon et à vos mesures.",
                },
              },
              {
                "@type": "Question",
                name: "Le générateur de patron de tricot est-il gratuit ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Oui, La Maille est gratuit. Vous pouvez uploader des photos et générer des patrons de tricot sur-mesure sans frais.",
                },
              },
              {
                "@type": "Question",
                name: "Pour quels types de vêtements puis-je générer un patron ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "La Maille fonctionne mieux avec des pulls basiques, cardigans et gilets. Il gère le jersey, les côtes et le point mousse. La dentelle complexe et le jacquard ne sont pas encore pris en charge.",
                },
              },
              {
                "@type": "Question",
                name: "Dois-je connaître mon échantillon ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Oui, vous avez besoin de votre échantillon de tension (mailles et rangs pour 10 cm) pour obtenir un patron précis. Tricotez toujours un échantillon avec la laine et les aiguilles que vous comptez utiliser.",
                },
              },
              {
                "@type": "Question",
                name: "Les patrons générés sont-ils testés ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Les patrons sont des estimations générées par IA à partir de l'analyse de l'image. Ils constituent une bonne base de travail mais peuvent nécessiter des ajustements. Nous recommandons de vérifier les calculs et de toujours tricoter un échantillon.",
                },
              },
              {
                "@type": "Question",
                name: "Quelle photo fonctionne le mieux pour générer un patron ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Une photo de face bien éclairée fonctionne le mieux. Posez le vêtement à plat ou photographiez-le sur un cintre. Évitez les angles, les plis et les arrière-plans chargés. Plus la photo est nette, meilleure est l'analyse.",
                },
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
