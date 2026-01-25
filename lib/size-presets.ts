export interface SizePreset {
  label: string;
  labelEn: string;
  measurements: {
    chestCircumference: number;
    bodyLength: number;
    shoulderWidth: number;
    armLength: number;
    wristCircumference: number;
    bicepCircumference: number;
    hipCircumference: number;
  };
}

export const SIZE_PRESETS: Record<string, SizePreset> = {
  XS: {
    label: "XS (Tour de poitrine ~82cm)",
    labelEn: "XS (Chest ~82cm)",
    measurements: {
      chestCircumference: 82,
      bodyLength: 58,
      shoulderWidth: 38,
      armLength: 58,
      wristCircumference: 15,
      bicepCircumference: 26,
      hipCircumference: 88,
    },
  },
  S: {
    label: "S (Tour de poitrine ~88cm)",
    labelEn: "S (Chest ~88cm)",
    measurements: {
      chestCircumference: 88,
      bodyLength: 60,
      shoulderWidth: 40,
      armLength: 59,
      wristCircumference: 16,
      bicepCircumference: 28,
      hipCircumference: 94,
    },
  },
  M: {
    label: "M (Tour de poitrine ~96cm)",
    labelEn: "M (Chest ~96cm)",
    measurements: {
      chestCircumference: 96,
      bodyLength: 62,
      shoulderWidth: 43,
      armLength: 60,
      wristCircumference: 17,
      bicepCircumference: 30,
      hipCircumference: 102,
    },
  },
  L: {
    label: "L (Tour de poitrine ~104cm)",
    labelEn: "L (Chest ~104cm)",
    measurements: {
      chestCircumference: 104,
      bodyLength: 64,
      shoulderWidth: 46,
      armLength: 61,
      wristCircumference: 18,
      bicepCircumference: 33,
      hipCircumference: 110,
    },
  },
  XL: {
    label: "XL (Tour de poitrine ~114cm)",
    labelEn: "XL (Chest ~114cm)",
    measurements: {
      chestCircumference: 114,
      bodyLength: 66,
      shoulderWidth: 49,
      armLength: 62,
      wristCircumference: 19,
      bicepCircumference: 36,
      hipCircumference: 120,
    },
  },
  XXL: {
    label: "XXL (Tour de poitrine ~124cm)",
    labelEn: "XXL (Chest ~124cm)",
    measurements: {
      chestCircumference: 124,
      bodyLength: 68,
      shoulderWidth: 52,
      armLength: 63,
      wristCircumference: 20,
      bicepCircumference: 39,
      hipCircumference: 130,
    },
  },
};

export const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export type SizeKey = (typeof SIZE_ORDER)[number];

/**
 * Check if a value differs from the preset by more than a threshold percentage
 */
export function hasSignificantChange(
  currentValue: number,
  presetValue: number,
  thresholdPercent: number = 5
): boolean {
  const diff = Math.abs(currentValue - presetValue);
  const percentDiff = (diff / presetValue) * 100;
  return percentDiff > thresholdPercent;
}

/**
 * Check if any measurement has been significantly modified from the preset
 */
export function hasAnySignificantChange(
  currentMeasurements: SizePreset["measurements"],
  presetMeasurements: SizePreset["measurements"],
  thresholdPercent: number = 5
): boolean {
  const keys = Object.keys(presetMeasurements) as (keyof SizePreset["measurements"])[];
  return keys.some((key) =>
    hasSignificantChange(currentMeasurements[key], presetMeasurements[key], thresholdPercent)
  );
}
