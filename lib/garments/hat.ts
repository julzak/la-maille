// ===========================================
// LA MAILLE - Générateur de patron : bonnet
// ===========================================
//
// Construction v1 : en rond, du bas vers le haut. Bord (côtes, mousse ou roulé, doublé si revers),
// corps droit en jersey, sommet en 8 quartiers : diminutions un tour sur deux, puis à chaque tour,
// jusqu'à 8 mailles, fermées en serrant le fil. Tous les nombres sont calculés ici, jamais par l'IA.

import type {
  GarmentAnalysis,
  Gauge,
  HatMeasurements,
  YarnInfo,
  CalculationStep,
  PatternInstruction,
  GeneratedPattern,
} from "../types";
import { tp, type Language } from "../i18n";
import { stsFor, rowsFor, cmForSts, cmForRows } from "../shaping";
import { calculateHatYarnNeeded, gramsForMeters } from "../yarn-calculator";

type Txt = { fr: string; en: string };
const tx = (lang: Language, t: Txt) => (lang === "fr" ? t.fr : t.en);

export const HAT_CROWN_SECTIONS = 8;
const MIN_STS_PER_SECTION = 3;

export interface HatDims {
  finishedCircCm: number;
  castOn: number;
  ribMultiple: number;
  brimRows: number; // rangs tricotés du bord (doublés si revers)
  visibleBrimRows: number;
  bodyRows: number;
  crownRows: number;
  totalRows: number;
  stsPerSection: number;
  alternateDecreases: number; // diminutions par quartier, un tour sur deux
  everyRoundDecreases: number; // diminutions par quartier, à chaque tour
  remainingSts: number;
}

function ribMultiple(brim: NonNullable<GarmentAnalysis["hat"]>["brim"]["type"]): number {
  if (brim === "cotes-2x2") return 4;
  if (brim === "cotes-1x1" || brim === "unknown") return 2;
  return 1;
}

function lcm(a: number, b: number): number {
  const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
  return (a * b) / gcd(a, b);
}

/** Type de bord effectif : côtes 1/1 si l'analyse n'a pas su trancher. */
export function hatBrimType(analysis: GarmentAnalysis): "cotes-1x1" | "cotes-2x2" | "mousse" | "roule" {
  const t = analysis.hat?.brim.type ?? "unknown";
  return t === "unknown" ? "cotes-1x1" : t;
}

export function computeHatDims(m: HatMeasurements, g: Gauge, analysis: GarmentAnalysis): HatDims {
  const brim = hatBrimType(analysis);
  const folded = analysis.hat?.brim.folded === true;
  const finishedCircCm = m.headCircumference * (1 - m.ease / 100);
  const multiple = lcm(HAT_CROWN_SECTIONS, ribMultiple(brim));
  const castOn = Math.max(multiple * Math.round(stsFor(finishedCircCm, g) / multiple), HAT_CROWN_SECTIONS * MIN_STS_PER_SECTION);
  const stsPerSection = castOn / HAT_CROWN_SECTIONS;

  // Sommet : k - 1 diminutions par quartier pour finir à 1 maille par quartier.
  const decreases = stsPerSection - 1;
  const everyRoundDecreases = Math.floor(decreases / 2);
  const alternateDecreases = decreases - everyRoundDecreases;
  const crownRows = 2 * alternateDecreases + everyRoundDecreases;

  const visibleBrimRows = rowsFor(m.brimHeight, g);
  const brimRows = folded ? 2 * visibleBrimRows : visibleBrimRows;
  const bodyRows = Math.max(0, rowsFor(m.hatHeight, g) - visibleBrimRows - crownRows);

  return {
    finishedCircCm, castOn, ribMultiple: multiple, brimRows, visibleBrimRows, bodyRows, crownRows,
    totalRows: brimRows + bodyRows + crownRows,
    stsPerSection, alternateDecreases, everyRoundDecreases,
    remainingSts: HAT_CROWN_SECTIONS,
  };
}

function brimStitchText(lang: Language, brim: ReturnType<typeof hatBrimType>, rounds: number): string {
  switch (brim) {
    case "cotes-2x2":
      return tx(lang, { fr: `Tricoter ${rounds} tours en côtes 2/2 (*2 m. end., 2 m. env.*, répéter jusqu'à la fin du tour).`, en: `Work ${rounds} rounds in 2x2 rib (*k2, p2*, repeat to end of round).` });
    case "mousse":
      return tx(lang, { fr: `Tricoter ${rounds} tours au point mousse (en rond : 1 tour à l'envers, 1 tour à l'endroit, en commençant par un tour à l'envers).`, en: `Work ${rounds} rounds in garter stitch (in the round: 1 round purl, 1 round knit, starting with a purl round).` });
    case "roule":
      return tx(lang, { fr: `Tricoter ${rounds} tours en jersey (toutes les mailles à l'endroit) : ce bord roulera naturellement vers l'extérieur.`, en: `Work ${rounds} rounds in stockinette (knit every stitch): this edge will roll outwards naturally.` });
    default:
      return tx(lang, { fr: `Tricoter ${rounds} tours en côtes 1/1 (*1 m. end., 1 m. env.*, répéter jusqu'à la fin du tour).`, en: `Work ${rounds} rounds in 1x1 rib (*k1, p1*, repeat to end of round).` });
  }
}

function crownInstructions(lang: Language, d: HatDims, startRow: number): PatternInstruction[] {
  const out: PatternInstruction[] = [];
  let row = startRow;
  let perSection = d.stsPerSection;
  const S = HAT_CROWN_SECTIONS;
  const decRound = (first: boolean): PatternInstruction => {
    const before = perSection - 2;
    perSection -= 1;
    const setup = first
      ? tx(lang, { fr: `Placer un marqueur toutes les ${d.stsPerSection} m. (${S} quartiers de ${d.stsPerSection} m.). `, en: `Place a marker every ${d.stsPerSection} sts (${S} sections of ${d.stsPerSection} sts). ` })
      : "";
    const text = before > 0
      ? tx(lang, { fr: `${setup}Tour de diminutions : *tricoter ${before} m. end., 2 m. ens. à l'endroit*, répéter ${S} fois (${perSection * S} m.).`, en: `${setup}Decrease round: *k${before}, k2tog*, repeat ${S} times (${perSection * S} sts).` })
      : tx(lang, { fr: `${setup}Tour de diminutions : *2 m. ens. à l'endroit*, répéter ${S} fois (${perSection * S} m.).`, en: `${setup}Decrease round: *k2tog*, repeat ${S} times (${perSection * S} sts).` });
    return { rowStart: row, rowEnd: row++, text };
  };
  const plainRound = (): PatternInstruction => ({
    rowStart: row, rowEnd: row++,
    text: tx(lang, { fr: `Tricoter 1 tour à l'endroit sans diminuer (${perSection * S} m.).`, en: `Knit 1 round without decreasing (${perSection * S} sts).` }),
  });
  for (let i = 0; i < d.alternateDecreases; i++) {
    out.push(decRound(i === 0));
    out.push(plainRound());
  }
  for (let i = 0; i < d.everyRoundDecreases; i++) out.push(decRound(d.alternateDecreases === 0 && i === 0));
  return out;
}

export function generateHatPattern(
  analysis: GarmentAnalysis,
  gauge: Gauge,
  m: HatMeasurements,
  yarn: YarnInfo,
  lang: Language = "fr"
): GeneratedPattern {
  const d = computeHatDims(m, gauge, analysis);
  const brim = hatBrimType(analysis);
  const folded = analysis.hat?.brim.folded === true;
  const warnings: string[] = [];

  const calculations: CalculationStep[] = [
    {
      description: tx(lang, { fr: "Tour du bonnet fini (tour de tête moins l'aisance négative)", en: "Finished hat circumference (head minus negative ease)" }),
      formula: `${m.headCircumference} cm × (1 − ${m.ease} %) = ${d.finishedCircCm.toFixed(1)} cm`,
      result: d.finishedCircCm, rounded: Math.round(d.finishedCircCm * 10) / 10,
    },
    {
      description: tx(lang, { fr: `Mailles à monter (multiple de ${d.ribMultiple} : ${HAT_CROWN_SECTIONS} quartiers et motif du bord)`, en: `Stitches to cast on (multiple of ${d.ribMultiple}: ${HAT_CROWN_SECTIONS} sections and brim pattern)` }),
      formula: `${d.finishedCircCm.toFixed(1)} cm × (${gauge.stitchesPer10cm} m / 10 cm) = ${((d.finishedCircCm * gauge.stitchesPer10cm) / 10).toFixed(1)}`,
      result: (d.finishedCircCm * gauge.stitchesPer10cm) / 10, rounded: d.castOn,
      roundingNote: tp(lang, "pattern.roundedFrom", ((d.finishedCircCm * gauge.stitchesPer10cm) / 10).toFixed(1), d.castOn),
    },
    {
      description: tp(lang, "pattern.rowsFor", m.hatHeight),
      formula: `${m.hatHeight} cm × (${gauge.rowsPer10cm} r / 10 cm) = ${((m.hatHeight * gauge.rowsPer10cm) / 10).toFixed(1)}`,
      result: (m.hatHeight * gauge.rowsPer10cm) / 10, rounded: rowsFor(m.hatHeight, gauge),
    },
  ];

  if (rowsFor(m.hatHeight, gauge) - d.visibleBrimRows - d.crownRows < 0) {
    warnings.push(tx(lang, { fr: "La hauteur demandée est plus courte que le bord et le sommet réunis : le bonnet sera plus haut que prévu. Augmentez la hauteur ou réduisez le bord.", en: "The requested height is shorter than the brim and crown combined: the hat will come out taller. Increase the height or shorten the brim." }));
  }
  if (analysis.stitch.mainPattern !== "jersey" && analysis.stitch.mainPattern !== "unknown") {
    warnings.push(tx(lang, { fr: "Le point du corps de la photo (côtes, mousse, torsades, jacquard, dentelle ou autre) n'est pas reproduit : le patron est calculé en jersey. Un autre point change l'échantillon, tricotez l'échantillon dans le point choisi.", en: "The body stitch in the photo (rib, garter, cables, colorwork, lace or other) is not reproduced: the pattern is calculated in stockinette. Another stitch changes gauge, swatch in your chosen stitch." }));
  }
  if (analysis.hat && analysis.hat.crown !== "quartiers" && analysis.hat.crown !== "unknown") {
    warnings.push(tx(lang, { fr: "Le sommet de la photo semble différent : ce patron utilise un sommet en 8 quartiers réguliers.", en: "The crown in the photo looks different: this pattern uses a crown in 8 even sections." }));
  }

  const instructions: PatternInstruction[] = [];
  instructions.push({
    rowStart: 1, rowEnd: d.brimRows,
    text: tx(lang, { fr: `Monter ${d.castOn} m. sur une aiguille circulaire courte (40 cm) ou des aiguilles doubles pointes. Joindre en rond sans vriller les mailles et placer un marqueur de début de tour. `, en: `Cast on ${d.castOn} sts on a short circular needle (16 in / 40 cm) or double-pointed needles. Join in the round without twisting and place a beginning-of-round marker. ` }) + brimStitchText(lang, brim, d.brimRows),
    notes: folded
      ? tx(lang, { fr: `Bord à revers : il est tricoté sur ${cmForRows(d.brimRows, gauge).toFixed(1)} cm puis replié en deux vers l'extérieur. Tour fini : ${cmForSts(d.castOn, gauge).toFixed(1)} cm.`, en: `Folded brim: worked over ${cmForRows(d.brimRows, gauge).toFixed(1)} cm then folded in half to the outside. Finished circumference: ${cmForSts(d.castOn, gauge).toFixed(1)} cm.` })
      : tx(lang, { fr: `Tour fini : ${cmForSts(d.castOn, gauge).toFixed(1)} cm.`, en: `Finished circumference: ${cmForSts(d.castOn, gauge).toFixed(1)} cm.` }),
  });
  if (d.bodyRows > 0) {
    instructions.push({
      rowStart: d.brimRows + 1, rowEnd: d.brimRows + d.bodyRows,
      text: tx(lang, { fr: `Continuer en jersey (toutes les mailles à l'endroit) pendant ${d.bodyRows} tours.`, en: `Continue in stockinette (knit every stitch) for ${d.bodyRows} rounds.` }),
      notes: tx(lang, { fr: `Hauteur depuis le bas${folded ? " du bord replié" : ""} : ${cmForRows(d.visibleBrimRows + d.bodyRows, gauge).toFixed(1)} cm.`, en: `Height from the bottom${folded ? " of the folded brim" : ""}: ${cmForRows(d.visibleBrimRows + d.bodyRows, gauge).toFixed(1)} cm.` }),
    });
  }
  instructions.push(...crownInstructions(lang, d, d.brimRows + d.bodyRows + 1));

  const brimCm = cmForRows(d.visibleBrimRows, gauge);
  const crownCm = cmForRows(d.crownRows, gauge);
  const piece = {
    name: tx(lang, { fr: "Bonnet", en: "Hat" }),
    castOn: d.castOn,
    totalRows: d.totalRows,
    instructions,
    calculations,
    warnings,
    schematic: {
      kind: "hat" as const,
      widthCm: cmForSts(d.castOn, gauge) / 2,
      lengthCm: cmForRows(d.visibleBrimRows + d.bodyRows + d.crownRows, gauge),
      brimHeightCm: brimCm,
      crownHeightCm: crownCm,
    },
  };

  const assembly = [
    tx(lang, { fr: `1. Couper le fil en laissant environ 20 cm. Avec une aiguille à laine, le passer dans les ${d.remainingSts} m. restantes, serrer fermement et arrêter le fil à l'intérieur.`, en: `1. Cut the yarn leaving about 20 cm (8 in). With a tapestry needle, thread it through the remaining ${d.remainingSts} sts, pull tight and fasten off inside.` }),
  ];
  if (folded) assembly.push(tx(lang, { fr: `${assembly.length + 1}. Replier le bord en deux vers l'extérieur.`, en: `${assembly.length + 1}. Fold the brim in half to the outside.` }));
  if (analysis.hat?.pompom) assembly.push(tx(lang, { fr: `${assembly.length + 1}. Confectionner un pompon et le coudre solidement au sommet.`, en: `${assembly.length + 1}. Make a pompom and sew it securely to the top.` }));

  const finishing: string[] = ["- " + tp(lang, "pattern.weavEnds"), "- " + tp(lang, "pattern.blockGarment")];

  const needed = calculateHatYarnNeeded(m, gauge, folded);
  const grams = gramsForMeters(needed.average, yarn.weight);

  const dimsNote = tx(lang, {
    fr: `Dimensions du bonnet fini : tour ${cmForSts(d.castOn, gauge).toFixed(1)} cm (pour un tour de tête de ${m.headCircumference} cm), hauteur ${cmForRows(d.visibleBrimRows + d.bodyRows + d.crownRows, gauge).toFixed(1)} cm dont bord ${brimCm.toFixed(1)} cm et sommet ${crownCm.toFixed(1)} cm.`,
    en: `Finished hat dimensions: circumference ${cmForSts(d.castOn, gauge).toFixed(1)} cm (for a ${m.headCircumference} cm head), height ${cmForRows(d.visibleBrimRows + d.bodyRows + d.crownRows, gauge).toFixed(1)} cm including a ${brimCm.toFixed(1)} cm brim and a ${crownCm.toFixed(1)} cm crown.`,
  });
  const limitationsText = analysis.limitations.length > 0 ? tp(lang, "pattern.disclaimerLimitations", analysis.limitations.join(", ")) : "";
  const confidence = tx(lang, { high: { fr: "élevée", en: "high" }, medium: { fr: "moyenne", en: "medium" }, low: { fr: "faible", en: "low" }, insufficient: { fr: "insuffisante", en: "insufficient" } }[analysis.overallConfidence] ?? { fr: analysis.overallConfidence, en: analysis.overallConfidence });
  const disclaimer = `
${tx(lang, { fr: "Construction : en rond, du bord vers le sommet, sans couture.", en: "Construction: in the round, from brim to crown, seamless." })}
${dimsNote}

${tp(lang, "pattern.disclaimerIntro")}
${tp(lang, "pattern.disclaimerWork")}
- ${tp(lang, "pattern.disclaimerSwatch")}
- ${tp(lang, "pattern.disclaimerYarn")}
- ${tp(lang, "pattern.disclaimerFit")}

${tp(lang, "pattern.disclaimerConfidence", confidence)}
${limitationsText}

${tp(lang, "pattern.disclaimerAdvice")}
  `.trim();

  return {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    analysis, gauge, measurements: m, yarn,
    pieces: [piece],
    assembly, finishing,
    estimatedYardage: grams,
    disclaimer,
  };
}
