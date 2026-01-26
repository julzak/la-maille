import { Page, View, Text } from "@react-pdf/renderer";
import { styles, colors } from "./styles";

interface Step {
  number: number;
  title: string;
  instructions: string[];
  notes?: string;
}

interface InstructionPageProps {
  sectionTitle: string;
  sectionSubtitle: string;
  steps: Step[];
  dimensions?: { label: string; value: string }[];
  pageNumber: number;
  totalPieces?: number;
  pieceIndex?: number;
  language: "fr" | "en";
}

export function InstructionPage({
  sectionTitle,
  sectionSubtitle,
  steps,
  dimensions,
  pageNumber,
  totalPieces,
  pieceIndex,
  language,
}: InstructionPageProps) {
  const texts = {
    fr: {
      piece: "Pièce",
      dimensions: "DIMENSIONS",
    },
    en: {
      piece: "Piece",
      dimensions: "DIMENSIONS",
    },
  };
  const t = texts[language];
  return (
    <Page size="A4" style={styles.page}>
      {/* Header de section */}
      <View style={[styles.spaceBetween, { marginBottom: 8 }]}>
        <View>
          <Text style={styles.h3}>{sectionTitle}</Text>
          <Text style={styles.h2}>{sectionSubtitle}</Text>
        </View>
        {/* Badge étape */}
        {pieceIndex !== undefined && totalPieces && (
          <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
            <Text style={{ color: "white", fontSize: 9 }}>
              {t.piece} {pieceIndex + 1}/{totalPieces}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.dividerAccent} />

      {/* Contenu en 2 colonnes */}
      <View style={{ flexDirection: "row", gap: 20 }}>
        {/* Instructions */}
        <View style={{ flex: dimensions ? 1.3 : 1 }}>
          {steps.map((step, i) => (
            <View key={i} style={{ marginBottom: 14 }}>
              {/* Numéro et titre */}
              <View style={[styles.row, { marginBottom: 6, gap: 8 }]}>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: colors.foreground,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 9, fontWeight: "bold" }}
                  >
                    {step.number}
                  </Text>
                </View>
                <Text style={[styles.body, { fontWeight: "bold", flex: 1 }]}>
                  {step.title}
                </Text>
              </View>

              {/* Instructions détaillées */}
              <View style={{ marginLeft: 28 }}>
                {step.instructions.map((instr, j) => (
                  <Text key={j} style={[styles.body, { marginBottom: 3 }]}>
                    {instr}
                  </Text>
                ))}

                {/* Note technique */}
                {step.notes && (
                  <View
                    style={{
                      backgroundColor: "#F0F5F0",
                      borderLeftWidth: 3,
                      borderLeftColor: colors.secondary,
                      padding: 8,
                      marginTop: 6,
                      borderRadius: 2,
                    }}
                  >
                    <Text style={[styles.bodySmall, { color: colors.secondary }]}>
                      {step.notes}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Dimensions */}
        {dimensions && dimensions.length > 0 && (
          <View style={{ flex: 0.7 }}>
            <View style={[styles.card, { padding: 12 }]}>
              <Text
                style={[
                  styles.h3,
                  { marginBottom: 10, textAlign: "center", color: colors.primary },
                ]}
              >
                {t.dimensions}
              </Text>

              {dimensions.map((dim, i) => (
                <View key={i} style={[styles.spaceBetween, { marginBottom: 6 }]}>
                  <Text style={styles.bodySmall}>{dim.label}</Text>
                  <Text style={styles.mono}>{dim.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>la-maille.vercel.app</Text>
        <Text style={styles.pageNumber}>{pageNumber}</Text>
      </View>
    </Page>
  );
}
