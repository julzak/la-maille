// ===========================================
// LA MAILLE - Types principaux
// ===========================================

// Résultat de l'analyse d'image
export interface GarmentAnalysis {
  analysable: boolean;
  rejectionReason: string | null;

  garment: {
    type: "pull" | "cardigan" | "gilet" | "bonnet" | "autre" | "unknown";
    confidence: number;
  };

  construction: {
    method:
      | "pieces-assemblees"
      | "top-down"
      | "bottom-up"
      | "side-to-side"
      | "unknown";
    confidence: number;
    reasoning: string;
  };

  neckline: {
    type:
      | "ras-du-cou"
      | "col-v"
      | "bateau"
      | "ouvert-cardigan"
      | "capuche"
      | "unknown";
    confidence: number;
  };

  neckband: {
    construction: "picked-up" | "sewn-on" | "integrated" | "unknown";
    height: "basse" | "moyenne" | "haute" | "unknown"; // ~2cm, ~4cm, ~6cm+
    stitch: "cotes-1x1" | "cotes-2x2" | "jersey" | "mousse" | "autre" | "unknown";
    doubled: boolean | null; // col double (replie) ou simple
    confidence: number;
  };

  sleeves: {
    type: "montees" | "raglan" | "marteau" | "sans-manches" | "unknown";
    length: "longues" | "3-4" | "courtes" | "sans" | "unknown";
    confidence: number;
  };

  stitch: {
    mainPattern:
      | "jersey"
      | "mousse"
      | "cotes"
      | "torsades"
      | "jacquard"
      | "dentelle"
      | "autre"
      | "unknown";
    confidence: number;
    notes: string | null;
  };

  closure: {
    type: "aucune" | "boutons" | "zip" | "unknown";
    buttonCountEstimate: number | null;
    confidence: number;
  };

  fit: {
    style: "ajuste" | "regular" | "oversized" | "unknown";
    confidence: number;
  };

  // Spécifique bonnet (garment.type === "bonnet"). Absent pour les hauts.
  hat?: HatAnalysis;

  limitations: string[];
  warnings: string[];
  overallConfidence: "high" | "medium" | "low" | "insufficient";
}

export interface HatAnalysis {
  brim: {
    type: "cotes-1x1" | "cotes-2x2" | "mousse" | "roule" | "unknown";
    folded: boolean | null; // bord à revers (replié)
  };
  shape: "ajuste" | "ample" | "unknown"; // bonnet près de la tête ou bonnet ample (slouchy)
  crown: "quartiers" | "spirale" | "fronce" | "unknown";
  pompom: boolean | null;
  confidence: number;
}

// ===========================================
// Catégories de vêtements
// ===========================================

export type GarmentCategory = "top" | "hat";

/** Aiguillage unique par catégorie : tout le code passe par ici, jamais par des comparaisons de type dispersées. */
export function garmentCategory(type: GarmentAnalysis["garment"]["type"] | string | null | undefined): GarmentCategory {
  return type === "bonnet" ? "hat" : "top";
}

// ===========================================
// Gauge / Échantillon
// ===========================================

export interface Gauge {
  stitchesPer10cm: number;
  rowsPer10cm: number;
  needleSize: number;
}

// ===========================================
// Mesures utilisateur
// ===========================================

export interface Measurements {
  chestCircumference: number;
  bodyLength: number;
  shoulderWidth: number;
  armLength: number;
  wristCircumference: number;
  bicepCircumference: number;
  ease: number;
  hipCircumference?: number;
}

/** Mesures d'un bonnet (cm). ease en % de réduction du tour de tête (aisance négative). */
export interface HatMeasurements {
  kind: "hat";
  headCircumference: number;
  hatHeight: number; // hauteur totale du bonnet porté, bord déplié non compris
  brimHeight: number; // hauteur du bord visible (le revers est tricoté 2 fois plus haut)
  ease: number; // % d'aisance négative, ex. 12
}

export type AnyMeasurements = Measurements | HatMeasurements;

export function isHatMeasurements(m: AnyMeasurements | null | undefined): m is HatMeasurements {
  return !!m && (m as HatMeasurements).kind === "hat";
}

/** Tour fini affiché dans les résumés : poitrine + aisance (haut) ou tour du bonnet (tête moins aisance négative). */
export function finishedSize(m: AnyMeasurements): { kind: "chest" | "hat"; cm: number } {
  if (isHatMeasurements(m)) return { kind: "hat", cm: Math.round(m.headCircumference * (1 - m.ease / 100)) };
  return { kind: "chest", cm: Math.round(m.chestCircumference + m.ease) };
}

// ===========================================
// Infos fil
// ===========================================

export interface YarnInfo {
  weight: "lace" | "fingering" | "sport" | "dk" | "worsted" | "aran" | "bulky";
  composition?: string;
}

// ===========================================
// Étape de calcul (pour transparence)
// ===========================================

export interface CalculationStep {
  description: string;
  formula: string;
  result: number;
  rounded: number;
  roundingNote?: string;
}

// ===========================================
// Pièce du patron
// ===========================================

// Données du schéma coté d'une pièce (toutes les valeurs en cm, calculées par le générateur)
export interface PieceSchematic {
  kind: "panel" | "cardigan-front" | "sleeve" | "yoke" | "tube" | "hat" | "none";
  widthCm: number;
  lengthCm: number;
  armholeDepthCm?: number;
  shoulderWidthCm?: number; // carrure (panneaux)
  necklineWidthCm?: number;
  necklineDepthCm?: number;
  sleeveTopWidthCm?: number;
  sleeveCuffWidthCm?: number;
  capHeightCm?: number; // 0 = haut de manche droit
  neckline?: "crew" | "v";
  isFront?: boolean;
  mirror?: boolean; // devant droit : dessin en miroir
  buttonCount?: number;
  brimHeightCm?: number; // bonnet : hauteur du bord
  crownHeightCm?: number; // bonnet : hauteur des diminutions du sommet
}

export interface PatternPiece {
  name: string;
  castOn: number;
  totalRows: number;
  instructions: PatternInstruction[];
  calculations: CalculationStep[];
  warnings: string[];
  schematic?: PieceSchematic;
}

export interface PatternInstruction {
  rowStart: number;
  rowEnd: number;
  text: string;
  notes?: string;
}

// ===========================================
// Patron complet
// ===========================================

export interface GeneratedPattern {
  id: string;
  createdAt: Date;
  analysis: GarmentAnalysis;
  gauge: Gauge;
  measurements: AnyMeasurements;
  yarn: YarnInfo;
  pieces: PatternPiece[];
  assembly: string[];
  finishing: string[];
  estimatedYardage: number;
  disclaimer: string;
}

// ===========================================
// Types utilitaires
// ===========================================

// État de l'analyse en cours
export interface AnalysisState {
  status: "idle" | "uploading" | "analyzing" | "completed" | "error";
  progress?: number;
  error?: string;
  result?: GarmentAnalysis;
}

// Image uploadée
export interface UploadedImage {
  name: string;
  type: string;
  size: number;
  preview: string;
}

// Labels français pour l'affichage
export const GARMENT_TYPE_LABELS: Record<GarmentAnalysis["garment"]["type"], string> = {
  pull: "Pull",
  cardigan: "Cardigan",
  gilet: "Gilet",
  bonnet: "Bonnet",
  autre: "Autre",
  unknown: "Non identifié",
};

export const CONSTRUCTION_METHOD_LABELS: Record<GarmentAnalysis["construction"]["method"], string> = {
  "pieces-assemblees": "Pièces assemblées",
  "top-down": "Top-down (du haut vers le bas)",
  "bottom-up": "Bottom-up (du bas vers le haut)",
  "side-to-side": "Côté à côté",
  unknown: "Non identifié",
};

export const NECKLINE_LABELS: Record<GarmentAnalysis["neckline"]["type"], string> = {
  "ras-du-cou": "Ras du cou",
  "col-v": "Col V",
  bateau: "Encolure bateau",
  "ouvert-cardigan": "Ouvert (cardigan)",
  capuche: "Capuche",
  unknown: "Non identifié",
};

export const SLEEVE_TYPE_LABELS: Record<GarmentAnalysis["sleeves"]["type"], string> = {
  montees: "Manches montées",
  raglan: "Raglan",
  marteau: "Manches marteau",
  "sans-manches": "Sans manches",
  unknown: "Non identifié",
};

export const SLEEVE_LENGTH_LABELS: Record<GarmentAnalysis["sleeves"]["length"], string> = {
  longues: "Longues",
  "3-4": "3/4",
  courtes: "Courtes",
  sans: "Sans",
  unknown: "Non identifié",
};

export const STITCH_PATTERN_LABELS: Record<GarmentAnalysis["stitch"]["mainPattern"], string> = {
  jersey: "Jersey",
  mousse: "Point mousse",
  cotes: "Côtes",
  torsades: "Torsades",
  jacquard: "Jacquard",
  dentelle: "Dentelle",
  autre: "Autre",
  unknown: "Non identifié",
};

export const FIT_LABELS: Record<GarmentAnalysis["fit"]["style"], string> = {
  ajuste: "Ajusté",
  regular: "Regular",
  oversized: "Oversized",
  unknown: "Non identifié",
};

export const YARN_WEIGHT_LABELS: Record<YarnInfo["weight"], string> = {
  lace: "Lace (dentelle)",
  fingering: "Fingering (chaussette)",
  sport: "Sport",
  dk: "DK",
  worsted: "Worsted",
  aran: "Aran",
  bulky: "Bulky (grosse maille)",
};

export const CONFIDENCE_LABELS: Record<GarmentAnalysis["overallConfidence"], string> = {
  high: "Élevée",
  medium: "Moyenne",
  low: "Faible",
  insufficient: "Insuffisante",
};

// ===========================================
// Types pour le mode tricot (KnitMode)
// ===========================================

export interface ParsedInstruction {
  row: number;
  instruction: string;
  context?: string;
  technicalNote?: string;
  isDecrease: boolean;
  isIncrease: boolean;
  isSpecial: boolean;
  specialType?: "decrease" | "increase" | "bind-off" | "cast-on";
}

export interface ParsedPiece {
  id: string;
  name: string;
  totalRows: number;
  instructions: ParsedInstruction[];
}

export interface PieceProgress {
  currentRow: number;
  completed: boolean;
  markers?: Marker[];
}

export interface Marker {
  row: number;
  note: string;
  timestamp: Date;
}

export interface KnittingProgress {
  patternId: string;
  patternDate?: string;
  pieces: { [pieceId: string]: PieceProgress };
  lastUpdated: string;
}

// ===========================================
// User Profile (Supabase Auth)
// ===========================================

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ===========================================
// Saved Patterns (Supabase)
// ===========================================

export interface SavedPattern {
  id: string;
  user_id: string;
  pattern_id: string;
  name: string | null;
  thumbnail_url: string | null;
  pattern_data: GeneratedPattern;
  garment_type: string;
  created_at: string;
  updated_at: string;
  // Publication (BRIEF-03). Optionnels : absents tant que la migration
  // 20260803_public_patterns.sql n'est pas appliquee.
  is_public?: boolean;
  public_slug?: string | null;
}

export interface SavedPatternInsert {
  pattern_id: string;
  name?: string;
  thumbnail_url?: string;
  pattern_data: GeneratedPattern;
  garment_type: string;
}

export interface SavedPatternSummary {
  id: string;
  pattern_id: string;
  name: string | null;
  thumbnail_url: string | null;
  garment_type: string;
  created_at: string;
  // Publication (BRIEF-03). `undefined` = colonnes absentes en DB
  // (migration non appliquee) : l'UI masque alors le toggle.
  is_public?: boolean;
  public_slug?: string | null;
}
