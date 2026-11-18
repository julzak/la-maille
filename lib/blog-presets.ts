import type { GarmentAnalysis } from "./types";

/**
 * Cle sessionStorage posee au clic sur le CTA preregle (slug de l'article).
 * Lue sur /patron pour distinguer un patron preregle d'un patron issu d'une photo.
 */
export const PRESET_SESSION_KEY = "lamaille-preset-slug";

/**
 * Analyses fixes chargees depuis les articles de blog FR, sans photo ni appel
 * /api/analyze : le lecteur arrive sur /analyse avec le modele deja decrit et
 * choisit sa taille. Mesure oct. 2026 : le blog FR convertit a 0,9 % parce que
 * les lecteurs cherchent un modele gratuit et n'ont pas de photo.
 * Couvertes par scripts/test-calculator.ts (hauts) et scripts/test-hat.ts (bonnets).
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

// Bonnet decrit dans bonnet-a-tricoter : bord en cotes, corps en jersey, sommet en 8 quartiers.
const bonnetClassique: GarmentAnalysis = {
  analysable: true,
  rejectionReason: null,
  garment: { type: "bonnet", confidence: 1 },
  construction: { method: "bottom-up", confidence: 1, reasoning: "" },
  neckline: { type: "unknown", confidence: 0 },
  neckband: { construction: "unknown", height: "unknown", stitch: "unknown", doubled: null, confidence: 0 },
  sleeves: { type: "unknown", length: "sans", confidence: 0 },
  stitch: { mainPattern: "jersey", confidence: 1, notes: null },
  closure: { type: "aucune", buttonCountEstimate: null, confidence: 0 },
  fit: { style: "unknown", confidence: 0 },
  hat: { brim: { type: "cotes-2x2", folded: false }, shape: "ajuste", crown: "quartiers", pompom: false, confidence: 1 },
  limitations: [],
  warnings: [],
  overallConfidence: "high",
};

export const BLOG_PRESETS: Record<string, GarmentAnalysis> = {
  "comment-tricoter-un-pull": raglanTopDown,
  "modele-pull-a-tricoter-gratuit": raglanTopDown,
  "modeles-tricot-gratuits": raglanTopDown,
  "tricoter-en-rond": raglanTopDown,
  "tricot-debutant": raglanTopDown,
  "bonnet-a-tricoter": bonnetClassique,
  "gilet-cardigan-tricot": {
    ...raglanTopDown,
    garment: { type: "cardigan", confidence: 1 },
    neckline: { type: "ouvert-cardigan", confidence: 1 },
    closure: { type: "boutons", buttonCountEstimate: 5, confidence: 1 },
  },
};
