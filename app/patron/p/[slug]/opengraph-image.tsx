import { ImageResponse } from "next/og";
import {
  buildPublicTitle,
  detectPatternLanguage,
  fetchPublicPattern,
} from "@/lib/public-patterns";
import {
  publicGarmentLabels,
  publicPatternStrings,
} from "@/lib/i18n/public-pattern";

// OG image generee dynamiquement via ImageResponse (aucune API image
// externe). Dynamique comme la page : suit l'etat de publication.
export const dynamic = "force-dynamic";

export const alt = "La Maille - Patron de tricot";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface OgProps {
  params: { slug: string };
}

export default async function Image({ params }: OgProps) {
  const row = await fetchPublicPattern(params.slug);

  const language = row ? detectPatternLanguage(row.pattern_data) : "en";
  const title = row
    ? buildPublicTitle(row.pattern_data, language)
    : "La Maille";
  const garment = row
    ? publicGarmentLabels[language][row.pattern_data.analysis.garment.type] ||
      publicGarmentLabels[language].unknown
    : null;
  const tagline = publicPatternStrings[language].ogTagline;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#faf7f2",
          backgroundImage:
            "linear-gradient(135deg, #faf7f2 0%, #f3ece1 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Branding La Maille */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: "#8b5e4b",
              color: "#faf7f2",
              fontSize: "40px",
            }}
          >
            🧶
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: "36px",
                fontWeight: 700,
                letterSpacing: "4px",
                color: "#3d2f26",
              }}
            >
              LA MAILLE
            </div>
            <div style={{ fontSize: "22px", color: "#8b5e4b" }}>{tagline}</div>
          </div>
        </div>

        {/* Titre du patron */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {garment && (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "8px 24px",
                borderRadius: "999px",
                backgroundColor: "#8b5e4b",
                color: "#faf7f2",
                fontSize: "26px",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              {garment}
            </div>
          )}
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              lineHeight: 1.15,
              color: "#3d2f26",
              maxWidth: "1000px",
            }}
          >
            {title}
          </div>
        </div>

        {/* Pied de page */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "26px",
            color: "#6b5b4e",
          }}
        >
          <div>la-maille.com</div>
          <div style={{ display: "flex", gap: "8px" }}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: i % 2 === 0 ? "#8b5e4b" : "#d8c5b4",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
