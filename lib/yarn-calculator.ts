import type { Measurements, Gauge } from "./types";

export interface YarnStock {
  skeinCount: number;
  metersPerSkein: number;
}

export interface YarnAdjustment {
  id: string;
  type: "body_length" | "sleeve_length" | "ease";
  reduction: number; // in cm
  metersSaved: number;
  labelKey: string; // translation key
}

export interface YarnEstimate {
  min: number;
  max: number;
  average: number;
}

export interface YarnCalculationResult {
  needed: YarnEstimate;
  available: number;
  status: "sufficient" | "tight" | "insufficient";
  shortage: number; // 0 if sufficient, positive if short
  surplus: number; // 0 if insufficient, positive if extra
  adjustments: YarnAdjustment[];
}

/**
 * Calculate yarn needed based on measurements, gauge, and garment type
 * Uses surface area × stitch density × yarn consumption factor
 */
export function calculateYarnNeeded(
  measurements: Measurements,
  gauge: Gauge,
  garmentType: "pull" | "cardigan" | "gilet" | string,
  hasLongSleeves: boolean = true
): YarnEstimate {
  // Constants for yarn consumption calculation
  // Average yarn consumption per cm² in meters (varies by gauge)
  // Thicker yarn = more meters per area, but also more coverage per meter
  // Ordre de grandeur mesuré : un carré de 10 x 10 cm en jersey DK (22 m x 30 rg) consomme 8 à 10 m de fil,
  // soit ~0,09 m/cm². Un pull adulte M en DK (~10 000 cm² de surface) donne ainsi ~900 à 1 000 m, conforme
  // aux métrages indiqués par les patrons du commerce (1 000 à 1 300 m).
  const baseConsumptionPerCm2 = 0.09;

  // Mise à l'échelle par l'échantillon : la longueur de fil d'une maille est proportionnelle à sa largeur
  // (10 / mailles par 10 cm), donc fil par cm² = mailles/cm × rangs/cm × largeur ≈ k × rangs par 10 cm.
  // Référence 30 rangs / 10 cm (DK).
  const gaugeMultiplier = gauge.rowsPer10cm / 30;
  const consumptionPerCm2 = baseConsumptionPerCm2 * gaugeMultiplier;

  // Calculate body dimensions
  const bodyWidth = measurements.chestCircumference + measurements.ease;
  const bodyLength = measurements.bodyLength;

  // Body surface area (front + back)
  // Approximate as rectangle with slight reduction for armholes
  const bodySurface = bodyWidth * bodyLength * 0.95; // 5% reduction for armholes

  // Sleeve surface area (if applicable)
  let sleeveSurface = 0;
  if (hasLongSleeves) {
    const armLength = measurements.armLength;
    const bicepCirc = measurements.bicepCircumference + 4; // ease for sleeves
    const wristCirc = measurements.wristCircumference + 2;
    // Tapered cylinder approximation
    const avgCirc = (bicepCirc + wristCirc) / 2;
    sleeveSurface = avgCirc * armLength * 2; // 2 sleeves
  }

  // Neckline and ribbing (approximate)
  const ribbingSurface = bodyWidth * 6 + (hasLongSleeves ? wristRibbingSurface(measurements) : 0);

  // Total surface
  let totalSurface = bodySurface + sleeveSurface + ribbingSurface;

  // Cardigan adjustment (button bands add ~5%)
  if (garmentType === "cardigan") {
    totalSurface *= 1.05;
  }

  // Calculate meters needed
  const metersNeeded = totalSurface * consumptionPerCm2;

  // Add safety margin and create range
  const min = Math.round(metersNeeded * 0.9);
  const max = Math.round(metersNeeded * 1.15);
  const average = Math.round(metersNeeded);

  return { min, max, average };
}

function wristRibbingSurface(measurements: Measurements): number {
  return measurements.wristCircumference * 6 * 2; // 6cm ribbing, 2 sleeves
}

/**
 * Suggest adjustments if yarn is insufficient
 * Returns adjustments sorted by visual impact (least visible first)
 */
export function suggestAdjustments(
  needed: YarnEstimate,
  available: number,
  measurements: Measurements,
  gauge: Gauge
): YarnAdjustment[] {
  const shortage = needed.average - available;
  if (shortage <= 0) return [];

  const adjustments: YarnAdjustment[] = [];

  // Calculate how many meters saved per cm reduction
  const bodyWidth = measurements.chestCircumference + measurements.ease;
  const metersPerCmBody = (bodyWidth * gauge.stitchesPer10cm * gauge.rowsPer10cm) / 10000 * 0.008;
  const sleeveCirc = (measurements.bicepCircumference + measurements.wristCircumference) / 2 + 3;
  const metersPerCmSleeve = (sleeveCirc * 2 * gauge.stitchesPer10cm * gauge.rowsPer10cm) / 10000 * 0.008;
  const metersPerCmEase = (measurements.bodyLength * gauge.stitchesPer10cm * gauge.rowsPer10cm) / 10000 * 0.008;

  // Suggest body length reduction (most flexible, least noticeable)
  const maxBodyReduction = Math.min(8, Math.floor(shortage / (metersPerCmBody * 10)));
  if (maxBodyReduction >= 2) {
    const reduction = Math.min(maxBodyReduction, Math.ceil(shortage / metersPerCmBody / 2));
    adjustments.push({
      id: "body_length",
      type: "body_length",
      reduction,
      metersSaved: Math.round(reduction * metersPerCmBody * 10),
      labelKey: "adjustBodyLength",
    });
  }

  // Suggest sleeve length reduction
  if (measurements.armLength > 50) {
    const maxSleeveReduction = Math.min(5, Math.floor(shortage / (metersPerCmSleeve * 10)));
    if (maxSleeveReduction >= 2) {
      const reduction = Math.min(maxSleeveReduction, Math.ceil(shortage / metersPerCmSleeve / 3));
      adjustments.push({
        id: "sleeve_length",
        type: "sleeve_length",
        reduction,
        metersSaved: Math.round(reduction * metersPerCmSleeve * 10),
        labelKey: "adjustSleeveLength",
      });
    }
  }

  // Suggest ease reduction (affects fit)
  if (measurements.ease > 4) {
    const maxEaseReduction = Math.min(measurements.ease - 2, 6);
    if (maxEaseReduction >= 2) {
      const reduction = Math.min(maxEaseReduction, Math.ceil(shortage / metersPerCmEase / 2));
      adjustments.push({
        id: "ease",
        type: "ease",
        reduction,
        metersSaved: Math.round(reduction * metersPerCmEase * 10),
        labelKey: "adjustEase",
      });
    }
  }

  // Sort by visual impact (body length first as it's most adjustable)
  return adjustments.sort((a, b) => {
    const order = { body_length: 0, sleeve_length: 1, ease: 2 };
    return order[a.type] - order[b.type];
  });
}

/**
 * Apply selected adjustments to measurements
 */
export function applyAdjustments(
  measurements: Measurements,
  adjustments: YarnAdjustment[]
): Measurements {
  const adjusted = { ...measurements };

  for (const adj of adjustments) {
    switch (adj.type) {
      case "body_length":
        adjusted.bodyLength = Math.max(40, adjusted.bodyLength - adj.reduction);
        break;
      case "sleeve_length":
        adjusted.armLength = Math.max(40, adjusted.armLength - adj.reduction);
        break;
      case "ease":
        adjusted.ease = Math.max(2, adjusted.ease - adj.reduction);
        break;
    }
  }

  return adjusted;
}

/**
 * Full yarn calculation including status and suggestions
 */
export function calculateYarnStatus(
  measurements: Measurements,
  gauge: Gauge,
  garmentType: string,
  yarnStock: YarnStock | null,
  hasLongSleeves: boolean = true
): YarnCalculationResult {
  const needed = calculateYarnNeeded(measurements, gauge, garmentType, hasLongSleeves);
  const available = yarnStock ? yarnStock.skeinCount * yarnStock.metersPerSkein : 0;

  let status: YarnCalculationResult["status"];
  let shortage = 0;
  let surplus = 0;

  if (!yarnStock || available === 0) {
    status = "sufficient"; // No stock specified, assume they'll buy enough
    surplus = 0;
  } else if (available >= needed.max) {
    status = "sufficient";
    surplus = available - needed.average;
  } else if (available >= needed.min) {
    status = "tight";
    surplus = available - needed.average;
  } else {
    status = "insufficient";
    shortage = needed.average - available;
  }

  const adjustments = status === "insufficient"
    ? suggestAdjustments(needed, available, measurements, gauge)
    : [];

  return {
    needed,
    available,
    status,
    shortage,
    surplus,
    adjustments,
  };
}

/**
 * Convert meters to grams (approximate, varies by yarn weight)
 */
export function metersToGrams(meters: number, yarnWeight: string): number {
  // Approximate meters per 100g for different yarn weights
  const metersPerHundredGrams: Record<string, number> = {
    lace: 800,
    fingering: 400,
    sport: 300,
    dk: 230,
    worsted: 180,
    aran: 150,
    bulky: 100,
  };

  const metersPer100g = metersPerHundredGrams[yarnWeight] || 200;
  return Math.round((meters / metersPer100g) * 100);
}
