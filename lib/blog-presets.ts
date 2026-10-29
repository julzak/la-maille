import type { GarmentAnalysis } from "./types";

/**
 * Analyses fixes chargees depuis les articles de blog FR, sans photo ni appel
 * /api/analyze : le lecteur arrive sur /analyse avec le modele deja decrit et
 * choisit sa taille. Mesure oct. 2026 : le blog FR convertit a 0,9 % parce que
 * les lecteurs cherchent un modele gratuit et n'ont pas de photo.
 * Couvertes par scripts/test-calculator.ts.
 */
const raglanTopDown: GarmentAnalysis = {
  analysable: true,
  rejectionReason: null,
  garment: { type: "pull", confidence: 1 },
  construction: { method: "top-down", confidence: 1, reasoning: "" },
  neckline: { type: "ras-du-cou", confidence: 1 },
  neckband: { construction: "picked-up", height: "moyenne", stitch: "cotes-1x1", doubled: false, confidence: 1 },
  sleeves: { type: "raglan", length: "longues", confidence: 1 },
  stitch: { mainPattern: "jersey", confidence: 1, notes: null },
  closure: { type: "aucune", buttonCountEstimate: null, confidence: 1 },
  fit: { style: "regular", confidence: 1 },
  limitations: [],
  warnings: [],
  overallConfidence: "high",
};

export const BLOG_PRESETS: Record<string, GarmentAnalysis> = {
  "comment-tricoter-un-pull": raglanTopDown,
  "gilet-cardigan-tricot": {
    ...raglanTopDown,
    garment: { type: "cardigan", confidence: 1 },
    neckline: { type: "ouvert-cardigan", confidence: 1 },
    closure: { type: "boutons", buttonCountEstimate: 5, confidence: 1 },
  },
};
