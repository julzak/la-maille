import { Page, View, Text } from "@react-pdf/renderer";
import { styles, colors } from "./styles";

interface FinishingPageProps {
  assemblySteps: string[];
  blockingTips: string[];
  careTips: string[];
  pageNumber: number;
  language: "fr" | "en";
}

export function FinishingPage({
  assemblySteps,
  blockingTips,
  careTips,
  pageNumber,
  language,
}: FinishingPageProps) {
  const texts = {
    fr: {
      title: "FINITIONS",
      subtitle: "Assemblage & Entretien",
      assembly: "ASSEMBLAGE",
      blocking: "BLOCAGE",
      care: "ENTRETIEN",
      shareTitle: "Partagez votre création !",
      shareText: "Nous adorons voir vos réalisations. Partagez votre tricot sur Instagram avec le hashtag #LaMaille et rejoignez notre communauté de créateurs.",
      disclaimer: "Ce patron est une ESTIMATION générée automatiquement. Vérifiez toujours vos calculs et faites un échantillon avant de commencer. La Maille ne peut être tenue responsable des erreurs de tricot.",
    },
    en: {
      title: "FINISHING",
      subtitle: "Assembly & Care",
      assembly: "ASSEMBLY",
      blocking: "BLOCKING",
      care: "CARE",
      shareTitle: "Share your creation!",
      shareText: "We love seeing your finished projects. Share your knitting on Instagram with the hashtag #LaMaille and join our community of makers.",
      disclaimer: "This pattern is an automatically generated ESTIMATE. Always verify your calculations and make a gauge swatch before starting. La Maille cannot be held responsible for knitting errors.",
    },
  };
  const t = texts[language];
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h3}>{t.title}</Text>
      <Text style={styles.h2}>{t.subtitle}</Text>
      <View style={styles.dividerAccent} />

      {/* 2 colonnes */}
      <View style={{ flexDirection: "row", gap: 16 }}>
        {/* Assemblage */}
        <View style={{ flex: 1 }}>
          <View style={styles.card}>
            <Text
              style={[styles.h3, { color: colors.primary, marginBottom: 10 }]}
            >
              {t.assembly}
            </Text>
            {assemblySteps.map((step, i) => (
              <View
                key={i}
                style={[styles.row, { marginBottom: 6, gap: 6, alignItems: "flex-start" }]}
              >
                <Text style={[styles.mono, { width: 18 }]}>{i + 1}.</Text>
                <Text style={[styles.body, { flex: 1 }]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Blocage & Entretien */}
        <View style={{ flex: 1 }}>
          <View style={styles.card}>
            <Text
              style={[styles.h3, { color: colors.primary, marginBottom: 10 }]}
            >
              {t.blocking}
            </Text>
            {blockingTips.map((tip, i) => (
              <Text key={i} style={[styles.body, { marginBottom: 3 }]}>
                • {tip}
              </Text>
            ))}
          </View>

          <View style={styles.card}>
            <Text
              style={[styles.h3, { color: colors.primary, marginBottom: 10 }]}
            >
              {t.care}
            </Text>
            {careTips.map((tip, i) => (
              <Text key={i} style={[styles.body, { marginBottom: 3 }]}>
                • {tip}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Section partage - Call to action */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.secondary,
            marginTop: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            padding: 20,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "white",
              fontSize: 14,
              fontWeight: "bold",
              marginBottom: 6,
            }}
          >
            {t.shareTitle}
          </Text>
          <Text
            style={{
              color: "white",
              fontSize: 9,
              opacity: 0.9,
              lineHeight: 1.5,
            }}
          >
            {t.shareText}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 6,
            padding: 10,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Courier",
              fontSize: 12,
              color: colors.secondary,
              fontWeight: "bold",
            }}
          >
            #LaMaille
          </Text>
        </View>
      </View>

      {/* Disclaimer */}
      <View
        style={{
          marginTop: 20,
          padding: 12,
          backgroundColor: "#FEF3E7",
          borderRadius: 6,
          borderLeftWidth: 3,
          borderLeftColor: colors.accent,
        }}
      >
        <Text style={[styles.bodySmall, { color: colors.accent, lineHeight: 1.5 }]}>
          {t.disclaimer}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>la-maille.vercel.app</Text>
        <Text style={styles.pageNumber}>{pageNumber}</Text>
      </View>
    </Page>
  );
}
