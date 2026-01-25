// ===========================================
// LA MAILLE - Calculateur de patron
// ===========================================

import type {
  GarmentAnalysis,
  Gauge,
  Measurements,
  YarnInfo,
  CalculationStep,
  PatternPiece,
  PatternInstruction,
  GeneratedPattern,
} from "./types";
import { tp, type Language } from "./i18n";

const isDev = process.env.NODE_ENV === "development";

function log(...args: unknown[]) {
  if (isDev) {
    console.log("[PatternCalculator]", ...args);
  }
}

// ===========================================
// FONCTIONS DE BASE
// ===========================================

/**
 * Calcule le nombre de mailles pour une longueur en cm
 */
export function stitchesForCm(cm: number, gauge: Gauge, lang: Language = "fr"): CalculationStep {
  const stitchesPerCm = gauge.stitchesPer10cm / 10;
  const result = cm * stitchesPerCm;
  const rounded = Math.round(result);

  log(`stitchesForCm: ${cm}cm × ${stitchesPerCm} m/cm = ${result} → ${rounded} mailles`);

  return {
    description: tp(lang, "pattern.stitchesFor", cm),
    formula: `${cm} cm × (${gauge.stitchesPer10cm} m / 10 cm) = ${result.toFixed(2)}`,
    result,
    rounded,
    roundingNote: result !== rounded ? tp(lang, "pattern.roundedFrom", result.toFixed(2), rounded) : undefined,
  };
}

/**
 * Calcule le nombre de rangs pour une longueur en cm
 */
export function rowsForCm(cm: number, gauge: Gauge, lang: Language = "fr"): CalculationStep {
  const rowsPerCm = gauge.rowsPer10cm / 10;
  const result = cm * rowsPerCm;
  const rounded = Math.round(result);

  log(`rowsForCm: ${cm}cm × ${rowsPerCm} r/cm = ${result} → ${rounded} rangs`);

  return {
    description: tp(lang, "pattern.rowsFor", cm),
    formula: `${cm} cm × (${gauge.rowsPer10cm} r / 10 cm) = ${result.toFixed(2)}`,
    result,
    rounded,
    roundingNote: result !== rounded ? tp(lang, "pattern.roundedFrom", result.toFixed(2), rounded) : undefined,
  };
}

/**
 * Arrondit un nombre au multiple le plus proche
 */
export function roundToMultiple(
  n: number,
  multiple: number,
  direction: "up" | "down" | "nearest"
): number {
  if (multiple === 0) return n;

  switch (direction) {
    case "up":
      return Math.ceil(n / multiple) * multiple;
    case "down":
      return Math.floor(n / multiple) * multiple;
    case "nearest":
    default:
      return Math.round(n / multiple) * multiple;
  }
}

/**
 * Calcule la fréquence des diminutions
 */
export function calculateDecreases(
  startSts: number,
  endSts: number,
  overRows: number,
  lang: Language = "fr"
): {
  totalDecreases: number;
  decreaseEveryNRows: number;
  remainder: number;
  instructions: string;
} {
  const totalDecreases = Math.abs(startSts - endSts);
  const decreasesPerSide = totalDecreases / 2;

  if (decreasesPerSide === 0) {
    return {
      totalDecreases: 0,
      decreaseEveryNRows: 0,
      remainder: 0,
      instructions: tp(lang, "pattern.knitStraightNoDecrease"),
    };
  }

  const decreaseEveryNRows = Math.floor(overRows / decreasesPerSide);
  const remainder = overRows % decreasesPerSide;

  log(`calculateDecreases: ${startSts} → ${endSts} sur ${overRows} rangs`);
  log(`  → ${decreasesPerSide} dim. de chaque côté, tous les ${decreaseEveryNRows} rangs`);

  let instructions: string;
  if (decreaseEveryNRows >= 2) {
    instructions = tp(lang, "pattern.decreaseEverySide", decreaseEveryNRows, decreasesPerSide);
    if (remainder > 0) {
      instructions += " " + tp(lang, "pattern.decreaseRemaining", remainder);
    }
  } else {
    instructions = tp(lang, "pattern.decreaseEveryRs", decreasesPerSide);
  }

  return {
    totalDecreases,
    decreaseEveryNRows,
    remainder,
    instructions,
  };
}

/**
 * Calcule la fréquence des augmentations
 */
export function calculateIncreases(
  startSts: number,
  endSts: number,
  overRows: number,
  lang: Language = "fr"
): {
  totalIncreases: number;
  increaseEveryNRows: number;
  remainder: number;
  instructions: string;
} {
  const totalIncreases = Math.abs(endSts - startSts);
  const increasesPerSide = totalIncreases / 2;

  if (increasesPerSide === 0) {
    return {
      totalIncreases: 0,
      increaseEveryNRows: 0,
      remainder: 0,
      instructions: tp(lang, "pattern.knitStraightNoIncrease"),
    };
  }

  const increaseEveryNRows = Math.floor(overRows / increasesPerSide);
  const remainder = overRows % increasesPerSide;

  log(`calculateIncreases: ${startSts} → ${endSts} sur ${overRows} rangs`);
  log(`  → ${increasesPerSide} aug. de chaque côté, tous les ${increaseEveryNRows} rangs`);

  let instructions: string;
  if (increaseEveryNRows >= 2) {
    instructions = tp(lang, "pattern.increaseEverySide", increaseEveryNRows, increasesPerSide);
    if (remainder > 0) {
      instructions += " " + tp(lang, "pattern.increaseStart", remainder);
    }
  } else {
    instructions = tp(lang, "pattern.increaseEveryRs", increasesPerSide);
  }

  return {
    totalIncreases,
    increaseEveryNRows,
    remainder,
    instructions,
  };
}

// ===========================================
// DÉTERMINER LE TYPE DE CONSTRUCTION
// ===========================================

type ConstructionType = "seamless" | "flat-pieces";

/**
 * Détermine si on peut tricoter en rond (seamless) ou s'il faut des pièces à plat
 */
function determineConstruction(analysis: GarmentAnalysis): ConstructionType {
  // Un cardigan nécessite une ouverture devant = pièces à plat
  if (analysis.garment.type === "cardigan") {
    return "flat-pieces";
  }

  // Un gilet peut être en rond
  if (analysis.garment.type === "gilet") {
    return "seamless";
  }

  // Pour un pull, on préfère le seamless sauf si explicitement "pieces-assemblees"
  // et haute confiance dans cette détection
  if (
    analysis.construction.method === "pieces-assemblees" &&
    analysis.construction.confidence > 0.85
  ) {
    return "flat-pieces";
  }

  // Par défaut, on privilégie le seamless (moins de coutures)
  return "seamless";
}

// ===========================================
// GÉNÉRATEURS - CONSTRUCTION SEAMLESS (EN ROND)
// ===========================================

/**
 * Génère le corps en rond (pull/gilet)
 */
function generateSeamlessBody(
  measurements: Measurements,
  gauge: Gauge,
  lang: Language
): PatternPiece {
  log("Generating seamless body...");

  const calculations: CalculationStep[] = [];
  const instructions: PatternInstruction[] = [];
  const warnings: string[] = [];

  // Tour de poitrine complet + aisance
  const fullCircumference = measurements.chestCircumference + measurements.ease;
  const castOnCalc = stitchesForCm(fullCircumference, gauge, lang);
  calculations.push(castOnCalc);

  // Arrondir au multiple de 4 pour les côtes
  const castOn = roundToMultiple(castOnCalc.rounded, 4, "nearest");
  log(`Seamless body cast on: ${castOn} mailles (${fullCircumference} cm)`);

  // Hauteur totale jusqu'aux emmanchures
  const armholeDepth = 22; // cm
  const bodyLengthToArmhole = measurements.bodyLength - armholeDepth;
  const bodyRowsCalc = rowsForCm(bodyLengthToArmhole, gauge, lang);
  calculations.push(bodyRowsCalc);

  // Côtes du bas
  const ribHeight = 5;
  const ribRowsCalc = rowsForCm(ribHeight, gauge, lang);
  calculations.push(ribRowsCalc);
  const ribRows = ribRowsCalc.rounded;

  let currentRow = 1;

  // Instructions montage en rond
  instructions.push({
    rowStart: currentRow,
    rowEnd: ribRows,
    text: tp(lang, "pattern.castOnCircular", castOn, ribRows),
    notes: tp(lang, "pattern.circumferenceNote", fullCircumference),
  });
  currentRow = ribRows + 1;

  // Corps en jersey jusqu'aux emmanchures
  const bodyRows = bodyRowsCalc.rounded - ribRows;
  instructions.push({
    rowStart: currentRow,
    rowEnd: currentRow + bodyRows - 1,
    text: tp(lang, "pattern.continueStockinette", bodyRows),
    notes: tp(lang, "pattern.bodyHeightNote", bodyLengthToArmhole - ribHeight),
  });
  currentRow += bodyRows;

  // Séparation devant/dos pour les emmanchures
  const halfSts = castOn / 2;
  const armholeSts = Math.round(halfSts * 0.08); // ~8% de chaque côté pour emmanchure

  instructions.push({
    rowStart: currentRow,
    rowEnd: currentRow,
    text: tp(lang, "pattern.armholeSeparation", halfSts - armholeSts, armholeSts * 2, halfSts - armholeSts * 2, armholeSts * 2),
    notes: tp(lang, "pattern.stitchesOnHold"),
  });

  // Ajouter marqueur pour le milieu
  warnings.push(tp(lang, "pattern.markerNote"));

  // Calcul total des rangs (corps + partie haute)
  const armholeRowsCalc = rowsForCm(armholeDepth, gauge, lang);
  const totalRows = bodyRowsCalc.rounded + armholeRowsCalc.rounded;

  return {
    name: tp(lang, "pattern.bodyInRound"),
    castOn,
    totalRows,
    instructions,
    calculations,
    warnings,
  };
}

/**
 * Génère l'empiècement (yoke) pour construction top-down ou finition du seamless
 */
function generateYoke(
  measurements: Measurements,
  gauge: Gauge,
  analysis: GarmentAnalysis,
  bodySts: number,
  lang: Language
): PatternPiece {
  log("Generating yoke...");

  const calculations: CalculationStep[] = [];
  const instructions: PatternInstruction[] = [];
  const warnings: string[] = [];

  const armholeDepth = 22;
  const armholeRowsCalc = rowsForCm(armholeDepth, gauge, lang);
  calculations.push(armholeRowsCalc);
  const yokeRows = armholeRowsCalc.rounded;

  const halfSts = bodySts / 2;
  const armholeSts = Math.round(halfSts * 0.08);
  const workingSts = bodySts - armholeSts * 4; // Mailles restantes après mise en attente

  let currentRow = 1;

  if (analysis.sleeves.type === "raglan") {
    // Construction raglan
    const raglanDecPerRound = 8; // 4 lignes de raglan × 2 dim
    const totalRaglanDec = Math.round(workingSts * 0.6);
    const raglanRounds = Math.round(totalRaglanDec / raglanDecPerRound);

    instructions.push({
      rowStart: currentRow,
      rowEnd: currentRow + raglanRounds - 1,
      text: tp(lang, "pattern.raglanYoke", workingSts, raglanRounds),
      notes: tp(lang, "pattern.raglanMarkers"),
    });
    currentRow += raglanRounds;

    // Encolure
    const neckSts = workingSts - totalRaglanDec;
    instructions.push({
      rowStart: currentRow,
      rowEnd: currentRow + 10,
      text: tp(lang, "pattern.necklineRemaining", neckSts),
    });
  } else {
    // Construction classique avec emmanchures
    instructions.push({
      rowStart: currentRow,
      rowEnd: currentRow + 3,
      text: tp(lang, "pattern.backAndFrontSeparate", halfSts - armholeSts * 2),
    });
    currentRow += 4;

    instructions.push({
      rowStart: currentRow,
      rowEnd: yokeRows - 10,
      text: tp(lang, "pattern.continueStraightUntil", yokeRows - 10),
    });

    // Épaules et encolure
    const shoulderSts = Math.round(measurements.shoulderWidth * gauge.stitchesPer10cm / 10 / 2);
    const neckSts = halfSts - armholeSts * 2 - shoulderSts * 2;

    instructions.push({
      rowStart: yokeRows - 9,
      rowEnd: yokeRows,
      text: tp(lang, "pattern.shouldersBindOff", shoulderSts, neckSts),
    });
  }

  // Finition encolure
  if (analysis.neckline.type === "ras-du-cou") {
    warnings.push(tp(lang, "pattern.pickUpNeckCrewneck"));
  } else if (analysis.neckline.type === "col-v") {
    warnings.push(tp(lang, "pattern.pickUpNeckVneck"));
  }

  return {
    name: tp(lang, "pattern.yoke"),
    castOn: workingSts,
    totalRows: yokeRows,
    instructions,
    calculations,
    warnings,
  };
}

/**
 * Génère les manches en rond
 */
function generateSeamlessSleeves(
  measurements: Measurements,
  gauge: Gauge,
  analysis: GarmentAnalysis,
  lang: Language
): PatternPiece {
  log("Generating seamless sleeves...");

  const calculations: CalculationStep[] = [];
  const instructions: PatternInstruction[] = [];
  const warnings: string[] = [];

  if (analysis.sleeves.type === "sans-manches" || analysis.sleeves.length === "sans") {
    return {
      name: tp(lang, "pattern.sleeveX2InRound"),
      castOn: 0,
      totalRows: 0,
      instructions: [{ rowStart: 0, rowEnd: 0, text: tp(lang, "pattern.noSleeves") }],
      calculations: [],
      warnings: [tp(lang, "pattern.armholeBorderNote")],
    };
  }

  // Biceps (haut de manche)
  const bicepCalc = stitchesForCm(measurements.bicepCircumference + 6, gauge, lang);
  calculations.push(bicepCalc);
  const bicepSts = roundToMultiple(bicepCalc.rounded, 4, "nearest");

  // Poignet
  const wristCalc = stitchesForCm(measurements.wristCircumference + 2, gauge, lang);
  calculations.push(wristCalc);
  const wristSts = roundToMultiple(wristCalc.rounded, 4, "nearest");

  // Longueur manche
  let armLength = measurements.armLength;
  if (analysis.sleeves.length === "3-4") {
    armLength = armLength * 0.75;
  } else if (analysis.sleeves.length === "courtes") {
    armLength = armLength * 0.4;
  }

  const armLengthCalc = rowsForCm(armLength, gauge, lang);
  calculations.push(armLengthCalc);
  const totalRows = armLengthCalc.rounded;

  // Mailles du dessous de bras (venant du corps)
  const underarmSts = Math.round(bicepSts * 0.12);

  let currentRow = 1;

  // Relever les mailles
  instructions.push({
    rowStart: currentRow,
    rowEnd: currentRow,
    text: tp(lang, "pattern.pickUpSleeve", bicepSts - underarmSts, underarmSts, bicepSts),
    notes: tp(lang, "pattern.dpnNote"),
  });
  currentRow += 1;

  // Diminutions pour le poignet
  const sleeveBodyRows = totalRows - 15; // Moins les côtes
  const decreases = calculateDecreases(bicepSts, wristSts, sleeveBodyRows, lang);

  if (decreases.totalDecreases > 0) {
    instructions.push({
      rowStart: currentRow,
      rowEnd: currentRow + sleeveBodyRows - 1,
      text: tp(lang, "pattern.sleeveDecrease", decreases.instructions, wristSts),
      notes: tp(lang, "pattern.decreaseNote"),
    });
    currentRow += sleeveBodyRows;
  } else {
    instructions.push({
      rowStart: currentRow,
      rowEnd: currentRow + sleeveBodyRows - 1,
      text: tp(lang, "pattern.continueStockinetteFor", sleeveBodyRows),
    });
    currentRow += sleeveBodyRows;
  }

  // Côtes du poignet
  const ribRows = 15;
  instructions.push({
    rowStart: currentRow,
    rowEnd: totalRows,
    text: tp(lang, "pattern.cuffRib", ribRows, wristSts),
  });

  warnings.push(tp(lang, "pattern.knitTwoIdentical"));

  return {
    name: tp(lang, "pattern.sleeveX2InRound"),
    castOn: bicepSts,
    totalRows,
    instructions,
    calculations,
    warnings,
  };
}

// ===========================================
// GÉNÉRATEURS - CONSTRUCTION FLAT (PIÈCES)
// ===========================================

/**
 * Génère le panneau dos (à plat)
 */
export function generateBackPanel(
  measurements: Measurements,
  gauge: Gauge,
  analysis: GarmentAnalysis,
  lang: Language = "fr"
): PatternPiece {
  log("Generating back panel...");

  const calculations: CalculationStep[] = [];
  const instructions: PatternInstruction[] = [];
  const warnings: string[] = [];

  const backWidth = (measurements.chestCircumference + measurements.ease) / 2;
  const castOnCalc = stitchesForCm(backWidth, gauge, lang);
  calculations.push(castOnCalc);

  const castOn = roundToMultiple(castOnCalc.rounded, 2, "nearest");
  log(`Back panel cast on: ${castOn} mailles (${backWidth} cm)`);

  const totalLengthCalc = rowsForCm(measurements.bodyLength, gauge, lang);
  calculations.push(totalLengthCalc);
  const totalRows = totalLengthCalc.rounded;

  const ribHeight = 5;
  const ribRowsCalc = rowsForCm(ribHeight, gauge, lang);
  calculations.push(ribRowsCalc);
  const ribRows = ribRowsCalc.rounded;

  let currentRow = 1;

  instructions.push({
    rowStart: currentRow,
    rowEnd: ribRows,
    text: tp(lang, "pattern.castOnRib", castOn, ribRows),
    notes: tp(lang, "pattern.ribHeightNote", ribHeight),
  });
  currentRow = ribRows + 1;

  const bodyRows = totalRows - ribRows;

  if (analysis.sleeves.type === "montees") {
    const armholeDepth = 20;
    const armholeRowsCalc = rowsForCm(armholeDepth, gauge, lang);
    calculations.push(armholeRowsCalc);
    const armholeRows = armholeRowsCalc.rounded;

    const bodyBeforeArmhole = bodyRows - armholeRows;

    instructions.push({
      rowStart: currentRow,
      rowEnd: currentRow + bodyBeforeArmhole - 1,
      text: tp(lang, "pattern.continueStockinetteRows", bodyBeforeArmhole),
    });
    currentRow += bodyBeforeArmhole;

    const armholeBindOff = Math.round(castOn * 0.05);
    const armholeSts = castOn - armholeBindOff * 2;

    instructions.push({
      rowStart: currentRow,
      rowEnd: currentRow + 1,
      text: tp(lang, "pattern.armholeBindOff", armholeBindOff, armholeSts),
    });
    currentRow += 2;

    const armholeDecreases = Math.round(armholeSts * 0.03);
    if (armholeDecreases > 0) {
      instructions.push({
        rowStart: currentRow,
        rowEnd: currentRow + armholeDecreases * 2 - 1,
        text: tp(lang, "pattern.armholeDecrease", armholeDecreases, armholeSts - armholeDecreases * 2),
      });
      currentRow += armholeDecreases * 2;
    }

    const remainingArmholeRows = armholeRows - 2 - armholeDecreases * 2;
    if (remainingArmholeRows > 0) {
      instructions.push({
        rowStart: currentRow,
        rowEnd: currentRow + remainingArmholeRows - 1,
        text: tp(lang, "pattern.continueStraightRows", remainingArmholeRows),
      });
      currentRow += remainingArmholeRows;
    }

    const shoulderSts = Math.round(measurements.shoulderWidth * gauge.stitchesPer10cm / 10 / 2);
    const neckSts = armholeSts - armholeDecreases * 2 - shoulderSts * 2;

    instructions.push({
      rowStart: currentRow,
      rowEnd: currentRow + 3,
      text: tp(lang, "pattern.shoulderBindOff", Math.round(shoulderSts / 2), neckSts),
    });
  } else if (analysis.sleeves.type === "raglan") {
    const raglanDepth = 22;
    const raglanRowsCalc = rowsForCm(raglanDepth, gauge, lang);
    calculations.push(raglanRowsCalc);
    const raglanRows = raglanRowsCalc.rounded;

    const bodyBeforeRaglan = bodyRows - raglanRows;

    instructions.push({
      rowStart: currentRow,
      rowEnd: currentRow + bodyBeforeRaglan - 1,
      text: tp(lang, "pattern.continueStockinetteRows", bodyBeforeRaglan),
    });
    currentRow += bodyBeforeRaglan;

    const raglanDecreases = calculateDecreases(castOn, Math.round(castOn * 0.3), raglanRows, lang);
    instructions.push({
      rowStart: currentRow,
      rowEnd: currentRow + raglanRows - 1,
      text: `Raglan : ${raglanDecreases.instructions}`,
      notes: tp(lang, "pattern.raglanNote"),
    });
  } else {
    instructions.push({
      rowStart: currentRow,
      rowEnd: totalRows,
      text: tp(lang, "pattern.continueStockinetteRows", bodyRows),
    });

    const shoulderSts = Math.round(castOn / 3);
    instructions.push({
      rowStart: totalRows + 1,
      rowEnd: totalRows + 4,
      text: tp(lang, "pattern.shoulderSimple", shoulderSts),
    });
  }

  return {
    name: tp(lang, "pattern.back"),
    castOn,
    totalRows,
    instructions,
    calculations,
    warnings,
  };
}

/**
 * Génère les panneaux devant (à plat)
 */
export function generateFrontPanels(
  measurements: Measurements,
  gauge: Gauge,
  analysis: GarmentAnalysis,
  lang: Language = "fr"
): PatternPiece[] {
  log("Generating front panel(s)...");

  const isCardigan = analysis.garment.type === "cardigan";

  if (isCardigan) {
    return [
      generateCardiganFront(measurements, gauge, analysis, "gauche", lang),
      generateCardiganFront(measurements, gauge, analysis, "droit", lang),
    ];
  } else {
    return [generatePulloverFront(measurements, gauge, analysis, lang)];
  }
}

function generatePulloverFront(
  measurements: Measurements,
  gauge: Gauge,
  analysis: GarmentAnalysis,
  lang: Language
): PatternPiece {
  // Identique au dos mais avec encolure devant plus profonde
  const back = generateBackPanel(measurements, gauge, analysis, lang);

  // Modifier le nom et ajuster l'encolure
  const instructions = [...back.instructions];
  const lastInstruction = instructions[instructions.length - 1];

  // Creuser l'encolure devant plus tôt
  instructions[instructions.length - 1] = {
    ...lastInstruction,
    text: lastInstruction.text + " " + tp(lang, "pattern.frontNeckNote"),
  };

  return {
    ...back,
    name: tp(lang, "pattern.front"),
    instructions,
  };
}

function generateCardiganFront(
  measurements: Measurements,
  gauge: Gauge,
  analysis: GarmentAnalysis,
  side: "gauche" | "droit",
  lang: Language
): PatternPiece {
  const calculations: CalculationStep[] = [];
  const instructions: PatternInstruction[] = [];
  const warnings: string[] = [];

  const frontWidth = (measurements.chestCircumference + measurements.ease) / 4 + 2;
  const castOnCalc = stitchesForCm(frontWidth, gauge, lang);
  calculations.push(castOnCalc);
  const castOn = roundToMultiple(castOnCalc.rounded, 2, "nearest");

  const totalLengthCalc = rowsForCm(measurements.bodyLength, gauge, lang);
  calculations.push(totalLengthCalc);
  const totalRows = totalLengthCalc.rounded;

  const ribHeight = 5;
  const ribRowsCalc = rowsForCm(ribHeight, gauge, lang);
  const ribRows = ribRowsCalc.rounded;

  let currentRow = 1;

  instructions.push({
    rowStart: currentRow,
    rowEnd: ribRows,
    text: tp(lang, "pattern.castOnCuff", castOn, ribRows),
  });
  currentRow = ribRows + 1;

  // Bande de boutonnage
  const buttonBand = 6;
  instructions.push({
    rowStart: currentRow,
    rowEnd: currentRow,
    text: tp(lang, "pattern.buttonBandNote", buttonBand),
  });

  // Boutonnières pour le côté droit
  if (side === "droit" && analysis.closure.type === "boutons") {
    const buttonCount = analysis.closure.buttonCountEstimate || 5;
    const buttonSpacing = Math.round((totalRows - ribRows * 2) / (buttonCount + 1));

    warnings.push(tp(lang, "pattern.buttonholeNote", buttonCount, buttonSpacing));

    instructions.push({
      rowStart: currentRow,
      rowEnd: currentRow,
      text: tp(lang, "pattern.buttonholeRow", ribRows + buttonSpacing, buttonSpacing),
      notes: tp(lang, "pattern.buttonholeTotal", buttonCount),
    });
  }

  const bodyRows = totalRows - ribRows;

  if (analysis.sleeves.type === "montees") {
    const armholeDepth = 20;
    const armholeRowsCalc = rowsForCm(armholeDepth, gauge, lang);
    const armholeRows = armholeRowsCalc.rounded;
    const bodyBeforeArmhole = bodyRows - armholeRows;

    instructions.push({
      rowStart: currentRow,
      rowEnd: currentRow + bodyBeforeArmhole - 1,
      text: tp(lang, "pattern.continueExceptButtonBand", bodyBeforeArmhole),
    });
    currentRow += bodyBeforeArmhole;

    const armholeBindOff = Math.round(castOn * 0.08);
    const rowType = side === "gauche" ? tp(lang, "pattern.rsRow") : tp(lang, "pattern.wsRow");
    instructions.push({
      rowStart: currentRow,
      rowEnd: currentRow,
      text: tp(lang, "pattern.armholeBindOffSide", armholeBindOff, rowType),
    });
  }

  // Encolure
  const neckStartRow = totalRows - Math.round(totalRows * 0.15);
  const neckSts = Math.round(castOn * 0.25);

  if (analysis.neckline.type === "col-v") {
    instructions.push({
      rowStart: Math.round(totalRows * 0.6),
      rowEnd: totalRows,
      text: tp(lang, "pattern.vneckDecrease"),
    });
  } else {
    instructions.push({
      rowStart: neckStartRow,
      rowEnd: totalRows,
      text: tp(lang, "pattern.neckBindOff", neckSts),
    });
  }

  const sideName = side === "gauche" ? tp(lang, "pattern.frontLeft") : tp(lang, "pattern.frontRight");
  return {
    name: sideName,
    castOn,
    totalRows,
    instructions,
    calculations,
    warnings,
  };
}

/**
 * Génère les manches (à plat)
 */
export function generateSleeves(
  measurements: Measurements,
  gauge: Gauge,
  analysis: GarmentAnalysis,
  lang: Language = "fr"
): PatternPiece {
  log("Generating sleeves...");

  const calculations: CalculationStep[] = [];
  const instructions: PatternInstruction[] = [];
  const warnings: string[] = [];

  if (analysis.sleeves.type === "sans-manches" || analysis.sleeves.length === "sans") {
    return {
      name: tp(lang, "pattern.sleeveX2"),
      castOn: 0,
      totalRows: 0,
      instructions: [{ rowStart: 0, rowEnd: 0, text: tp(lang, "pattern.noSleeveSimple") }],
      calculations: [],
      warnings: [],
    };
  }

  const wristCalc = stitchesForCm(measurements.wristCircumference + 2, gauge, lang);
  calculations.push(wristCalc);
  const wristSts = roundToMultiple(wristCalc.rounded, 4, "nearest");

  const bicepCalc = stitchesForCm(measurements.bicepCircumference + 4, gauge, lang);
  calculations.push(bicepCalc);
  const bicepSts = roundToMultiple(bicepCalc.rounded, 2, "nearest");

  let armLength = measurements.armLength;
  if (analysis.sleeves.length === "3-4") {
    armLength = armLength * 0.75;
  } else if (analysis.sleeves.length === "courtes") {
    armLength = armLength * 0.4;
  }

  const armLengthCalc = rowsForCm(armLength, gauge, lang);
  calculations.push(armLengthCalc);
  const totalRows = armLengthCalc.rounded;

  let currentRow = 1;

  const ribHeight = 6;
  const ribRowsCalc = rowsForCm(ribHeight, gauge, lang);
  const ribRows = ribRowsCalc.rounded;

  instructions.push({
    rowStart: currentRow,
    rowEnd: ribRows,
    text: tp(lang, "pattern.castOnCuff", wristSts, ribRows),
    notes: tp(lang, "pattern.wristNote", measurements.wristCircumference + 2),
  });
  currentRow = ribRows + 1;

  const sleeveBodyRows = totalRows - ribRows;
  const increases = calculateIncreases(wristSts, bicepSts, sleeveBodyRows, lang);

  if (increases.totalIncreases > 0) {
    instructions.push({
      rowStart: currentRow,
      rowEnd: totalRows,
      text: tp(lang, "pattern.sleeveIncrease", increases.instructions, bicepSts),
      notes: tp(lang, "pattern.sleeveLengthNote", armLength),
    });
  } else {
    instructions.push({
      rowStart: currentRow,
      rowEnd: totalRows,
      text: tp(lang, "pattern.continueStockinetteFor", sleeveBodyRows),
    });
  }

  if (analysis.sleeves.type === "montees") {
    const capHeight = 12;
    const capRowsCalc = rowsForCm(capHeight, gauge, lang);
    const capRows = capRowsCalc.rounded;

    instructions.push({
      rowStart: totalRows + 1,
      rowEnd: totalRows + 2,
      text: tp(lang, "pattern.sleeveCapStart", Math.round(bicepSts * 0.05)),
    });

    const remainingSts = bicepSts - Math.round(bicepSts * 0.1);
    const capDecreases = calculateDecreases(remainingSts, Math.round(remainingSts * 0.3), capRows - 2, lang);

    instructions.push({
      rowStart: totalRows + 3,
      rowEnd: totalRows + capRows - 2,
      text: capDecreases.instructions,
    });

    instructions.push({
      rowStart: totalRows + capRows - 1,
      rowEnd: totalRows + capRows,
      text: tp(lang, "pattern.bindOffRemaining"),
    });
  }

  warnings.push(tp(lang, "pattern.knitTwoIdentical"));

  return {
    name: tp(lang, "pattern.sleeveX2"),
    castOn: wristSts,
    totalRows,
    instructions,
    calculations,
    warnings,
  };
}

/**
 * Génère les instructions d'encolure
 */
export function generateNeckline(
  measurements: Measurements,
  gauge: Gauge,
  analysis: GarmentAnalysis,
  lang: Language = "fr"
): { instructions: string[]; stitchesToBindOff: number } {
  log("Generating neckline instructions...");

  const neckWidth = 15;
  const neckStsCalc = stitchesForCm(neckWidth, gauge, lang);
  const stitchesToBindOff = neckStsCalc.rounded;

  const instructions: string[] = [];

  switch (analysis.neckline.type) {
    case "ras-du-cou":
      instructions.push(tp(lang, "pattern.crewneckBindOff", stitchesToBindOff));
      instructions.push(tp(lang, "pattern.crewneckDecrease"));
      instructions.push(tp(lang, "pattern.crewneckBorder"));
      break;

    case "col-v":
      instructions.push(tp(lang, "pattern.vneckDivide"));
      instructions.push(tp(lang, "pattern.vneckDecreaseInstr"));
      instructions.push(tp(lang, "pattern.vneckBorder"));
      break;

    case "bateau":
      instructions.push(tp(lang, "pattern.boatNeckBindOff", neckWidth));
      instructions.push(tp(lang, "pattern.boatNeckNote"));
      break;

    case "ouvert-cardigan":
      instructions.push(tp(lang, "pattern.openNeck"));
      instructions.push(tp(lang, "pattern.openNeckDecrease"));
      break;

    case "capuche":
      instructions.push(tp(lang, "pattern.hoodPickUp"));
      instructions.push(tp(lang, "pattern.hoodKnit"));
      instructions.push(tp(lang, "pattern.hoodSeam"));
      break;

    default:
      instructions.push(tp(lang, "pattern.defaultNeckBindOff", stitchesToBindOff));
      instructions.push(tp(lang, "pattern.finishShoulders"));
  }

  return { instructions, stitchesToBindOff };
}

// ===========================================
// ESTIMATION MÉTRAGE
// ===========================================

export function estimateYardage(
  measurements: Measurements,
  gauge: Gauge,
  yarn: YarnInfo
): { meters: number; grams: number; skeinsEstimate: string } {
  log("Estimating yardage...");

  const backSurface = (measurements.chestCircumference / 2) * measurements.bodyLength;
  const frontSurface = backSurface;
  const sleeveSurface = ((measurements.wristCircumference + measurements.bicepCircumference) / 2) * measurements.armLength * 2;
  const totalSurface = backSurface + frontSurface + sleeveSurface;

  log(`Surface totale estimée: ${totalSurface} cm²`);

  let stitchCoefficient = 1.0;
  switch (yarn.weight) {
    case "lace":
      stitchCoefficient = 0.6;
      break;
    case "fingering":
      stitchCoefficient = 0.7;
      break;
    case "sport":
      stitchCoefficient = 0.8;
      break;
    case "dk":
      stitchCoefficient = 1.0;
      break;
    case "worsted":
      stitchCoefficient = 1.2;
      break;
    case "aran":
      stitchCoefficient = 1.4;
      break;
    case "bulky":
      stitchCoefficient = 1.8;
      break;
  }

  const density = gauge.stitchesPer10cm * gauge.rowsPer10cm / 100;
  const baseGrams = (totalSurface / 100) * density * 0.4 * stitchCoefficient;

  const grams = Math.round(baseGrams * 1.15);
  const meters = Math.round(grams * 2);

  log(`Estimation: ${grams}g, ~${meters}m`);

  const low = Math.round(grams * 0.9);
  const high = Math.round(grams * 1.1);
  const skeinsEstimate = `${low}-${high}g environ`;

  return { meters, grams, skeinsEstimate };
}

// ===========================================
// FONCTION PRINCIPALE
// ===========================================

export function generateFullPattern(
  analysis: GarmentAnalysis,
  gauge: Gauge,
  measurements: Measurements,
  yarn: YarnInfo,
  lang: Language = "fr"
): GeneratedPattern {
  log("=== Generating full pattern ===");
  log("Analysis:", analysis.garment.type, analysis.construction.method);
  log("Gauge:", gauge);
  log("Measurements:", measurements);
  log("Language:", lang);

  const pieces: PatternPiece[] = [];
  const construction = determineConstruction(analysis);

  log("Construction type:", construction);

  if (construction === "seamless") {
    // Construction en rond - moins de pièces
    const body = generateSeamlessBody(measurements, gauge, lang);
    pieces.push(body);

    const yoke = generateYoke(measurements, gauge, analysis, body.castOn, lang);
    pieces.push(yoke);

    const sleeves = generateSeamlessSleeves(measurements, gauge, analysis, lang);
    if (sleeves.castOn > 0) {
      pieces.push(sleeves);
    }
  } else {
    // Construction en pièces à plat
    const backPanel = generateBackPanel(measurements, gauge, analysis, lang);
    pieces.push(backPanel);

    const frontPanels = generateFrontPanels(measurements, gauge, analysis, lang);
    pieces.push(...frontPanels);

    const sleeves = generateSleeves(measurements, gauge, analysis, lang);
    if (sleeves.castOn > 0) {
      pieces.push(sleeves);
    }
  }

  // Instructions d'assemblage adaptées
  const assembly: string[] = [];

  if (construction === "seamless") {
    assembly.push("1. " + tp(lang, "pattern.seamlessNote1"));
    assembly.push("2. " + tp(lang, "pattern.seamlessNote2"));
    assembly.push("3. " + tp(lang, "pattern.seamlessNote3"));
    if (analysis.garment.type !== "cardigan") {
      assembly.push("4. " + tp(lang, "pattern.seamlessNote4"));
    }
  } else {
    assembly.push("1. " + tp(lang, "pattern.flatNote1"));
    assembly.push("2. " + tp(lang, "pattern.flatNote2"));
    const hasSleeves = pieces.some(p => p.name.includes(tp(lang, "pattern.sleeveX2")) || p.name.includes("Manche") || p.name.includes("Sleeve"));
    if (hasSleeves) {
      assembly.push("3. " + tp(lang, "pattern.flatNote3Sleeves"));
      assembly.push("4. " + tp(lang, "pattern.flatNote4Sleeves"));
    } else {
      assembly.push("3. " + tp(lang, "pattern.flatNote3NoSleeves"));
    }
    if (analysis.garment.type !== "cardigan") {
      assembly.push("5. " + tp(lang, "pattern.flatNote5"));
    }
  }

  // Finitions
  const finishing: string[] = [];
  finishing.push("- " + tp(lang, "pattern.weavEnds"));
  finishing.push("- " + tp(lang, "pattern.blockGarment"));

  if (analysis.closure.type === "boutons") {
    finishing.push("- " + tp(lang, "pattern.sewButtons", analysis.closure.buttonCountEstimate || 5));
  } else if (analysis.closure.type === "zip") {
    finishing.push("- " + tp(lang, "pattern.sewZipper"));
  }

  const yardage = estimateYardage(measurements, gauge, yarn);

  const constructionNote = construction === "seamless"
    ? tp(lang, "pattern.constructionSeamless")
    : tp(lang, "pattern.constructionFlat");

  const limitationsText = analysis.limitations.length > 0
    ? tp(lang, "pattern.disclaimerLimitations", analysis.limitations.join(", "))
    : "";

  const disclaimer = `
${constructionNote}

${tp(lang, "pattern.disclaimerIntro")}
${tp(lang, "pattern.disclaimerWork")}
- ${tp(lang, "pattern.disclaimerSwatch")}
- ${tp(lang, "pattern.disclaimerYarn")}
- ${tp(lang, "pattern.disclaimerFit")}

${tp(lang, "pattern.disclaimerConfidence", analysis.overallConfidence)}
${limitationsText}

${tp(lang, "pattern.disclaimerAdvice")}
  `.trim();

  const pattern: GeneratedPattern = {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    analysis,
    gauge,
    measurements,
    yarn,
    pieces,
    assembly,
    finishing,
    estimatedYardage: yardage.grams,
    disclaimer,
  };

  log("=== Pattern generated successfully ===");
  log(`${pieces.length} pieces, construction: ${construction}, ~${yardage.grams}g yarn`);

  return pattern;
}
