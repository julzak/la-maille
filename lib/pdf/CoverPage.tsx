import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, colors } from "./styles";

interface CoverPageProps {
  garmentType: string;
  imageUrl?: string;
  difficulty: "Débutant" | "Intermédiaire" | "Avancé";
  estimatedTime: string;
  size: string;
  createdAt: string;
}

export function CoverPage({
  garmentType,
  imageUrl,
  difficulty,
  estimatedTime,
  size,
  createdAt,
}: CoverPageProps) {
  return (
    <Page size="A4" style={[styles.page, { padding: 0 }]}>
      {/* Image principale - 50% de la page */}
      {imageUrl && (
        <View style={{ height: "45%", overflow: "hidden" }}>
          <Image
            src={imageUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </View>
      )}

      {/* Contenu */}
      <View style={{ padding: 40, flex: 1 }}>
        {/* Logo texte */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", letterSpacing: 2 }}>
            LA MAILLE
          </Text>
          <Text style={{ fontSize: 9, color: colors.muted }}>
            your French knitting studio
          </Text>
        </View>

        {/* Titre */}
        <Text style={[styles.h1, { fontSize: 32, marginBottom: 4 }]}>
          {garmentType}
        </Text>
        <Text style={[styles.bodySmall, { marginBottom: 20 }]}>
          Patron sur-mesure généré par La Maille
        </Text>

        {/* Badges infos */}
        <View style={[styles.row, { gap: 8, marginBottom: 20 }]}>
          <View style={styles.badge}>
            <Text style={{ color: "white", fontSize: 9 }}>{difficulty}</Text>
          </View>
          <View style={styles.badgeOutline}>
            <Text style={{ fontSize: 9 }}>{estimatedTime}</Text>
          </View>
          <View style={styles.badgeOutline}>
            <Text style={{ fontSize: 9 }}>Taille {size}</Text>
          </View>
        </View>

        {/* Message de bienvenue */}
        <View
          style={[
            styles.card,
            { backgroundColor: "#F5F2ED", padding: 16, marginTop: 8 },
          ]}
        >
          <Text style={[styles.body, { fontStyle: "italic", lineHeight: 1.7 }]}>
            &quot;Bienvenue dans votre atelier numérique. Ce patron a été créé
            spécialement pour vous, à partir de votre photo et de vos mesures.
            Prenez le temps de lire les instructions, faites confiance à vos
            mains, et surtout... profitez du voyage.&quot;
          </Text>
          <Text
            style={[styles.bodySmall, { marginTop: 8, textAlign: "right" }]}
          >
            — L&apos;équipe La Maille
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View
        style={{
          position: "absolute",
          bottom: 20,
          left: 40,
          right: 40,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={styles.footerText}>la-maille.vercel.app</Text>
        <Text style={styles.footerText}>Créé le {createdAt}</Text>
      </View>
    </Page>
  );
}
