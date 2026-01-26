import { Document } from "@react-pdf/renderer";
import { CoverPage } from "./CoverPage";
import { MaterialsPage } from "./MaterialsPage";
import { InstructionPage } from "./InstructionPage";
import { FinishingPage } from "./FinishingPage";
import type { GeneratedPattern, GarmentAnalysis } from "../types";

interface PatternDocumentProps {
  pattern: GeneratedPattern;
  analysis: GarmentAnalysis;
  imageUrl?: string;
  language: "fr" | "en";
}

export function PatternDocument({
  pattern,
  analysis,
  imageUrl,
  language,
}: PatternDocumentProps) {
  // Détermine la difficulté
  const getDifficultyLevel = (): "beginner" | "intermediate" | "advanced" => {
    const stitch = analysis.stitch?.mainPattern || "jersey";
    if (stitch === "jersey" || stitch === "mousse") {
      return "beginner";
    }
    if (stitch === "cotes") {
      return "intermediate";
    }
    return "advanced";
  };

  const getDifficultyLabel = (): string => {
    const level = getDifficultyLevel();
    const labels = {
      beginner: { fr: "Débutant", en: "Beginner" },
      intermediate: { fr: "Intermédiaire", en: "Intermediate" },
      advanced: { fr: "Avancé", en: "Advanced" },
    };
    return labels[level][language];
  };

  // Estime le temps basé sur la complexité
  const getEstimatedTime = () => {
    const level = getDifficultyLevel();
    if (level === "beginner") return "12-18h";
    if (level === "intermediate") return "18-25h";
    return "25-35h";
  };

  // Calcule la taille approximative
  const getSize = () => {
    const chest = pattern.measurements?.chestCircumference || 100;
    if (chest < 90) return "XS";
    if (chest < 98) return "S";
    if (chest < 106) return "M";
    if (chest < 114) return "L";
    if (chest < 122) return "XL";
    return "XXL";
  };

  // Génère les abréviations
  const abbreviations =
    language === "fr"
      ? [
          { abbr: "m", meaning: "maille(s)" },
          { abbr: "rg", meaning: "rang(s)" },
          { abbr: "end", meaning: "endroit" },
          { abbr: "env", meaning: "envers" },
          { abbr: "dim", meaning: "diminution" },
          { abbr: "aug", meaning: "augmentation" },
          { abbr: "rab", meaning: "rabattre" },
          { abbr: "rep", meaning: "répéter" },
        ]
      : [
          { abbr: "st", meaning: "stitch(es)" },
          { abbr: "row", meaning: "row(s)" },
          { abbr: "k", meaning: "knit" },
          { abbr: "p", meaning: "purl" },
          { abbr: "dec", meaning: "decrease" },
          { abbr: "inc", meaning: "increase" },
          { abbr: "bo", meaning: "bind off" },
          { abbr: "rep", meaning: "repeat" },
        ];

  // Génère le nom du type de vêtement
  const getGarmentName = () => {
    const type = analysis.garment?.type || "pull";
    const names: Record<string, { fr: string; en: string }> = {
      pull: { fr: "Pull", en: "Sweater" },
      cardigan: { fr: "Cardigan", en: "Cardigan" },
      gilet: { fr: "Gilet", en: "Vest" },
      autre: { fr: "Vêtement tricoté", en: "Knitted garment" },
    };
    return names[type]?.[language] || names.pull[language];
  };

  // Accessoires nécessaires
  const accessories = [
    language === "fr" ? "Aiguille à laine" : "Tapestry needle",
    language === "fr" ? "Marqueurs de mailles" : "Stitch markers",
    language === "fr" ? "Ciseaux" : "Scissors",
  ];

  if (analysis.closure?.type === "boutons" && analysis.closure.buttonCountEstimate) {
    accessories.push(
      language === "fr"
        ? `${analysis.closure.buttonCountEstimate} boutons`
        : `${analysis.closure.buttonCountEstimate} buttons`
    );
  }

  // Tips de blocage
  const blockingTips =
    language === "fr"
      ? [
          "Lavez délicatement à l'eau tiède",
          "Essorez sans tordre dans une serviette",
          "Épinglez aux dimensions sur un tapis",
          "Laissez sécher complètement à plat",
        ]
      : [
          "Gently wash in lukewarm water",
          "Squeeze dry in a towel without wringing",
          "Pin to measurements on a blocking mat",
          "Let dry completely flat",
        ];

  // Tips d'entretien
  const careTips =
    language === "fr"
      ? [
          "Lavage à la main recommandé",
          "Séchage à plat obligatoire",
          "Ranger plié, jamais sur cintre",
        ]
      : [
          "Hand wash recommended",
          "Flat drying required",
          "Store folded, never on hanger",
        ];

  let pageNumber = 3;

  return (
    <Document>
      {/* Page 1: Couverture */}
      <CoverPage
        garmentType={getGarmentName()}
        imageUrl={imageUrl}
        difficulty={getDifficultyLabel()}
        estimatedTime={getEstimatedTime()}
        size={getSize()}
        createdAt={new Date().toLocaleDateString(language === "fr" ? "fr-FR" : "en-US")}
        language={language}
      />

      {/* Page 2: Matériel */}
      <MaterialsPage
        yarn={{
          weight: pattern.yarn?.weight || "DK",
          estimatedMeters: `${pattern.estimatedYardage || 800}m ${
            language === "fr" ? "environ" : "approx"
          }`,
          composition: pattern.yarn?.composition,
        }}
        needles={`${pattern.gauge?.needleSize || 5}mm ${
          language === "fr" ? "circulaires 80cm" : "circular 32in"
        }`}
        gauge={{
          stitches: pattern.gauge?.stitchesPer10cm || 18,
          rows: pattern.gauge?.rowsPer10cm || 24,
        }}
        accessories={accessories}
        abbreviations={abbreviations}
        language={language}
      />

      {/* Pages d'instructions pour chaque pièce */}
      {pattern.pieces.map((piece, i) => (
        <InstructionPage
          key={piece.name}
          sectionTitle={language === "fr" ? "INSTRUCTIONS" : "INSTRUCTIONS"}
          sectionSubtitle={piece.name}
          steps={piece.instructions.map((instr, j) => ({
            number: j + 1,
            title:
              language === "fr"
                ? `Rangs ${instr.rowStart}-${instr.rowEnd}`
                : `Rows ${instr.rowStart}-${instr.rowEnd}`,
            instructions: [instr.text],
            notes: instr.notes,
          }))}
          dimensions={[
            {
              label: language === "fr" ? "Mailles montées" : "Cast on",
              value: `${piece.castOn} ${language === "fr" ? "m" : "st"}`,
            },
            {
              label: language === "fr" ? "Total rangs" : "Total rows",
              value: `${piece.totalRows} ${language === "fr" ? "rg" : "rows"}`,
            },
          ]}
          pageNumber={pageNumber++}
          totalPieces={pattern.pieces.length}
          pieceIndex={i}
          language={language}
        />
      ))}

      {/* Page Finitions */}
      <FinishingPage
        assemblySteps={pattern.assembly || []}
        blockingTips={blockingTips}
        careTips={careTips}
        pageNumber={pageNumber}
        language={language}
      />
    </Document>
  );
}
