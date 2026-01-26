import { Page, View, Text } from "@react-pdf/renderer";
import { styles, colors } from "./styles";

interface MaterialsPageProps {
  yarn: {
    weight: string;
    estimatedMeters: string;
    composition?: string;
  };
  needles: string;
  gauge: {
    stitches: number;
    rows: number;
  };
  accessories: string[];
  abbreviations: { abbr: string; meaning: string }[];
}

export function MaterialsPage({
  yarn,
  needles,
  gauge,
  accessories,
  abbreviations,
}: MaterialsPageProps) {
  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <Text style={styles.h3}>MATÉRIEL</Text>
      <Text style={styles.h2}>Ce dont vous aurez besoin</Text>
      <View style={styles.dividerAccent} />

      {/* Grille 2 colonnes */}
      <View style={{ flexDirection: "row", gap: 16 }}>
        {/* Colonne gauche */}
        <View style={{ flex: 1 }}>
          {/* Fil */}
          <View style={styles.card}>
            <Text style={[styles.h3, { color: colors.primary, marginBottom: 8 }]}>
              FIL
            </Text>
            <Text style={[styles.body, { fontWeight: "bold", marginBottom: 4 }]}>
              {yarn.weight}
            </Text>
            <Text style={styles.body}>{yarn.estimatedMeters}</Text>
            {yarn.composition && (
              <Text style={[styles.bodySmall, { marginTop: 4 }]}>
                {yarn.composition}
              </Text>
            )}
          </View>

          {/* Aiguilles */}
          <View style={styles.card}>
            <Text style={[styles.h3, { color: colors.primary, marginBottom: 8 }]}>
              AIGUILLES
            </Text>
            <Text style={styles.body}>{needles}</Text>
          </View>

          {/* Accessoires */}
          <View style={styles.card}>
            <Text style={[styles.h3, { color: colors.primary, marginBottom: 8 }]}>
              ACCESSOIRES
            </Text>
            {accessories.map((a, i) => (
              <Text key={i} style={[styles.body, { marginBottom: 2 }]}>
                • {a}
              </Text>
            ))}
          </View>
        </View>

        {/* Colonne droite */}
        <View style={{ flex: 1 }}>
          {/* Échantillon - Mise en avant */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.primary, padding: 20 },
            ]}
          >
            <Text style={{ color: "white", fontSize: 11, fontWeight: "bold", marginBottom: 8 }}>
              ÉCHANTILLON ESSENTIEL
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: 9,
                marginBottom: 12,
                lineHeight: 1.5,
              }}
            >
              L&apos;échantillon détermine toutes les dimensions. Sans lui, votre
              patron sera faux.
            </Text>

            {/* Carré visuel */}
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 6,
                padding: 12,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 70,
                  height: 70,
                  borderWidth: 2,
                  borderColor: colors.foreground,
                  borderStyle: "dashed",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontFamily: "Courier", fontSize: 12 }}>
                  10 cm
                </Text>
              </View>
              <View style={{ marginTop: 10, alignItems: "center" }}>
                <Text style={[styles.mono, { marginBottom: 4 }]}>
                  {gauge.stitches} mailles
                </Text>
                <Text style={styles.mono}>{gauge.rows} rangs</Text>
              </View>
            </View>
          </View>

          {/* Abréviations */}
          <View style={styles.card}>
            <Text style={[styles.h3, { color: colors.primary, marginBottom: 8 }]}>
              ABRÉVIATIONS
            </Text>
            {abbreviations.map((a, i) => (
              <View
                key={i}
                style={[styles.row, { gap: 8, marginBottom: 3 }]}
              >
                <Text style={[styles.mono, { width: 35 }]}>{a.abbr}</Text>
                <Text style={styles.bodySmall}>{a.meaning}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>la-maille.vercel.app</Text>
        <Text style={styles.pageNumber}>2</Text>
      </View>
    </Page>
  );
}
