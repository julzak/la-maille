// ===========================================
// LA MAILLE - Tailles de bonnets
// ===========================================
//
// Source des mesures : Woolly Wormhead, "A Guide to Hat Sizing"
// (https://woollywormhead.com/blog/2009/09/26/hat-sizing-guide, consulté le 2026-09-25).
//  - head : tour de tête (cm), "Head Circumference by age in metric"
//  - length : hauteur de tête du sommet au bas de l'oreille (cm), "Head length by age in metric",
//    que la source donne comme "ideal head length for Hats" (hauteur d'un bonnet ajusté).
//  - Aisance négative : "roughly 12%" (même source, section "Choosing the Right Size").
// La taille "Prématuré" de la source n'est pas proposée.
//
// Choix produit (pas des données sourcées, modifiables dans le formulaire) :
//  - HAT_SLOUCH_EXTRA_CM : longueur ajoutée pour un bonnet ample. Borne basse de la fourchette
//    "2-3 in (5-8 cm) adultes, 1-2 in (2.5-5 cm) bébés" de Knitgrammer
//    (https://www.knitgrammer.com/blog/head-size-chart-for-knitting-hats/).
//  - brim : hauteur du bord par défaut (5 cm comme les côtes des pulls, 3 cm pour les bébés).

export const HAT_NEGATIVE_EASE_PCT = 12;

export interface HatSizePreset {
  label: string;
  labelEn: string;
  head: number;
  length: number;
  brim: number;
  baby: boolean;
}

export const HAT_SIZE_PRESETS = {
  naissance: { label: "Naissance", labelEn: "Newborn", head: 35.5, length: 12.5, brim: 3, baby: true },
  "6m": { label: "6 mois", labelEn: "6 months", head: 40.5, length: 14.5, brim: 3, baby: true },
  "12m": { label: "12 mois", labelEn: "12 months", head: 45.5, length: 16.5, brim: 3, baby: true },
  enfant: { label: "Enfant / ado", labelEn: "Child / teen", head: 50.5, length: 18.5, brim: 5, baby: false },
  adulte: { label: "Adulte", labelEn: "Adult", head: 56, length: 21, brim: 5, baby: false },
  "adulte-l": { label: "Adulte L", labelEn: "Adult L", head: 61, length: 23.5, brim: 5, baby: false },
  "adulte-xl": { label: "Adulte XL", labelEn: "Adult XL", head: 66, length: 25, brim: 5, baby: false },
} satisfies Record<string, HatSizePreset>;

export type HatSizeKey = keyof typeof HAT_SIZE_PRESETS;
export const HAT_SIZE_ORDER: HatSizeKey[] = ["naissance", "6m", "12m", "enfant", "adulte", "adulte-l", "adulte-xl"];

export function hatSlouchExtraCm(baby: boolean): number {
  return baby ? 2.5 : 5;
}

/** Mesures par défaut pour une taille, selon la forme détectée (ajusté par défaut). */
export function hatMeasurementsForSize(size: HatSizeKey, shape: "ajuste" | "ample" | "unknown" = "ajuste") {
  const p: HatSizePreset = HAT_SIZE_PRESETS[size];
  return {
    kind: "hat" as const,
    headCircumference: p.head,
    hatHeight: p.length + (shape === "ample" ? hatSlouchExtraCm(p.baby) : 0),
    brimHeight: p.brim,
    ease: HAT_NEGATIVE_EASE_PCT,
  };
}
