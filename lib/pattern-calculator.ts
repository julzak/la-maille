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
  PieceSchematic,
} from "./types";
import { tp, type Language } from "./i18n";
import { calculateYarnNeeded } from "./yarn-calculator";
import {
  computeDims, distribute, distributeEven, armholeShape, sleeveCapShape, neckPerimeterCm, crewFrontNeckShape,
  stsFor, rowsFor, cmForSts, cmForRows, even,
  type GarmentDims, type NecklineKind, type Distribution,
} from "./shaping";

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
// FAÇONNAGE v2
// ===========================================
//
// Toutes les dimensions partagées (emmanchure, encolure, dessous de bras, biceps)
// viennent de computeDims() dans lib/shaping.ts ; chaque pièce lit les mêmes nombres,
// ce qui garantit que les pièces s'assemblent. Les textes d'instruction sont
// bilingues inline (même convention que generateNeckbandPiece historique).

type Txt = { fr: string; en: string };
const tx = (lang: Language, t: Txt) => (lang === "fr" ? t.fr : t.en);

type Family = "raglan-topdown" | "setin-pieces" | "setin-round" | "drop-pieces" | "sleeveless";

function chooseFamily(analysis: GarmentAnalysis): Family {
  const sleeves = analysis.sleeves.type;
  const noSleeves = sleeves === "sans-manches" || analysis.sleeves.length === "sans" || (analysis.garment.type === "gilet" && sleeves === "unknown");
  if (noSleeves) return "sleeveless";
  if (sleeves === "raglan") return "raglan-topdown";
  if (sleeves === "marteau") return "drop-pieces";
  // montees ou unknown
  if (analysis.garment.type === "cardigan") return "setin-pieces";
  if (analysis.construction.method === "pieces-assemblees" && analysis.construction.confidence > 0.85) return "setin-pieces";
  return "setin-round";
}

function necklineKind(analysis: GarmentAnalysis): NecklineKind {
  const n = analysis.neckline.type;
  if (analysis.garment.type === "cardigan" && (n === "unknown" || n === "ouvert-cardigan")) return "ras-du-cou";
  if (n === "capuche") return "ras-du-cou";
  if (n === "unknown") return "ras-du-cou";
  return n;
}

function isOpenFront(analysis: GarmentAnalysis): boolean {
  return analysis.garment.type === "cardigan";
}

/** "tous les 2 rangs 5 fois, puis tous les 3 rangs 4 fois" */
function distText(lang: Language, dist: Distribution, unit: "rows" | "rounds" = "rows"): string {
  const u = unit === "rounds" ? tx(lang, { fr: "tours", en: "rounds" }) : tx(lang, { fr: "rangs", en: "rows" });
  const parts = dist.segments.map((s) =>
    s.every === 1
      ? tx(lang, { fr: `à chaque ${unit === "rounds" ? "tour" : "rang"}, ${s.times} fois`, en: `every ${unit === "rounds" ? "round" : "row"}, ${s.times} ${s.times === 1 ? "time" : "times"}` })
      : tx(lang, { fr: `tous les ${s.every} ${u}, ${s.times} fois`, en: `every ${s.every} ${u}, ${s.times} ${s.times === 1 ? "time" : "times"}` })
  );
  return parts.join(tx(lang, { fr: ", puis ", en: ", then " }));
}

/** "12 rangs" / "1 rang" / "12 rows" / "1 row" */
function nRows(lang: Language, n: number, unit: "rows" | "rounds" = "rows"): string {
  const fr = unit === "rounds" ? "tour" : "rang";
  const en = unit === "rounds" ? "round" : "row";
  return lang === "fr" ? `${n} ${fr}${n > 1 ? "s" : ""}` : `${n} ${en}${n > 1 ? "s" : ""}`;
}

function shoulderSteps(shoulderSts: number): number[] {
  const n = shoulderSts >= 9 ? 3 : shoulderSts >= 4 ? 2 : 1;
  const base = Math.floor(shoulderSts / n);
  const extra = shoulderSts - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < extra ? 1 : 0));
}

function shoulderText(lang: Language, steps: number[]): string {
  return steps.length <= 1
    ? tx(lang, { fr: `rabattre les ${steps[0] ?? 0} m. d'épaule`, en: `bind off the ${steps[0] ?? 0} shoulder sts` })
    : tx(lang, {
        fr: `rabattre les mailles d'épaule en ${steps.length} fois (${steps.join(", ")} m.) au début des rangs côté emmanchure`,
        en: `bind off the shoulder sts in ${steps.length} steps (${steps.join(", ")} sts) at the beginning of armhole-side rows`,
      });
}

interface Ctx {
  d: GarmentDims;
  g: Gauge;
  analysis: GarmentAnalysis;
  lang: Language;
  neck: NecklineKind;
}

function calcSteps(ctx: Ctx): CalculationStep[] {
  const { d, g, lang } = ctx;
  const step = (desc: Txt, formula: string, result: number, rounded: number): CalculationStep => ({
    description: tx(lang, desc), formula, result, rounded,
    roundingNote: result !== rounded ? tp(lang, "pattern.roundedFrom", result.toFixed(2), rounded) : undefined,
  });
  return [
    step({ fr: "Tour de poitrine fini", en: "Finished chest" }, `${d.finishedChestCm} cm × ${g.stitchesPer10cm}/10`, d.finishedChestCm * g.stitchesPer10cm / 10, d.bodySts),
    step({ fr: "Carrure", en: "Cross back" }, `${d.crossBackCm} cm × ${g.stitchesPer10cm}/10`, d.crossBackCm * g.stitchesPer10cm / 10, d.crossBackSts),
    step({ fr: "Encolure dos", en: "Back neck" }, `${d.backNeckWidthCm.toFixed(1)} cm × ${g.stitchesPer10cm}/10`, d.backNeckWidthCm * g.stitchesPer10cm / 10, d.backNeckSts),
    step({ fr: "Profondeur d'emmanchure", en: "Armhole depth" }, `${d.armholeDepthCm.toFixed(1)} cm × ${g.rowsPer10cm}/10`, d.armholeDepthCm * g.rowsPer10cm / 10, d.armholeRows),
    step({ fr: "Tour de biceps fini", en: "Finished upper arm" }, `${d.bicepCm.toFixed(1)} cm × ${g.stitchesPer10cm}/10`, d.bicepCm * g.stitchesPer10cm / 10, d.bicepSts),
  ];
}

// -------------------------------------------
// Encolure devant bottom-up (pull ou un côté de cardigan)
// -------------------------------------------

function frontNeckInstructions(ctx: Ctx, startRow: number, side: "both" | "left" | "right", shoulderRows: number, selvedge = 0): PatternInstruction[] {
  const { d, lang, neck } = ctx;
  const out: PatternInstruction[] = [];
  const neckRows = d.frontNeckRows;
  if (neck === "col-v") {
    const perSide = d.backNeckSts / 2;
    const dist = distributeEven(perSide, Math.max(2, neckRows - shoulderRows));
    const sideTxt = side === "both"
      ? tx(lang, { fr: "Diviser le travail au centre et terminer chaque côté séparément. Côté encolure, ", en: "Divide the work at the center and finish each side separately. At the neck edge, " })
      : selvedge
        ? tx(lang, { fr: "Rabattre la m. lisière, puis côté encolure, ", en: "Bind off the selvedge st, then at the neck edge, " })
        : tx(lang, { fr: "Côté encolure, ", en: "At the neck edge, " });
    out.push({
      rowStart: startRow, rowEnd: startRow + neckRows - shoulderRows - 1,
      text: tx(lang, { fr: `Col V : ${sideTxt}diminuer 1 m. ${distText(lang, dist)} (${perSide} m. par côté)${dist.straightRows > 0 ? `, puis ${nRows(lang, dist.straightRows)} droits` : ""}.`,
                       en: `V-neck: ${sideTxt}decrease 1 st ${distText(lang, dist)} (${perSide} sts per side)${dist.straightRows > 0 ? `, then ${nRows(lang, dist.straightRows)} straight` : ""}.` }),
      notes: dist.overflow > 0 ? tx(lang, { fr: `Attention : ${dist.overflow} diminutions n'ont pas pu être placées, creuser le V plus tôt.`, en: `Warning: ${dist.overflow} decreases could not be placed, start the V earlier.` }) : undefined,
    });
    return out;
  }
  const shape = crewFrontNeckShape(d, shoulderRows);
  if (side === "both") {
    out.push({
      rowStart: startRow, rowEnd: startRow,
      text: tx(lang, { fr: `Encolure : rabattre les ${shape.centerBindOff} m. centrales et terminer chaque côté séparément.`, en: `Neckline: bind off the center ${shape.centerBindOff} sts and finish each side separately.` }),
    });
  } else {
    out.push({
      rowStart: startRow, rowEnd: startRow,
      text: tx(lang, { fr: `Encolure : rabattre ${shape.centerBindOff / 2 + selvedge} m. côté encolure${selvedge ? " (lisière comprise)" : ""}.`, en: `Neckline: bind off ${shape.centerBindOff / 2 + selvedge} sts at the neck edge${selvedge ? " (selvedge included)" : ""}.` }),
    });
  }
  if (shape.sideDecreases > 0) {
    out.push({
      rowStart: startRow + 1, rowEnd: startRow + shape.dist.rowsUsed,
      text: tx(lang, { fr: `Côté encolure, diminuer 1 m. ${distText(lang, shape.dist)}.`, en: `At the neck edge, decrease 1 st ${distText(lang, shape.dist)}.` }),
    });
  }
  const straight = shape.dist.straightRows;
  if (straight > 0) {
    out.push({
      rowStart: startRow + 1 + shape.dist.rowsUsed, rowEnd: startRow + shape.dist.rowsUsed + straight,
      text: tx(lang, { fr: `Continuer droit pendant ${nRows(lang, straight)}.`, en: `Continue straight for ${nRows(lang, straight)}.` }),
    });
  }
  return out;
}

// -------------------------------------------
// Corps bottom-up à plat (dos, devant, demi-devant)
// -------------------------------------------

interface FlatPieceOpts {
  kind: "back" | "front" | "front-left" | "front-right";
  armholeKind: "setin" | "drop" | "setin-after-round";
}

function generateFlatBodyPiece(ctx: Ctx, opts: FlatPieceOpts): PatternPiece {
  const { d, g, lang } = ctx;
  const instructions: PatternInstruction[] = [];
  const warnings: string[] = [];
  const half = opts.kind === "front-left" || opts.kind === "front-right";
  // Demi-devant : si le demi-corps est impair, 1 m. lisière côté ouverture (hors épaules et encolure).
  const selvedge = half && (d.backSts / 2) % 2 === 1 ? 1 : 0;
  const castOn = half ? d.backSts / 2 + selvedge : d.backSts;
  const arm = armholeShape(d, g);
  const steps = shoulderSteps(d.shoulderSts);
  const shoulderRows = steps.length * 2;
  const isBack = opts.kind === "back";
  const neckRows = isBack ? shoulderRows : d.frontNeckRows;
  const afterRound = opts.armholeKind === "setin-after-round";
  // Dernier rang de la pièce : tout le séquencement est calé dessus, pour que dos et devants aient la même hauteur.
  const endRow = afterRound ? d.armholeRows + 1 : d.bodyRows;
  const shoulderStart = endRow - shoulderRows + 1;
  const neckStart = endRow - neckRows + 1;

  let row = 1;
  if (afterRound) {
    instructions.push({
      rowStart: row, rowEnd: row,
      text: tx(lang, { fr: `Reprendre les ${castOn - 2 * arm.bindOffSts} m. ${isBack ? "du dos" : "du devant"} laissées en attente après la séparation (les ${arm.bindOffSts} m. de dessous de bras de chaque côté sont déjà rabattues).`,
                       en: `Resume the ${castOn - 2 * arm.bindOffSts} ${isBack ? "back" : "front"} sts left on hold after the separation (the ${arm.bindOffSts} underarm sts on each side are already bound off).` }),
    });
    row++;
  } else {
    instructions.push({
      rowStart: row, rowEnd: d.hemRows,
      text: tx(lang, { fr: `Monter ${castOn} m. Tricoter ${d.hemRows} rangs en côtes 2/2${selvedge ? " (la 1re m. côté ouverture reste une m. lisière)" : ""}.`, en: `Cast on ${castOn} sts. Work ${d.hemRows} rows in 2x2 rib${selvedge ? " (the first st on the opening side is a selvedge st)" : ""}.` }),
      notes: tx(lang, { fr: `Largeur : ${cmForSts(castOn, g).toFixed(1)} cm`, en: `Width: ${cmForSts(castOn, g).toFixed(1)} cm` }),
    });
    row = d.hemRows + 1;
    const straightToArmhole = d.bodyRows - d.hemRows - d.armholeRows;
    if (straightToArmhole < 0) warnings.push(tx(lang, { fr: "Longueur de corps trop courte pour la profondeur d'emmanchure : allongez le corps.", en: "Body length is too short for the armhole depth: lengthen the body." }));
    instructions.push({
      rowStart: row, rowEnd: row + Math.max(0, straightToArmhole) - 1,
      text: tx(lang, { fr: `Continuer en jersey pendant ${nRows(lang, Math.max(0, straightToArmhole))} (jusqu'à ${cmForRows(d.bodyRows - d.armholeRows, g).toFixed(0)} cm depuis le bord).`, en: `Continue in stockinette for ${nRows(lang, Math.max(0, straightToArmhole))} (to ${cmForRows(d.bodyRows - d.armholeRows, g).toFixed(0)} cm from the edge).` }),
    });
    row += Math.max(0, straightToArmhole);
  }

  // Emmanchures
  let stsNow = castOn;
  let dropNote: string | undefined;
  if (opts.armholeKind === "drop") {
    dropNote = tx(lang, { fr: `Placer un marqueur de chaque côté au début de ces rangs : début des emmanchures (épaules tombantes, pas de façonnage).`, en: `Place a marker at each side at the start of these rows: armhole start (drop shoulder, no shaping).` });
  } else {
    const sides = half ? 1 : 2;
    if (opts.armholeKind === "setin") {
      instructions.push({
        rowStart: row, rowEnd: row + sides - 1,
        text: half
          ? tx(lang, { fr: `Emmanchure : rabattre ${arm.bindOffSts} m. côté emmanchure au début du prochain rang ${opts.kind === "front-left" ? "endroit" : "envers"}.`, en: `Armhole: bind off ${arm.bindOffSts} sts at the armhole edge at the beginning of the next ${opts.kind === "front-left" ? "RS" : "WS"} row.` })
          : tx(lang, { fr: `Emmanchures : rabattre ${arm.bindOffSts} m. au début des 2 prochains rangs.`, en: `Armholes: bind off ${arm.bindOffSts} sts at the beginning of the next 2 rows.` }),
      });
      row += sides;
      stsNow -= arm.bindOffSts * sides;
    } else {
      stsNow -= arm.bindOffSts * 2;
    }
    if (arm.decreases > 0) {
      instructions.push({
        rowStart: row, rowEnd: row + arm.decreaseDist.rowsUsed - 1,
        text: tx(lang, { fr: `Diminuer 1 m. ${half ? "côté emmanchure" : "de chaque côté"} ${distText(lang, arm.decreaseDist)}. Il reste ${stsNow - arm.decreases * sides} m.`, en: `Decrease 1 st ${half ? "at the armhole edge" : "each side"} ${distText(lang, arm.decreaseDist)}. ${stsNow - arm.decreases * sides} sts remain.` }),
      });
      row += arm.decreaseDist.rowsUsed;
      stsNow -= arm.decreases * sides;
    }
  }
  // `row` = premier rang après le façonnage d'emmanchure ; stsNow = mailles à l'épaule + encolure (+ lisière)

  // Partie droite jusqu'au début de l'encolure (devant) ou des épaules (dos)
  const sectionStart = isBack ? shoulderStart : neckStart;
  const straightRows = sectionStart - row;
  if (straightRows > 0) {
    instructions.push({
      rowStart: row, rowEnd: sectionStart - 1,
      text: tx(lang, { fr: `Continuer droit pendant ${nRows(lang, straightRows)} sur ${stsNow} m.`, en: `Continue straight for ${nRows(lang, straightRows)} on ${stsNow} sts.` }),
      notes: dropNote,
    });
  }
  const overlap = straightRows < 0; // l'encolure commence pendant le façonnage d'emmanchure : "en même temps"

  const shoulderPerSide = opts.armholeKind === "drop"
    ? (stsNow - selvedge - (half ? d.backNeckSts / 2 : d.backNeckSts)) / (half ? 1 : 2)
    : d.shoulderSts;
  if (isBack) {
    instructions.push({
      rowStart: shoulderStart, rowEnd: endRow,
      text: tx(lang, { fr: `Encolure dos et épaules : rabattre les ${stsNow - 2 * shoulderPerSide} m. centrales, puis de chaque côté ${shoulderText(lang, shoulderSteps(shoulderPerSide))}.`, en: `Back neck and shoulders: bind off the center ${stsNow - 2 * shoulderPerSide} sts, then on each side ${shoulderText(lang, shoulderSteps(shoulderPerSide))}.` }),
    });
  } else {
    const side = half ? (opts.kind === "front-left" ? "left" : "right") : "both";
    const neckIns = frontNeckInstructions(ctx, neckStart, side, shoulderRows, selvedge);
    if (overlap) {
      const prefix = tx(lang, { fr: "En même temps que les diminutions d'emmanchure : ", en: "At the same time as the armhole decreases: " });
      neckIns.forEach((i) => { i.text = prefix + i.text; });
      warnings.push(tx(lang, { fr: `L'encolure devant commence au rang ${neckStart}, pendant le façonnage d'emmanchure : mener les deux en même temps.`, en: `The front neck starts on row ${neckStart}, during the armhole shaping: work both at the same time.` }));
    }
    instructions.push(...neckIns);
    instructions.push({
      rowStart: shoulderStart, rowEnd: endRow,
      text: tx(lang, { fr: `Épaule${half ? "" : "s"} : ${shoulderText(lang, shoulderSteps(shoulderPerSide))}.`, en: `Shoulder${half ? "" : "s"}: ${shoulderText(lang, shoulderSteps(shoulderPerSide))}.` }),
    });
  }

  const name = { back: { fr: "Dos", en: "Back" }, front: { fr: "Devant", en: "Front" }, "front-left": { fr: "Devant gauche", en: "Left front" }, "front-right": { fr: "Devant droit", en: "Right front" } }[opts.kind];
  const schematic: PieceSchematic = {
    kind: half ? "cardigan-front" : "panel",
    widthCm: cmForSts(castOn, g),
    lengthCm: cmForRows(endRow, g),
    armholeDepthCm: d.armholeDepthCm,
    shoulderWidthCm: opts.armholeKind === "drop" ? cmForSts(castOn, g) : half ? d.crossBackCm / 2 : d.crossBackCm,
    necklineWidthCm: half ? d.backNeckWidthCm / 2 : d.backNeckWidthCm,
    necklineDepthCm: isBack ? 1.5 : d.frontNeckDropCm,
    isFront: !isBack,
  };
  return {
    name: tx(lang, name) + (afterRound ? tx(lang, { fr: " (à plat, après séparation)", en: " (flat, after separation)" }) : ""),
    castOn: afterRound ? castOn - 2 * arm.bindOffSts : castOn,
    totalRows: endRow,
    instructions,
    calculations: isBack ? calcSteps(ctx) : [],
    warnings,
    schematic,
  };
}

// -------------------------------------------
// Manche bottom-up à plat (montée, ou droite pour épaules tombantes)
// -------------------------------------------

function generateFlatSleeve(ctx: Ctx, kind: "setin" | "drop"): PatternPiece {
  const { d, g, lang } = ctx;
  const instructions: PatternInstruction[] = [];
  const warnings: string[] = [];
  const calculations: CalculationStep[] = [];
  const topSts = kind === "drop" ? even(stsFor(d.armholeDepthCm * 2, g)) : d.bicepSts;
  const overhangCm = kind === "drop" ? Math.max(0, (cmForSts(d.backSts, g) - d.crossBackCm) / 2) : 0;
  const sleeveRows = kind === "drop" ? rowsFor(Math.max(10, d.underarmToWristCm + d.armholeDepthCm - overhangCm), g) : d.sleeveRows;

  let row = 1;
  instructions.push({
    rowStart: row, rowEnd: d.cuffRows,
    text: tx(lang, { fr: `Monter ${d.wristSts} m. Tricoter ${d.cuffRows} rangs en côtes 2/2.`, en: `Cast on ${d.wristSts} sts. Work ${d.cuffRows} rows in 2x2 rib.` }),
    notes: tx(lang, { fr: `Tour de poignet : ${d.wristCm} cm`, en: `Wrist: ${d.wristCm} cm` }),
  });
  row = d.cuffRows + 1;
  const incPerSide = (topSts - d.wristSts) / 2;
  const incRows = sleeveRows - d.cuffRows - 2;
  const inc = distributeEven(incPerSide, Math.max(2, incRows));
  if (inc.overflow > 0) warnings.push(tx(lang, { fr: `Manche trop courte pour ${incPerSide} augmentations par côté : ${inc.overflow} augmentations manquantes, allongez la manche ou augmentez 2 m. par côté sur certains rangs.`, en: `Sleeve too short for ${incPerSide} increases per side: ${inc.overflow} increases missing, lengthen the sleeve or increase 2 sts per side on some rows.` }));
  instructions.push({
    rowStart: row, rowEnd: sleeveRows,
    text: incPerSide > 0
      ? tx(lang, { fr: `Augmenter 1 m. de chaque côté ${distText(lang, inc)}${inc.straightRows + 2 > 0 ? `, puis ${nRows(lang, inc.straightRows + 2)} droits` : ""}. On obtient ${topSts} m.`, en: `Increase 1 st each side ${distText(lang, inc)}${inc.straightRows + 2 > 0 ? `, then ${nRows(lang, inc.straightRows + 2)} straight` : ""}. ${topSts} sts.` })
      : tx(lang, { fr: `Continuer droit pendant ${nRows(lang, sleeveRows - d.cuffRows)} sur ${topSts} m.`, en: `Continue straight for ${nRows(lang, sleeveRows - d.cuffRows)} on ${topSts} sts.` }),
    notes: tx(lang, { fr: `Longueur du poignet au dessous de bras : ${cmForRows(sleeveRows, g).toFixed(0)} cm`, en: `Length from cuff to underarm: ${cmForRows(sleeveRows, g).toFixed(0)} cm` }),
  });
  row = sleeveRows + 1;
  let totalRows = sleeveRows;

  if (kind === "setin") {
    const arm = armholeShape(d, g);
    const cap = sleeveCapShape(d, g, arm);
    calculations.push({
      description: tx(lang, { fr: "Contrôle tête de manche / emmanchure", en: "Sleeve cap / armhole check" }),
      formula: tx(lang, { fr: `bord de tête ${(cap.perimeterCm + cmForSts(cap.finalBindOff, g) / 2).toFixed(1)} cm vs emmanchure ${cap.armholePerimeterCm.toFixed(1)} cm (par côté)`, en: `cap edge ${(cap.perimeterCm + cmForSts(cap.finalBindOff, g) / 2).toFixed(1)} cm vs armhole ${cap.armholePerimeterCm.toFixed(1)} cm (per side)` }),
      result: cap.diffCm, rounded: Math.round(cap.diffCm * 10) / 10,
    });
    if (!Number.isFinite(cap.diffCm) || Math.abs(cap.diffCm) > 2.5) {
      warnings.push(tx(lang, { fr: `Le bord de la tête de manche diffère de l'emmanchure de ${Number.isFinite(cap.diffCm) ? cap.diffCm.toFixed(1) : "?"} cm : vérifiez en épinglant la manche avant de coudre, ajustez la hauteur de tête si besoin.`, en: `The sleeve cap edge differs from the armhole by ${Number.isFinite(cap.diffCm) ? cap.diffCm.toFixed(1) : "?"} cm: pin the sleeve before seaming and adjust the cap height if needed.` }));
    }
    instructions.push({
      rowStart: row, rowEnd: row + 1,
      text: tx(lang, { fr: `Tête de manche : rabattre ${cap.bindOffSts} m. au début des 2 prochains rangs. Il reste ${topSts - 2 * cap.bindOffSts} m.`, en: `Sleeve cap: bind off ${cap.bindOffSts} sts at the beginning of the next 2 rows. ${topSts - 2 * cap.bindOffSts} sts remain.` }),
    });
    row += 2;
    const shapingRows = Math.max(2, cap.capRows - 4);
    instructions.push({
      rowStart: row, rowEnd: row + shapingRows - 1,
      text: tx(lang, { fr: `Diminuer 1 m. de chaque côté ${distText(lang, cap.decreaseDist)}${cap.decreaseDist.straightRows > 0 ? `, puis ${nRows(lang, cap.decreaseDist.straightRows)} droits` : ""}. Il reste ${cap.finalBindOff} m.`, en: `Decrease 1 st each side ${distText(lang, cap.decreaseDist)}${cap.decreaseDist.straightRows > 0 ? `, then ${nRows(lang, cap.decreaseDist.straightRows)} straight` : ""}. ${cap.finalBindOff} sts remain.` }),
      notes: tx(lang, { fr: `Hauteur de tête : ${cmForRows(cap.capRows, g).toFixed(0)} cm`, en: `Cap height: ${cmForRows(cap.capRows, g).toFixed(0)} cm` }),
    });
    row += shapingRows;
    instructions.push({
      rowStart: row, rowEnd: row + 1,
      text: tx(lang, { fr: `Rabattre les ${cap.finalBindOff} m. restantes.`, en: `Bind off the remaining ${cap.finalBindOff} sts.` }),
    });
    totalRows = sleeveRows + cap.capRows;
  } else {
    instructions.push({
      rowStart: row, rowEnd: row,
      text: tx(lang, { fr: `Rabattre souplement les ${topSts} m. (haut de manche droit, largeur ${cmForSts(topSts, g).toFixed(0)} cm = 2 × profondeur d'emmanchure).`, en: `Bind off the ${topSts} sts loosely (straight sleeve top, width ${cmForSts(topSts, g).toFixed(0)} cm = 2 × armhole depth).` }),
    });
    totalRows = sleeveRows + 1;
  }

  warnings.push(tp(lang, "pattern.knitTwoIdentical"));
  return {
    name: tp(lang, "pattern.sleeveX2"),
    castOn: d.wristSts,
    totalRows,
    instructions,
    calculations,
    warnings,
    schematic: { kind: "sleeve", widthCm: cmForSts(topSts, g), lengthCm: cmForRows(totalRows, g), sleeveTopWidthCm: cmForSts(topSts, g), sleeveCuffWidthCm: cmForSts(d.wristSts, g) },
  };
}

// -------------------------------------------
// Corps en rond jusqu'aux emmanchures (famille setin-round)
// -------------------------------------------

function generateRoundBodyToUnderarm(ctx: Ctx): PatternPiece {
  const { d, g, lang } = ctx;
  const arm = armholeShape(d, g);
  const instructions: PatternInstruction[] = [];
  const warnings: string[] = [];
  const straight = d.bodyRows - d.hemRows - d.armholeRows;
  if (straight < 0) warnings.push(tx(lang, { fr: "Longueur de corps trop courte pour la profondeur d'emmanchure : allongez le corps.", en: "Body length is too short for the armhole depth: lengthen the body." }));
  instructions.push({
    rowStart: 1, rowEnd: d.hemRows,
    text: tp(lang, "pattern.castOnCircular", d.bodySts, d.hemRows),
    notes: tp(lang, "pattern.circumferenceNote", d.finishedChestCm),
  });
  instructions.push({
    rowStart: d.hemRows + 1, rowEnd: d.hemRows + Math.max(0, straight),
    text: tp(lang, "pattern.continueStockinette", Math.max(0, straight)),
    notes: tx(lang, { fr: `Placer un marqueur après ${d.backSts} m. (côté) : dos = ${d.backSts} m., devant = ${d.backSts} m.`, en: `Place a marker after ${d.backSts} sts (side): back = ${d.backSts} sts, front = ${d.backSts} sts.` }),
  });
  instructions.push({
    rowStart: d.hemRows + Math.max(0, straight) + 1, rowEnd: d.hemRows + Math.max(0, straight) + 1,
    text: tx(lang, { fr: `Séparation : rabattre ${arm.bindOffSts} m. de chaque côté de chaque marqueur (${2 * arm.bindOffSts} m. par côté, ${4 * arm.bindOffSts} m. au total). Mettre les ${d.backSts - 2 * arm.bindOffSts} m. du devant en attente, continuer le dos à plat (voir pièce Dos), puis le devant.`, en: `Separation: bind off ${arm.bindOffSts} sts on each side of each marker (${2 * arm.bindOffSts} sts per side, ${4 * arm.bindOffSts} sts total). Put the ${d.backSts - 2 * arm.bindOffSts} front sts on hold, continue the back flat (see Back piece), then the front.` }),
  });
  return {
    name: tx(lang, { fr: "Corps (en rond jusqu'aux emmanchures)", en: "Body (in the round to the underarms)" }),
    castOn: d.bodySts,
    totalRows: d.hemRows + Math.max(0, straight) + 1,
    instructions,
    calculations: calcSteps(ctx),
    warnings,
    schematic: { kind: "tube", widthCm: cmForSts(d.bodySts, g) / 2, lengthCm: cmForRows(d.hemRows + Math.max(0, straight) + 1, g) },
  };
}

// -------------------------------------------
// Raglan top-down
// -------------------------------------------

interface RaglanPlan {
  B: number; S: number; U: number;
  Ib: number; Is: number;
  dist: Distribution;
  neckEdgeSteps: number; centerCastOn: number; // crew / cardigan
  vDist: Distribution | null; // col V
  bodyAtSep: number; sleeveAtSep: number;
  yokeRows: number;
}

function planRaglan(d: GarmentDims, neck: NecklineKind, openFront: boolean): { plan: RaglanPlan; warnings: Txt[] } {
  const warnings: Txt[] = [];
  const B = d.backNeckSts;
  const S = Math.max(4, even(Math.round(B * 0.35)));
  // Corps à la séparation : dos + devant (B + 2I chacun) + 4 m. raglan + 2 × U
  let Ib = Math.round((d.bodySts - 2 * B - 4 - 2 * d.underarmSts) / 4);
  let U = (d.bodySts - 2 * B - 4 - 4 * Ib) / 2;
  while (U < 2 && Ib > 0) { Ib--; U = (d.bodySts - 2 * B - 4 - 4 * Ib) / 2; }
  // Manche à la séparation : S + 2 Is + U, cible biceps
  let Is = Math.round((d.bicepSts - U - S) / 2);
  if (Is < 0) Is = 0;
  const rounds = Math.max(Ib, Is);
  // Rang 1 = montage, les augmentations se répartissent sur les yokeRows - 1 rangs suivants,
  // au plus une tous les 2 rangs. Si l'aisance demande plus de tours, l'empiècement s'approfondit
  // (c'est ce que font les patrons oversize) au lieu d'augmenter à chaque rang.
  let yokeRows = d.raglanYokeRows;
  let dist = distribute(rounds, yokeRows - 1, 2);
  if (dist.overflow > 0) {
    yokeRows = even(2 * rounds + 2);
    dist = distribute(rounds, yokeRows - 1, 2);
    warnings.push({ fr: `Empiècement approfondi pour loger ${rounds} tours d'augmentation (aisance importante) : ${yokeRows} rangs au lieu de ${d.raglanYokeRows}.`, en: `Yoke deepened to fit ${rounds} increase rounds (large ease): yoke depth ${yokeRows} rows instead of ${d.raglanYokeRows}.` });
  }
  // Encolure devant
  let neckEdgeSteps = 0, centerCastOn = 0, vDist: Distribution | null = null;
  if (neck === "col-v" && !openFront) {
    const perSide = (B - 2) / 2;
    const vRows = Math.min(d.frontNeckRows, d.raglanYokeRows - 2);
    vDist = distribute(perSide, vRows, 2);
  } else {
    const maxSteps = Math.max(0, d.frontNeckRows - 2);
    neckEdgeSteps = Math.min(maxSteps, Math.floor(((B - 2) * 2) / 3 / 2));
    if (neckEdgeSteps % 2 === 1) neckEdgeSteps--;
    centerCastOn = B - 2 - 2 * neckEdgeSteps;
  }
  const bodyAtSep = 2 * (B + 2 * Ib) + 4 + 2 * U;
  const sleeveAtSep = S + 2 * Is + U;
  return { plan: { B, S, U, Ib, Is, dist, neckEdgeSteps, centerCastOn, vDist, bodyAtSep, sleeveAtSep, yokeRows }, warnings };
}

function generateRaglanYoke(ctx: Ctx, plan: RaglanPlan, openFront: boolean, planWarnings: Txt[]): PatternPiece {
  const { d, g, lang } = ctx;
  const instructions: PatternInstruction[] = [];
  const warnings: string[] = planWarnings.map((w) => tx(lang, w));
  const { B, S, U, Ib, Is, dist } = plan;
  const isV = plan.vDist !== null;
  const castOn = B + 2 * S + 4 + 2; // dos + 2 manches + 4 raglan + 1 m. devant de chaque côté
  const common = Math.min(Ib, Is);

  instructions.push({
    rowStart: 1, rowEnd: 1,
    text: tx(lang, {
      fr: `Monter ${castOn} m. et répartir : 1 m. devant, 1 m. raglan, ${S} m. manche, 1 m. raglan, ${B} m. dos, 1 m. raglan, ${S} m. manche, 1 m. raglan, 1 m. devant. Placer un marqueur de chaque côté des 4 m. raglan. Travailler en allers-retours${openFront ? " (le cardigan reste ouvert devant)" : " le temps de façonner l'encolure devant"}.`,
      en: `Cast on ${castOn} sts and distribute: 1 front st, 1 raglan st, ${S} sleeve sts, 1 raglan st, ${B} back sts, 1 raglan st, ${S} sleeve sts, 1 raglan st, 1 front st. Place a marker on each side of the 4 raglan sts. Work back and forth${openFront ? " (the cardigan stays open at the front)" : " while shaping the front neck"}.`,
    }),
    notes: tx(lang, { fr: `Largeur d'encolure dos : ${d.backNeckWidthCm.toFixed(0)} cm`, en: `Back neck width: ${d.backNeckWidthCm.toFixed(0)} cm` }),
  });

  const unit = openFront ? "rows" : "rounds";
  const incText = tx(lang, {
    fr: `${openFront ? "Rang" : "Tour"} d'augmentation : augmenter 1 m. de chaque côté des 4 m. raglan (8 m. augmentées). Répéter ${distText(lang, dist, unit)}.`,
    en: `Increase ${openFront ? "row" : "round"}: increase 1 st on each side of the 4 raglan sts (8 sts increased). Repeat ${distText(lang, dist, unit)}.`,
  });
  const onlyText = Ib !== Is
    ? (Ib > Is
      ? tx(lang, { fr: ` À partir du ${common + 1}e tour d'augmentation, n'augmenter plus que côté corps (dos et devant, 4 m. par tour) : les manches restent à ${S + 2 * Is} m.`, en: ` From increase round ${common + 1} on, increase only on the body side (back and front, 4 sts per round): the sleeves stay at ${S + 2 * Is} sts.` })
      : tx(lang, { fr: ` À partir du ${common + 1}e tour d'augmentation, n'augmenter plus que côté manches (4 m. par tour) : le corps reste à ${2 * (B + 2 * Ib)} m. hors raglan.`, en: ` From increase round ${common + 1} on, increase only on the sleeve side (4 sts per round): the body stays at ${2 * (B + 2 * Ib)} sts excluding raglan sts.` }))
    : "";
  instructions.push({
    rowStart: 2, rowEnd: 2 + dist.rowsUsed - 1,
    text: incText + onlyText,
    notes: tx(lang, { fr: `Profondeur d'empiècement : ${cmForRows(plan.yokeRows, g).toFixed(0)} cm (${plan.yokeRows} rangs)`, en: `Yoke depth: ${cmForRows(plan.yokeRows, g).toFixed(0)} cm (${plan.yokeRows} rows)` }),
  });

  if (isV && plan.vDist) {
    instructions.push({
      rowStart: 2, rowEnd: 2 + plan.vDist.rowsUsed - 1,
      text: tx(lang, {
        fr: `En même temps, col V : augmenter 1 m. à chaque bord devant ${distText(lang, plan.vDist)} ((B - 2) / 2 = ${(B - 2) / 2} m. par bord). Quand les deux bords se rejoignent, joindre en rond et placer le marqueur de début de tour au milieu du devant.`,
        en: `At the same time, V-neck: increase 1 st at each front edge ${distText(lang, plan.vDist)} (${(B - 2) / 2} sts per edge). When the two edges meet, join in the round and place the beginning-of-round marker at the center front.`,
      }),
    });
  } else {
    const parts: string[] = [];
    if (plan.neckEdgeSteps > 0) parts.push(tx(lang, { fr: `monter 2 m. au début de chacun des ${plan.neckEdgeSteps} rangs suivants (bords devant)`, en: `cast on 2 sts at the beginning of each of the next ${plan.neckEdgeSteps} rows (front edges)` }));
    if (plan.centerCastOn > 0) parts.push(tx(lang, { fr: `puis monter ${plan.centerCastOn} m. au centre du devant`, en: `then cast on ${plan.centerCastOn} sts at the center front` }));
    instructions.push({
      rowStart: 2, rowEnd: 2 + Math.max(plan.neckEdgeSteps, 1),
      text: openFront
        ? tx(lang, { fr: `En même temps, encolure devant : ${parts[0] ?? ""}${plan.centerCastOn > 0 ? `, puis monter ${plan.centerCastOn / 2} m. au début des 2 rangs suivants` : ""}. Continuer en allers-retours : le devant reste ouvert.`, en: `At the same time, front neck: ${parts[0] ?? ""}${plan.centerCastOn > 0 ? `, then cast on ${plan.centerCastOn / 2} sts at the beginning of the next 2 rows` : ""}. Keep working back and forth: the front stays open.` })
        : tx(lang, { fr: `En même temps, encolure devant : ${parts.join(", ")}, joindre en rond et placer le marqueur de début de tour au milieu du devant.`, en: `At the same time, front neck: ${parts.join(", ")}, join in the round and place the beginning-of-round marker at the center front.` }),
      notes: tx(lang, { fr: `Profondeur d'encolure devant obtenue : environ ${cmForRows(plan.neckEdgeSteps + 1, g).toFixed(1)} cm`, en: `Resulting front neck depth: about ${cmForRows(plan.neckEdgeSteps + 1, g).toFixed(1)} cm` }),
    });
  }

  const straight = plan.yokeRows - 1 - dist.rowsUsed;
  if (straight > 0) {
    instructions.push({
      rowStart: 2 + dist.rowsUsed, rowEnd: plan.yokeRows,
      text: tx(lang, { fr: `Continuer droit pendant ${nRows(lang, straight, unit)}.`, en: `Continue straight for ${nRows(lang, straight, unit)}.` }),
    });
  }
  const backAtSep = B + 2 * Ib;
  const sleeveHeld = S + 2 * Is;
  instructions.push({
    rowStart: plan.yokeRows + 1, rowEnd: plan.yokeRows + 1,
    text: tx(lang, {
      fr: `Séparation : tricoter les ${backAtSep} m. du dos + 1 m. raglan de chaque côté, mettre ${sleeveHeld} m. de manche en attente, monter ${U} m. (dessous de bras), tricoter les ${backAtSep} m. du devant + 1 m. raglan de chaque côté, mettre ${sleeveHeld} m. de manche en attente, monter ${U} m. Corps : ${plan.bodyAtSep} m.`,
      en: `Separation: work the ${backAtSep} back sts + 1 raglan st on each side, put ${sleeveHeld} sleeve sts on hold, cast on ${U} sts (underarm), work the ${backAtSep} front sts + 1 raglan st on each side, put ${sleeveHeld} sleeve sts on hold, cast on ${U} sts. Body: ${plan.bodyAtSep} sts.`,
    }),
  });
  return {
    name: tx(lang, { fr: "Empiècement raglan (top-down)", en: "Raglan yoke (top-down)" }),
    castOn,
    totalRows: plan.yokeRows + 1,
    instructions,
    calculations: calcSteps(ctx),
    warnings,
    schematic: { kind: "yoke", widthCm: cmForSts(plan.bodyAtSep, g) / 2, lengthCm: cmForRows(plan.yokeRows, g), necklineWidthCm: cmForSts(castOn, g) / 2, sleeveTopWidthCm: cmForSts(plan.sleeveAtSep, g) },
  };
}

function generateTopDownBody(ctx: Ctx, plan: RaglanPlan, openFront: boolean): PatternPiece {
  const { d, g, lang } = ctx;
  const straight = d.bodyRows - plan.yokeRows - d.hemRows;
  const warnings: string[] = [];
  if (straight < 0) warnings.push(tx(lang, { fr: "Longueur de corps trop courte pour la profondeur d'empiècement : allongez le corps.", en: "Body length is too short for the yoke depth: lengthen the body." }));
  const instructions: PatternInstruction[] = [
    {
      rowStart: 1, rowEnd: Math.max(0, straight),
      text: tx(lang, { fr: `Continuer ${openFront ? "en allers-retours" : "en rond"} en jersey sur ${plan.bodyAtSep} m. pendant ${Math.max(0, straight)} ${openFront ? "rangs" : "tours"} (${cmForRows(Math.max(0, straight), g).toFixed(0)} cm).`, en: `Continue ${openFront ? "back and forth" : "in the round"} in stockinette on ${plan.bodyAtSep} sts for ${Math.max(0, straight)} ${openFront ? "rows" : "rounds"} (${cmForRows(Math.max(0, straight), g).toFixed(0)} cm).` }),
    },
    {
      rowStart: Math.max(0, straight) + 1, rowEnd: Math.max(0, straight) + d.hemRows,
      text: tx(lang, { fr: `Tricoter ${d.hemRows} ${openFront ? "rangs" : "tours"} en côtes 2/2, rabattre souplement en côtes.`, en: `Work ${d.hemRows} ${openFront ? "rows" : "rounds"} in 2x2 rib, bind off loosely in rib.` }),
    },
  ];
  if (plan.bodyAtSep % 4 !== 0) warnings.push(tx(lang, { fr: `${plan.bodyAtSep} m. n'est pas un multiple de 4 : ajuster de 1-2 m. au premier rang de côtes.`, en: `${plan.bodyAtSep} sts is not a multiple of 4: adjust by 1-2 sts on the first rib row.` }));
  return {
    name: tx(lang, { fr: "Corps", en: "Body" }),
    castOn: plan.bodyAtSep,
    totalRows: Math.max(0, straight) + d.hemRows,
    instructions,
    calculations: [],
    warnings,
    schematic: { kind: "tube", widthCm: cmForSts(plan.bodyAtSep, g) / 2, lengthCm: cmForRows(Math.max(0, straight) + d.hemRows, g) },
  };
}

function generateTopDownSleeve(ctx: Ctx, plan: RaglanPlan): PatternPiece {
  const { d, g, lang } = ctx;
  const sleeveSts = plan.sleeveAtSep;
  const warnings: string[] = [];
  const decPerSide = (sleeveSts - d.wristSts) / 2;
  // Longueur de manche depuis le dessous de bras : bras (épaule -> poignet) moins la hauteur réelle de
  // l'empiècement le long de la manche (profondeur d'empiècement moins ~3 cm entre encolure et pointe d'épaule).
  const sleeveCm = Math.max(10, d.armLengthCm - (cmForRows(plan.yokeRows, g) - 3)) * d.sleeveLengthFactor;
  const sleeveRows = rowsFor(sleeveCm, g);
  const decRows = sleeveRows - d.cuffRows - 1;
  const dec = distribute(Math.max(0, decPerSide), Math.max(2, decRows), 2);
  if (dec.overflow > 0) warnings.push(tx(lang, { fr: `Manche trop courte pour ${decPerSide} diminutions par côté : ${dec.overflow} diminutions manquantes.`, en: `Sleeve too short for ${decPerSide} decreases per side: ${dec.overflow} decreases missing.` }));
  const instructions: PatternInstruction[] = [
    {
      rowStart: 1, rowEnd: 1,
      text: tx(lang, { fr: `Reprendre les ${plan.S + 2 * plan.Is} m. en attente, relever ${plan.U} m. sur les m. montées au dessous de bras. Total : ${sleeveSts} m. Joindre en rond, marqueur au milieu du dessous de bras.`, en: `Resume the ${plan.S + 2 * plan.Is} held sts, pick up ${plan.U} sts from the underarm cast-on. Total: ${sleeveSts} sts. Join in the round, marker at the center of the underarm.` }),
      notes: tp(lang, "pattern.dpnNote"),
    },
    {
      rowStart: 2, rowEnd: 1 + Math.max(2, decRows),
      text: decPerSide > 0
        ? tx(lang, { fr: `Diminuer 1 m. de chaque côté du marqueur ${distText(lang, dec, "rounds")}${dec.straightRows > 0 ? `, puis ${nRows(lang, dec.straightRows, "rounds")} droits` : ""}. On obtient ${d.wristSts} m.`, en: `Decrease 1 st on each side of the marker ${distText(lang, dec, "rounds")}${dec.straightRows > 0 ? `, then ${nRows(lang, dec.straightRows, "rounds")} straight` : ""}. ${d.wristSts} sts.` })
        : tx(lang, { fr: `Continuer droit pendant ${nRows(lang, Math.max(2, decRows), "rounds")}.`, en: `Continue straight for ${nRows(lang, Math.max(2, decRows), "rounds")}.` }),
      notes: tx(lang, { fr: `Longueur du dessous de bras au poignet : ${sleeveCm.toFixed(0)} cm. ${tp(lang, "pattern.decreaseNote")}`, en: `Length from underarm to cuff: ${sleeveCm.toFixed(0)} cm. ${tp(lang, "pattern.decreaseNote")}` }),
    },
    {
      rowStart: sleeveRows - d.cuffRows + 1, rowEnd: sleeveRows,
      text: tp(lang, "pattern.cuffRib", d.cuffRows, d.wristSts),
    },
  ];
  warnings.push(tp(lang, "pattern.knitTwoIdentical"));
  return {
    name: tp(lang, "pattern.sleeveX2InRound"),
    castOn: sleeveSts,
    totalRows: sleeveRows,
    instructions,
    calculations: [],
    warnings,
    schematic: { kind: "sleeve", widthCm: cmForSts(sleeveSts, g) / 2, lengthCm: sleeveCm, sleeveTopWidthCm: cmForSts(sleeveSts, g) / 2, sleeveCuffWidthCm: cmForSts(d.wristSts, g) / 2 },
  };
}

// -------------------------------------------
// Bordures : encolure, emmanchures, bandes de boutonnage
// -------------------------------------------

function generateNeckbandPiece(ctx: Ctx, pickUpOverride: number | null): PatternPiece | null {
  const { d, g, lang, analysis, neck } = ctx;
  if (analysis.neckline.type === "capuche") return null;
  const calculations: CalculationStep[] = [];
  const instructions: PatternInstruction[] = [];
  const warnings: string[] = [];

  const neckband = analysis.neckband;
  let stitchPattern = "cotes 1/1";
  let multiple = 2;
  if (neckband?.stitch === "cotes-2x2") { stitchPattern = "cotes 2/2"; multiple = 4; }
  else if (neckband?.stitch === "jersey") stitchPattern = "jersey";
  else if (neckband?.stitch === "mousse") stitchPattern = "point mousse";

  const perimeter = neckPerimeterCm(d, neck);
  // Bord relevé à 90 % du périmètre pour que la bordure tienne à plat.
  const computed = multiple * Math.round((perimeter * g.stitchesPer10cm / 10 * 0.9) / multiple);
  // Raglan top-down : le bord d'encolure est le montage, on en relève 90 % pour resserrer.
  const neckSts = pickUpOverride !== null ? multiple * Math.round((pickUpOverride * 0.9) / multiple) : computed;
  calculations.push(pickUpOverride !== null
    ? { description: tx(lang, { fr: "Mailles du bord d'encolure (montage) × 0,9", en: "Neck edge stitches (cast-on) × 0.9" }), formula: `${pickUpOverride} × 0.9`, result: pickUpOverride * 0.9, rounded: neckSts }
    : { description: tx(lang, { fr: "Tour d'encolure", en: "Neck circumference" }), formula: `${perimeter.toFixed(1)} cm × ${g.stitchesPer10cm}/10 × 0.9`, result: perimeter * g.stitchesPer10cm / 10 * 0.9, rounded: neckSts });

  let neckbandHeight = 3;
  if (neckband) {
    if (neckband.height === "basse") neckbandHeight = 2;
    else if (neckband.height === "moyenne") neckbandHeight = 4;
    else if (neckband.height === "haute") neckbandHeight = 6;
  }
  const isDoubled = neckband?.doubled === true;
  const neckRows = rowsFor(isDoubled ? neckbandHeight * 2 : neckbandHeight, g);
  const isPickedUp = !neckband || neckband.construction !== "sewn-on";
  const openFront = isOpenFront(analysis);

  let row = 1;
  instructions.push({
    rowStart: row, rowEnd: row,
    text: isPickedUp
      ? tx(lang, { fr: `Relever ${neckSts} m. tout autour de l'encolure${openFront ? " (d'un bord devant à l'autre), tricoter en allers-retours" : ". Joindre en rond si le travail est en rond, sinon tricoter en allers-retours"}.`, en: `Pick up ${neckSts} sts around the neckline${openFront ? " (from one front edge to the other), work back and forth" : ". Join in the round if working circularly, otherwise work back and forth"}.` })
      : tx(lang, { fr: `Monter ${neckSts} m. Ce col sera cousu à l'encolure une fois terminé.`, en: `Cast on ${neckSts} sts. This collar will be sewn to the neckline when finished.` }),
    notes: isPickedUp ? tx(lang, { fr: "Relever environ 3 m. pour 4 rangs le long des bords verticaux, et 1 m. par maille rabattue.", en: "Pick up about 3 sts for every 4 rows along vertical edges, and 1 st per bound-off stitch." }) : undefined,
  });
  row++;
  instructions.push({
    rowStart: row, rowEnd: row + neckRows - 1,
    text: tx(lang, { fr: `Tricoter ${neckRows} rangs en ${stitchPattern}.`, en: `Work ${neckRows} rows in ${stitchPattern.replace("cotes", "rib").replace("point mousse", "garter stitch")}.` }),
    notes: tx(lang, { fr: `Hauteur finale : environ ${neckbandHeight} cm${isDoubled ? " (col double)" : ""}`, en: `Final height: about ${neckbandHeight} cm${isDoubled ? " (doubled collar)" : ""}` }),
  });
  row += neckRows;
  instructions.push({
    rowStart: row, rowEnd: row,
    text: isDoubled
      ? tx(lang, { fr: "Replier le col vers l'intérieur et coudre les mailles vivantes à la base du col (grafting ou couture invisible).", en: "Fold the collar inward and sew the live stitches to the base of the collar (grafting or invisible seam)." })
      : tx(lang, { fr: "Rabattre souplement en suivant le point (ne pas serrer pour garder l'élasticité).", en: "Bind off loosely in pattern (don't tighten to maintain elasticity)." }),
  });
  if (neck === "col-v") warnings.push(tx(lang, { fr: "Pour un col V, faire une double diminution centrée à la pointe du V à chaque rang pour un angle net.", en: "For a V-neck, work a centered double decrease at the V point on every row for a clean angle." }));
  if (!isPickedUp) warnings.push(tx(lang, { fr: "Coudre le col en alignant le centre dos avec le milieu du dos.", en: "Sew the collar aligning the center back with the middle of the back." }));

  return { name: tx(lang, { fr: "Bordure d'encolure", en: "Neckband" }), castOn: neckSts, totalRows: neckRows + 2, instructions, calculations, warnings, schematic: { kind: "none", widthCm: 0, lengthCm: 0 } };
}

function generateArmholeBands(ctx: Ctx): PatternPiece {
  const { d, g, lang } = ctx;
  const arm = armholeShape(d, g);
  const perimeter = 2 * arm.perimeterCm;
  const sts = 2 * Math.round((perimeter * g.stitchesPer10cm / 10 * 0.9) / 2);
  const rows = rowsFor(2.5, g);
  return {
    name: tx(lang, { fr: "Bordures d'emmanchures (x2)", en: "Armhole bands (x2)" }),
    castOn: sts,
    totalRows: rows + 1,
    instructions: [
      { rowStart: 1, rowEnd: 1, text: tx(lang, { fr: `Relever ${sts} m. autour de l'emmanchure (tour : ${perimeter.toFixed(0)} cm).`, en: `Pick up ${sts} sts around the armhole (circumference: ${perimeter.toFixed(0)} cm).` }) },
      { rowStart: 2, rowEnd: rows + 1, text: tx(lang, { fr: `Tricoter ${rows} rangs en côtes 1/1, rabattre souplement.`, en: `Work ${rows} rows in 1x1 rib, bind off loosely.` }) },
    ],
    calculations: [],
    warnings: [],
    schematic: { kind: "none", widthCm: 0, lengthCm: 0 },
  };
}

function generateButtonBands(ctx: Ctx, edgeRows: number): PatternPiece {
  const { g, lang, analysis } = ctx;
  const sts = even(Math.round(edgeRows * 0.75));
  const rows = rowsFor(2.5, g);
  const buttons = analysis.closure.type === "boutons" ? (analysis.closure.buttonCountEstimate || 6) : 0;
  const instructions: PatternInstruction[] = [
    { rowStart: 1, rowEnd: rows + 1, text: tx(lang, { fr: `Bande de boutons (devant gauche) : relever ${sts} m. le long du bord (3 m. pour 4 rangs), tricoter ${rows} rangs en côtes 1/1, rabattre souplement.`, en: `Button band (left front): pick up ${sts} sts along the edge (3 sts for every 4 rows), work ${rows} rows in 1x1 rib, bind off loosely.` }) },
  ];
  if (buttons > 0) {
    const spacing = Math.floor((sts - 4) / (buttons - 1 || 1));
    const positions = Array.from({ length: buttons }, (_, i) => 2 + i * spacing + 1);
    instructions.push({
      rowStart: 1, rowEnd: rows + 1,
      text: tx(lang, { fr: `Bande de boutonnières (devant droit) : idem, en faisant ${buttons} boutonnières (2 m. ens., 1 jeté) au rang ${Math.ceil(rows / 2)}, aux mailles ${positions.join(", ")}.`, en: `Buttonhole band (right front): same, working ${buttons} buttonholes (k2tog, yo) on row ${Math.ceil(rows / 2)}, at sts ${positions.join(", ")}.` }),
    });
  } else {
    instructions.push({ rowStart: 1, rowEnd: rows + 1, text: tx(lang, { fr: "Devant droit : idem, sans boutonnières.", en: "Right front: same, without buttonholes." }) });
  }
  return { name: tx(lang, { fr: "Bandes de boutonnage (x2)", en: "Front bands (x2)" }), castOn: sts, totalRows: rows + 1, instructions, calculations: [], warnings: [], schematic: { kind: "none", widthCm: 0, lengthCm: 0 } };
}

// ===========================================
// EXPORTS HISTORIQUES (compatibilité tests et consommateurs)
// ===========================================

function makeCtx(measurements: Measurements, gauge: Gauge, analysis: GarmentAnalysis, lang: Language): Ctx {
  const neck = necklineKind(analysis);
  const d = computeDims(measurements, gauge, neck, analysis.sleeves.length);
  return { d, g: gauge, analysis, lang, neck };
}

export function generateBackPanel(measurements: Measurements, gauge: Gauge, analysis: GarmentAnalysis, lang: Language = "fr"): PatternPiece {
  const ctx = makeCtx(measurements, gauge, analysis, lang);
  const family = chooseFamily(analysis);
  return generateFlatBodyPiece(ctx, { kind: "back", armholeKind: family === "drop-pieces" ? "drop" : "setin" });
}

export function generateFrontPanels(measurements: Measurements, gauge: Gauge, analysis: GarmentAnalysis, lang: Language = "fr"): PatternPiece[] {
  const ctx = makeCtx(measurements, gauge, analysis, lang);
  const family = chooseFamily(analysis);
  const armholeKind = family === "drop-pieces" ? "drop" : "setin";
  if (isOpenFront(analysis)) {
    return [
      generateFlatBodyPiece(ctx, { kind: "front-left", armholeKind }),
      generateFlatBodyPiece(ctx, { kind: "front-right", armholeKind }),
    ];
  }
  return [generateFlatBodyPiece(ctx, { kind: "front", armholeKind })];
}

export function generateSleeves(measurements: Measurements, gauge: Gauge, analysis: GarmentAnalysis, lang: Language = "fr"): PatternPiece {
  const ctx = makeCtx(measurements, gauge, analysis, lang);
  if (chooseFamily(analysis) === "sleeveless") {
    return { name: tp(lang, "pattern.sleeveX2"), castOn: 0, totalRows: 0, instructions: [{ rowStart: 0, rowEnd: 0, text: tp(lang, "pattern.noSleeveSimple") }], calculations: [], warnings: [] };
  }
  return generateFlatSleeve(ctx, analysis.sleeves.type === "marteau" ? "drop" : "setin");
}

export function generateNeckline(measurements: Measurements, gauge: Gauge, analysis: GarmentAnalysis, lang: Language = "fr"): { instructions: string[]; stitchesToBindOff: number } {
  const ctx = makeCtx(measurements, gauge, analysis, lang);
  const ins = frontNeckInstructions(ctx, 1, "both", 0).map((i) => i.text);
  const shape = crewFrontNeckShape(ctx.d);
  return { instructions: ins, stitchesToBindOff: ctx.neck === "col-v" ? 0 : shape.centerBindOff };
}

// ===========================================
// PATRON COMPLET
// ===========================================

export function generateFullPattern(
  analysis: GarmentAnalysis,
  gauge: Gauge,
  measurements: Measurements,
  yarn: YarnInfo,
  lang: Language = "fr"
): GeneratedPattern {
  log("=== Generating full pattern (v2) ===");
  const ctx = makeCtx(measurements, gauge, analysis, lang);
  const { d } = ctx;
  const family = chooseFamily(analysis);
  const openFront = isOpenFront(analysis);
  log("Family:", family, "dims:", d);

  const pieces: PatternPiece[] = [];
  const assembly: string[] = [];
  let neckPickUp: number | null = null;
  let bandEdgeRows = ctx.neck === "col-v" ? d.bodyRows - d.frontNeckRows : d.bodyRows;

  if (family === "raglan-topdown") {
    const extra: Txt[] = [];
    if (openFront && ctx.neck === "col-v") {
      // Le col V n'est pas façonné sur l'empiècement raglan ouvert : encolure ras du cou, bandes droites.
      ctx.neck = "ras-du-cou";
      extra.push({ fr: "Col V non pris en charge sur un cardigan raglan : encolure ras du cou, à creuser en V via la bande de boutonnage si souhaité.", en: "V-neck not supported on a raglan cardigan: crew neck, shape a V through the front band if desired." });
    }
    const { plan, warnings } = planRaglan(d, ctx.neck, openFront);
    bandEdgeRows = d.bodyRows; // le bord devant court de l'encolure à l'ourlet
    pieces.push(generateRaglanYoke(ctx, plan, openFront, [...extra, ...warnings]));
    pieces.push(generateTopDownBody(ctx, plan, openFront));
    pieces.push(generateTopDownSleeve(ctx, plan));
    neckPickUp = plan.vDist ? null : plan.B + 2 * plan.S + 4 + 2 + 2 * plan.neckEdgeSteps + plan.centerCastOn;
    assembly.push(tx(lang, { fr: "1. Empiècement, corps et manches sont tricotés d'un seul tenant : aucune couture.", en: "1. Yoke, body and sleeves are worked in one piece: no seams." }));
    assembly.push(tx(lang, { fr: "2. Fermer les dessous de bras en rentrant les fils et en resserrant les éventuels trous.", en: "2. Close the underarms by weaving in ends and tightening any holes." }));
  } else if (family === "setin-round") {
    pieces.push(generateRoundBodyToUnderarm(ctx));
    pieces.push(generateFlatBodyPiece(ctx, { kind: "back", armholeKind: "setin-after-round" }));
    pieces.push(generateFlatBodyPiece(ctx, { kind: "front", armholeKind: "setin-after-round" }));
    pieces.push(generateFlatSleeve(ctx, "setin"));
    assembly.push(tx(lang, { fr: "1. Assembler les épaules (couture ou rabattage à 3 aiguilles).", en: "1. Join the shoulders (seam or 3-needle bind-off)." }));
    assembly.push(tx(lang, { fr: "2. Coudre les manches : épingler le sommet de la tête à la couture d'épaule, le milieu du dessous de bras aux mailles rabattues, puis répartir.", en: "2. Sew in the sleeves: pin the cap top to the shoulder seam, the underarm center to the bound-off sts, then ease in." }));
    assembly.push(tx(lang, { fr: "3. Fermer les dessous de manche.", en: "3. Seam the sleeve undersides." }));
  } else if (family === "setin-pieces" || family === "drop-pieces") {
    const armholeKind = family === "drop-pieces" ? "drop" : "setin";
    pieces.push(generateFlatBodyPiece(ctx, { kind: "back", armholeKind }));
    if (openFront) {
      pieces.push(generateFlatBodyPiece(ctx, { kind: "front-left", armholeKind }));
      pieces.push(generateFlatBodyPiece(ctx, { kind: "front-right", armholeKind }));
    } else {
      pieces.push(generateFlatBodyPiece(ctx, { kind: "front", armholeKind }));
    }
    pieces.push(generateFlatSleeve(ctx, armholeKind));
    assembly.push(tx(lang, { fr: "1. Bloquer les pièces aux dimensions.", en: "1. Block the pieces to measurements." }));
    assembly.push(tx(lang, { fr: "2. Coudre les épaules.", en: "2. Seam the shoulders." }));
    assembly.push(family === "drop-pieces"
      ? tx(lang, { fr: "3. Coudre le haut des manches à plat entre les marqueurs d'emmanchure (milieu de manche sur la couture d'épaule).", en: "3. Sew the sleeve tops flat between the armhole markers (sleeve center on the shoulder seam)." })
      : tx(lang, { fr: "3. Monter les manches : épingler le sommet de la tête à la couture d'épaule, le dessous de bras aux mailles rabattues, puis répartir.", en: "3. Set in the sleeves: pin the cap top to the shoulder seam, the underarm to the bound-off sts, then ease in." }));
    assembly.push(tx(lang, { fr: "4. Coudre les côtés et les dessous de manche.", en: "4. Seam the sides and sleeve undersides." }));
  } else {
    // sleeveless
    pieces.push(generateFlatBodyPiece(ctx, { kind: "back", armholeKind: "setin" }));
    if (openFront) {
      pieces.push(generateFlatBodyPiece(ctx, { kind: "front-left", armholeKind: "setin" }));
      pieces.push(generateFlatBodyPiece(ctx, { kind: "front-right", armholeKind: "setin" }));
    } else {
      pieces.push(generateFlatBodyPiece(ctx, { kind: "front", armholeKind: "setin" }));
    }
    pieces.push(generateArmholeBands(ctx));
    assembly.push(tx(lang, { fr: "1. Coudre les épaules, puis les côtés.", en: "1. Seam the shoulders, then the sides." }));
    assembly.push(tx(lang, { fr: "2. Relever les bordures d'emmanchures et d'encolure.", en: "2. Pick up the armhole and neck bands." }));
  }

  const neckband = generateNeckbandPiece(ctx, neckPickUp);
  if (neckband) {
    pieces.push(neckband);
    assembly.push(`${assembly.length + 1}. ` + (openFront ? tp(lang, "pattern.neckbandAssemblyCardigan") : tp(lang, "pattern.neckbandAssembly")));
  }
  if (openFront) {
    pieces.push(generateButtonBands(ctx, bandEdgeRows));
    assembly.push(`${assembly.length + 1}. ` + tx(lang, { fr: "Relever les bandes de boutonnage le long des bords devant, coudre les boutons en face des boutonnières.", en: "Pick up the front bands along the front edges, sew the buttons opposite the buttonholes." }));
  }
  assembly.push(`${assembly.length + 1}. ` + tp(lang, "pattern.seamlessNote4"));

  const finishing: string[] = ["- " + tp(lang, "pattern.weavEnds"), "- " + tp(lang, "pattern.blockGarment")];
  if (analysis.closure.type === "boutons") finishing.push("- " + tp(lang, "pattern.sewButtons", analysis.closure.buttonCountEstimate || 6));
  else if (analysis.closure.type === "zip") finishing.push("- " + tp(lang, "pattern.sewZipper"));

  const yardage = estimateYardage(measurements, gauge, yarn, analysis.garment.type, family !== "sleeveless");
  const constructionNote = family === "raglan-topdown"
    ? tp(lang, "pattern.constructionSeamless")
    : tp(lang, "pattern.constructionFlat");
  const limitationsText = analysis.limitations.length > 0 ? tp(lang, "pattern.disclaimerLimitations", analysis.limitations.join(", ")) : "";
  const dimsNote = tx(lang, {
    fr: `Dimensions du vêtement fini : tour de poitrine ${d.finishedChestCm} cm, carrure ${d.crossBackCm} cm, profondeur d'emmanchure ${d.armholeDepthCm.toFixed(1)} cm, encolure dos ${d.backNeckWidthCm.toFixed(1)} cm, biceps ${d.bicepCm.toFixed(0)} cm.`,
    en: `Finished garment dimensions: chest ${d.finishedChestCm} cm, cross back ${d.crossBackCm} cm, armhole depth ${d.armholeDepthCm.toFixed(1)} cm, back neck ${d.backNeckWidthCm.toFixed(1)} cm, upper arm ${d.bicepCm.toFixed(0)} cm.`,
  });

  const disclaimer = `
${constructionNote}
${dimsNote}

${tp(lang, "pattern.disclaimerIntro")}
${tp(lang, "pattern.disclaimerWork")}
- ${tp(lang, "pattern.disclaimerSwatch")}
- ${tp(lang, "pattern.disclaimerYarn")}
- ${tp(lang, "pattern.disclaimerFit")}

${tp(lang, "pattern.disclaimerConfidence", tx(lang, { high: { fr: "élevée", en: "high" }, medium: { fr: "moyenne", en: "medium" }, low: { fr: "faible", en: "low" }, insufficient: { fr: "insuffisante", en: "insufficient" } }[analysis.overallConfidence] ?? { fr: analysis.overallConfidence, en: analysis.overallConfidence }))}
${limitationsText}

${tp(lang, "pattern.disclaimerAdvice")}
  `.trim();

  return {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    analysis, gauge, measurements, yarn, pieces, assembly, finishing,
    estimatedYardage: yardage.grams,
    disclaimer,
  };
}

// ===========================================
// ESTIMATION MÉTRAGE
// ===========================================

// Grammes par mètre selon la catégorie de fil (pelote de 50 g : lace ~400 m, fingering ~200 m,
// sport ~150 m, DK ~115 m, worsted ~100 m, aran ~85 m, bulky ~60 m).
const GRAMS_PER_METER: Record<YarnInfo["weight"], number> = {
  lace: 0.125, fingering: 0.25, sport: 0.33, dk: 0.43, worsted: 0.5, aran: 0.6, bulky: 0.85,
};

export function estimateYardage(
  measurements: Measurements,
  gauge: Gauge,
  yarn: YarnInfo,
  garmentType: string = "pull",
  hasSleeves: boolean = true
): { meters: number; grams: number; skeinsEstimate: string } {
  // Une seule source pour le métrage : le modèle de surface de lib/yarn-calculator.ts.
  const needed = calculateYarnNeeded(measurements, gauge, garmentType, hasSleeves);
  const meters = needed.average;
  const grams = Math.round(meters * GRAMS_PER_METER[yarn.weight]);
  log(`Estimation: ${grams}g, ~${meters}m`);
  const low = Math.round(grams * 0.9);
  const high = Math.round(grams * 1.1);
  const skeinsEstimate = `${low}-${high}g environ`;
  return { meters, grams, skeinsEstimate };
}

// ===========================================
// FONCTION PRINCIPALE
// ===========================================

