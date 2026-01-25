"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import {
  GARMENT_TYPE_LABELS,
  CONSTRUCTION_METHOD_LABELS,
  YARN_WEIGHT_LABELS,
} from "@/lib/types";
import type { GeneratedPattern } from "@/lib/types";
import { SchematicPDF, getDimensionsForPDF } from "./SchematicPDF";

// Note: Helvetica is a built-in font in @react-pdf/renderer, no registration needed

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.5,
    color: "#1a1a1a",
  },
  // Cover page
  coverPage: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 48,
    textAlign: "center",
  },
  garmentType: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  constructionMethod: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 40,
    textAlign: "center",
  },
  infoTable: {
    borderWidth: 1,
    borderColor: "#dddddd",
    padding: 20,
    marginBottom: 40,
    width: "80%",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    width: "50%",
    color: "#666666",
    fontSize: 10,
  },
  infoValue: {
    width: "50%",
    fontWeight: "bold",
    fontSize: 10,
  },
  warningBox: {
    borderWidth: 2,
    borderColor: "#b45309",
    backgroundColor: "#fef3c7",
    padding: 16,
    marginTop: 32,
    width: "80%",
  },
  warningTitle: {
    fontWeight: "bold",
    fontSize: 11,
    marginBottom: 4,
    textAlign: "center",
  },
  warningText: {
    fontSize: 9,
    color: "#666666",
    textAlign: "center",
  },
  dateText: {
    fontSize: 10,
    color: "#666666",
    marginTop: 32,
    textAlign: "center",
  },
  // Content pages
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
  },
  h3: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 1.5,
  },
  listItem: {
    fontSize: 11,
    marginBottom: 4,
    paddingLeft: 12,
  },
  mono: {
    fontFamily: "Courier",
  },
  muted: {
    color: "#666666",
  },
  infoBox: {
    borderWidth: 1,
    borderColor: "#dddddd",
    backgroundColor: "#f9f9f9",
    padding: 12,
    marginVertical: 12,
  },
  instructionBlock: {
    backgroundColor: "#fafafa",
    borderLeftWidth: 3,
    borderLeftColor: "#333333",
    padding: 12,
    marginVertical: 8,
  },
  rowsIndicator: {
    fontSize: 9,
    color: "#666666",
    marginBottom: 4,
  },
  materialRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
  },
  materialLabel: {
    width: 100,
    fontWeight: "bold",
    fontSize: 10,
  },
  materialValue: {
    flex: 1,
    fontSize: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#666666",
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
    paddingTop: 10,
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 40,
    fontSize: 9,
    color: "#666666",
  },
});

interface PatternPDFProps {
  pattern: GeneratedPattern;
}

export function PatternPDF({ pattern }: PatternPDFProps) {
  const garmentTypeLabel = GARMENT_TYPE_LABELS[pattern.analysis.garment.type];
  const createdDate = new Date(pattern.createdAt).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const calculatedWidth = Math.round(
    pattern.measurements.chestCircumference + pattern.measurements.ease
  );

  return (
    <Document>
      {/* PAGE 1: COUVERTURE */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.title}>LA MAILLE</Text>
        <Text style={styles.subtitle}>De la photo au tricot</Text>

        <Text style={styles.garmentType}>{garmentTypeLabel}</Text>
        <Text style={styles.constructionMethod}>
          {CONSTRUCTION_METHOD_LABELS[pattern.analysis.construction.method]}
        </Text>

        <View style={styles.infoTable}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tour de poitrine fini</Text>
            <Text style={styles.infoValue}>{calculatedWidth} cm</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Echantillon</Text>
            <Text style={styles.infoValue}>
              {pattern.gauge.stitchesPer10cm} m x {pattern.gauge.rowsPer10cm} r
              / 10 cm
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Aiguilles</Text>
            <Text style={styles.infoValue}>{pattern.gauge.needleSize} mm</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fil</Text>
            <Text style={styles.infoValue}>
              {YARN_WEIGHT_LABELS[pattern.yarn.weight]}
            </Text>
          </View>
        </View>

        <Text style={styles.dateText}>Genere le {createdDate}</Text>

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>
            Ce patron est une estimation automatique.
          </Text>
          <Text style={styles.warningText}>
            Verifiez vos calculs et tricotez un echantillon avant de commencer.
          </Text>
        </View>
      </Page>

      {/* PAGE 2: MATERIEL */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Materiel necessaire</Text>

        <View style={styles.materialRow}>
          <Text style={styles.materialLabel}>Fil</Text>
          <Text style={styles.materialValue}>
            {YARN_WEIGHT_LABELS[pattern.yarn.weight]}
            {pattern.yarn.composition && ` - ${pattern.yarn.composition}`}
            {" - estimation "}
            {Math.round(pattern.estimatedYardage * 0.9)}-
            {Math.round(pattern.estimatedYardage * 1.1)} g
          </Text>
        </View>

        <View style={styles.materialRow}>
          <Text style={styles.materialLabel}>Aiguilles</Text>
          <Text style={styles.materialValue}>
            {pattern.gauge.needleSize} mm - circulaires 80 cm minimum
          </Text>
        </View>

        <View style={styles.materialRow}>
          <Text style={styles.materialLabel}>Accessoires</Text>
          <Text style={styles.materialValue}>
            Aiguille a laine, marqueurs, ciseaux
          </Text>
        </View>

        {pattern.analysis.closure.type === "boutons" && (
          <View style={styles.materialRow}>
            <Text style={styles.materialLabel}>Boutons</Text>
            <Text style={styles.materialValue}>
              {pattern.analysis.closure.buttonCountEstimate || 5} boutons
              d&apos;environ 1.5-2 cm
            </Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={{ fontSize: 10, marginBottom: 4 }}>
            Echantillon requis : {pattern.gauge.stitchesPer10cm} mailles x{" "}
            {pattern.gauge.rowsPer10cm} rangs pour 10 cm, en jersey, avec les
            aiguilles {pattern.gauge.needleSize} mm.
          </Text>
          <Text style={{ fontSize: 9, color: "#666666" }}>
            Lavez et bloquez votre echantillon avant de mesurer.
          </Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>

      {/* PAGES PATRON - Une page par piece */}
      {pattern.pieces.map((piece, pieceIndex) => {
        const schematicData = getDimensionsForPDF(
          piece.name,
          piece.castOn,
          piece.totalRows,
          pattern.gauge
        );

        return (
          <Page key={pieceIndex} size="A4" style={styles.page}>
            <Text style={styles.sectionTitle}>{piece.name}</Text>

            <View style={{ flexDirection: "row", marginBottom: 16 }}>
              {/* Info de base */}
              <View style={{ flex: 1 }}>
                {piece.castOn > 0 && (
                  <Text style={styles.paragraph}>
                    Montage : {piece.castOn} mailles
                    {piece.totalRows > 0 && ` | Rangs : ~${piece.totalRows}`}
                  </Text>
                )}
              </View>

              {/* Schema */}
              {schematicData && (
                <View style={{ width: 160, alignItems: "center" }}>
                  <SchematicPDF
                    piece={schematicData.piece}
                    dimensions={schematicData.dimensions}
                    showMeasurements={true}
                  />
                </View>
              )}
            </View>

            {piece.instructions.map((instruction, instrIndex) => (
              <View key={instrIndex} style={styles.instructionBlock}>
                {instruction.rowStart > 0 && (
                  <Text style={styles.rowsIndicator}>
                    Rang{instruction.rowStart !== instruction.rowEnd ? "s" : ""}{" "}
                    {instruction.rowStart}
                    {instruction.rowEnd !== instruction.rowStart &&
                      ` - ${instruction.rowEnd}`}
                  </Text>
                )}
                <Text style={{ fontSize: 11 }}>{instruction.text}</Text>
                {instruction.notes && (
                  <Text style={{ fontSize: 9, color: "#666666", marginTop: 4 }}>
                    Note : {instruction.notes}
                  </Text>
                )}
              </View>
            ))}

            {piece.warnings.length > 0 && (
              <View style={styles.infoBox}>
                {piece.warnings.map((warning, i) => (
                  <Text key={i} style={{ fontSize: 10, marginBottom: 2 }}>
                    - {warning}
                  </Text>
                ))}
              </View>
            )}

            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `${pageNumber} / ${totalPages}`
              }
              fixed
            />
          </Page>
        );
      })}

      {/* PAGE ASSEMBLAGE ET FINITIONS */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Assemblage</Text>
        {pattern.assembly.map((step, i) => (
          <Text key={i} style={styles.listItem}>
            {i + 1}. {step.replace(/^\d+\.\s*/, "")}
          </Text>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Finitions</Text>
        {pattern.finishing.map((step, i) => (
          <Text key={i} style={styles.listItem}>
            - {step.replace(/^-\s*/, "")}
          </Text>
        ))}

        {pattern.analysis.limitations.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
              Limitations de l&apos;analyse
            </Text>
            <View style={styles.warningBox}>
              {pattern.analysis.limitations.map((limitation, i) => (
                <Text key={i} style={{ fontSize: 10, marginBottom: 2 }}>
                  - {limitation}
                </Text>
              ))}
              <Text
                style={{ fontSize: 9, color: "#666666", marginTop: 8 }}
              >
                Ces elements necessitent votre jugement ou la consultation
                d&apos;un patron dedie.
              </Text>
            </View>
          </>
        )}

        <View style={styles.infoBox}>
          <Text style={{ fontSize: 9, color: "#666666" }}>
            {pattern.disclaimer}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>La Maille - lamaille.fr - Patron genere automatiquement</Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
