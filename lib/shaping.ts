// ===========================================
// LA MAILLE - Façonnage : tables par taille, répartition, géométrie
// ===========================================
//
// Ce module ne produit aucun texte : uniquement des nombres. Les générateurs
// de lib/pattern-calculator.ts s'appuient dessus pour que toutes les pièces
// d'un même patron partagent les mêmes dimensions (emmanchure, encolure,
// dessous de bras) et pour que chaque instruction soit un entier.

import type { Gauge } from "./types";

// -------------------------------------------
// Table de référence : Craft Yarn Council, women's size chart
// (craftyarncouncil.com/standards/woman-size). Valeurs médianes des fourchettes, en cm.
// chest = tour de poitrine du corps (pas du vêtement), armhole = profondeur d'emmanchure du corps.
// -------------------------------------------
const CYC_ROWS: { chest: number; crossBack: number; armhole: number; upperArm: number }[] = [
  { chest: 73.5, crossBack: 36.25, armhole: 16.0, upperArm: 25 },
  { chest: 83.5, crossBack: 37.5, armhole: 17.0, upperArm: 26 },
  { chest: 94.0, crossBack: 40.0, armhole: 18.25, upperArm: 28 },
  { chest: 104.0, crossBack: 42.5, armhole: 19.75, upperArm: 30.5 },
  { chest: 114.25, crossBack: 44.5, armhole: 21.0, upperArm: 34.5 },
  { chest: 124.5, crossBack: 45.5, armhole: 22.25, upperArm: 39.5 },
  { chest: 134.5, crossBack: 45.5, armhole: 23.5, upperArm: 43 },
  { chest: 144.5, crossBack: 47.0, armhole: 24.75, upperArm: 47 },
  { chest: 155.0, crossBack: 47.0, armhole: 26.0, upperArm: 49.5 },
];

// Constantes de conception (choix La Maille, pas des valeurs CYC).
const ARMHOLE_EASE_CM = 1.5; // emmanchure du vêtement = emmanchure du corps + aisance
const RAGLAN_YOKE_EXTRA_CM = 2.5; // profondeur d'empiècement raglan = emmanchure vêtement + extra
const BACK_NECK_RATIO = 0.38; // largeur d'encolure dos = 38 % de la carrure (13,7 cm XS -> 17,9 cm 4X)
const CREW_FRONT_DROP_CM = 7; // profondeur d'encolure devant, ras du cou
const BOAT_FRONT_DROP_CM = 3;
const V_FRONT_DROP_RATIO = 0.85; // col V : profondeur = 85 % de l'emmanchure vêtement (la pointe du V s'arrête au-dessus des emmanchures)
const UNDERARM_RATIO = 0.08; // dessous de bras (mailles montées / rabattues) = 8 % du tour de poitrine fini
const CAP_TOP_WIDTH_CM = 10; // largeur du sommet de la tête de manche montée
const SLEEVE_EASE_CM = 4; // aisance au biceps
const WRIST_EASE_CM = 2;
const HEM_RIB_CM = 5;
const CUFF_RIB_CM = 5;

export const SHAPING_CONSTANTS = {
  ARMHOLE_EASE_CM, RAGLAN_YOKE_EXTRA_CM, BACK_NECK_RATIO, CREW_FRONT_DROP_CM, BOAT_FRONT_DROP_CM,
  V_FRONT_DROP_RATIO, UNDERARM_RATIO, CAP_TOP_WIDTH_CM, SLEEVE_EASE_CM, WRIST_EASE_CM, HEM_RIB_CM, CUFF_RIB_CM,
};

/** Interpolation linéaire dans la table CYC sur le tour de poitrine du corps (borné aux extrêmes). */
export function interpolateCyc(bodyChestCm: number): { crossBack: number; armhole: number; upperArm: number } {
  const rows = CYC_ROWS;
  if (bodyChestCm <= rows[0].chest) return rows[0];
  if (bodyChestCm >= rows[rows.length - 1].chest) return rows[rows.length - 1];
  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i], b = rows[i + 1];
    if (bodyChestCm >= a.chest && bodyChestCm <= b.chest) {
      const t = (bodyChestCm - a.chest) / (b.chest - a.chest);
      return {
        crossBack: a.crossBack + t * (b.crossBack - a.crossBack),
        armhole: a.armhole + t * (b.armhole - a.armhole),
        upperArm: a.upperArm + t * (b.upperArm - a.upperArm),
      };
    }
  }
  return rows[rows.length - 1];
}

// -------------------------------------------
// Conversions entières
// -------------------------------------------

export const stsFor = (cm: number, g: Gauge) => Math.round((cm * g.stitchesPer10cm) / 10);
export const rowsFor = (cm: number, g: Gauge) => Math.round((cm * g.rowsPer10cm) / 10);
export const cmForSts = (sts: number, g: Gauge) => (sts * 10) / g.stitchesPer10cm;
export const cmForRows = (rows: number, g: Gauge) => (rows * 10) / g.rowsPer10cm;

/** Arrondit à l'entier pair le plus proche (symétrie gauche/droite). */
export const even = (n: number) => 2 * Math.round(n / 2);

// -------------------------------------------
// Dimensions partagées d'un vêtement
// -------------------------------------------

export type NecklineKind = "ras-du-cou" | "col-v" | "bateau" | "ouvert-cardigan" | "capuche" | "unknown";

export interface GarmentDims {
  /** Tour de poitrine fini (corps + aisance), cm */
  finishedChestCm: number;
  /** Carrure utilisée (mesure utilisateur), cm */
  crossBackCm: number;
  /** Profondeur d'emmanchure du vêtement, cm */
  armholeDepthCm: number;
  /** Profondeur d'empiècement raglan (encolure -> dessous de bras), cm */
  raglanYokeDepthCm: number;
  /** Largeur d'encolure dos, cm */
  backNeckWidthCm: number;
  /** Profondeur d'encolure devant, cm */
  frontNeckDropCm: number;
  /** Tour de biceps fini, cm */
  bicepCm: number;
  /** Tour de poignet fini, cm */
  wristCm: number;
  /** Longueur de manche du dessous de bras au poignet, cm */
  underarmToWristCm: number;
  /** Longueur de bras saisie (épaule -> poignet), cm */
  armLengthCm: number;
  /** Facteur de longueur de manche (1, 0.7 pour 3/4, 0.3 pour courtes) */
  sleeveLengthFactor: number;

  // En mailles / rangs (toujours des entiers)
  bodySts: number; // tour complet
  backSts: number; // demi-corps (dos = devant)
  crossBackSts: number;
  backNeckSts: number;
  shoulderSts: number; // par épaule, = (crossBack - backNeck) / 2
  underarmSts: number; // mailles de dessous de bras par côté (communes corps / manche)
  bicepSts: number;
  wristSts: number;
  armholeRows: number;
  raglanYokeRows: number;
  frontNeckRows: number;
  bodyRows: number; // longueur totale du corps
  hemRows: number;
  cuffRows: number;
  sleeveRows: number; // dessous de bras -> poignet, côtes comprises
}

export interface DimsInput {
  chestCircumference: number;
  ease: number;
  shoulderWidth: number;
  bodyLength: number;
  armLength: number; // épaule -> poignet
  wristCircumference: number;
  bicepCircumference: number;
}

export function computeDims(m: DimsInput, g: Gauge, neckline: NecklineKind, sleeveLength: "longues" | "3-4" | "courtes" | "sans" | "unknown" = "longues"): GarmentDims {
  const cyc = interpolateCyc(m.chestCircumference);
  const finishedChestCm = m.chestCircumference + m.ease;
  const armholeDepthCm = cyc.armhole + ARMHOLE_EASE_CM;
  const raglanYokeDepthCm = armholeDepthCm + RAGLAN_YOKE_EXTRA_CM;
  const crossBackCm = m.shoulderWidth;
  const backNeckWidthCm = crossBackCm * BACK_NECK_RATIO;

  let frontNeckDropCm = CREW_FRONT_DROP_CM;
  if (neckline === "col-v") frontNeckDropCm = armholeDepthCm * V_FRONT_DROP_RATIO;
  else if (neckline === "bateau") frontNeckDropCm = BOAT_FRONT_DROP_CM;

  const bicepCm = Math.max(m.bicepCircumference, cyc.upperArm) + SLEEVE_EASE_CM;
  const wristCm = m.wristCircumference + WRIST_EASE_CM;

  // Longueur de manche : épaule -> poignet moins la hauteur épaule -> dessous de bras (≈ emmanchure)
  const sleeveLengthFactor = sleeveLength === "3-4" ? 0.7 : sleeveLength === "courtes" ? 0.3 : 1;
  const underarmToWristCm = Math.max(m.armLength - armholeDepthCm, 10) * sleeveLengthFactor;

  // Entiers. Le corps est un multiple de 4 (dos = devant pairs, côtes 2/2), la carrure et
  // l'encolure dos sont pairs (symétrie), donc les épaules sont entières.
  const bodySts = 4 * Math.round(stsFor(finishedChestCm, g) / 4);
  const backSts = bodySts / 2;
  let crossBackSts = even(stsFor(crossBackCm, g));
  // La carrure ne peut pas dépasser le demi-corps moins 2 x 2 mailles d'emmanchure minimum.
  crossBackSts = Math.min(crossBackSts, backSts - 4);
  let backNeckSts = even(stsFor(backNeckWidthCm, g));
  backNeckSts = Math.max(backNeckSts, 4);
  backNeckSts = Math.min(backNeckSts, crossBackSts - 4); // au moins 2 m par épaule
  const shoulderSts = (crossBackSts - backNeckSts) / 2;

  const underarmSts = Math.max(2, Math.round(bodySts * UNDERARM_RATIO / 2));
  const bicepSts = even(stsFor(bicepCm, g));
  const wristSts = 4 * Math.round(stsFor(wristCm, g) / 4); // côtes 2/2
  const armholeRows = even(rowsFor(armholeDepthCm, g));
  const raglanYokeRows = even(rowsFor(raglanYokeDepthCm, g));
  const frontNeckRows = even(rowsFor(frontNeckDropCm, g));
  const bodyRows = rowsFor(m.bodyLength, g);
  const hemRows = rowsFor(HEM_RIB_CM, g);
  const cuffRows = rowsFor(CUFF_RIB_CM, g);
  const sleeveRows = rowsFor(underarmToWristCm, g);

  return {
    finishedChestCm, crossBackCm, armholeDepthCm, raglanYokeDepthCm, backNeckWidthCm, frontNeckDropCm,
    bicepCm, wristCm, underarmToWristCm, armLengthCm: m.armLength, sleeveLengthFactor,
    bodySts, backSts, crossBackSts, backNeckSts, shoulderSts, underarmSts, bicepSts, wristSts,
    armholeRows, raglanYokeRows, frontNeckRows, bodyRows, hemRows, cuffRows, sleeveRows,
  };
}

// -------------------------------------------
// Répartition d'événements (augmentations / diminutions) sur des rangs
// -------------------------------------------

export interface Segment {
  every: number; // tous les N rangs
  times: number; // N fois
}

export interface Distribution {
  segments: Segment[];
  rowsUsed: number; // = somme every*times
  straightRows: number; // rangs restants à tricoter droit après les segments
  /** événements impossibles à placer (plus d'événements que de rangs) */
  overflow: number;
}

/**
 * Place `count` événements sur `rows` rangs avec au plus un événement par rang, à intervalle
 * aussi régulier que possible, en 1 ou 2 segments (intervalles a et a+1). Si `minEvery` est
 * donné (ex. 2 pour "tous les rangs endroit"), aucun segment ne descend sous cet intervalle et
 * les rangs excédentaires deviennent des rangs droits.
 */
export function distribute(count: number, rows: number, minEvery = 1): Distribution {
  if (count <= 0 || rows <= 0) return { segments: [], rowsUsed: 0, straightRows: Math.max(rows, 0), overflow: Math.max(count, 0) };
  const maxCount = Math.floor(rows / minEvery);
  const placed = Math.min(count, maxCount);
  const overflow = count - placed;
  if (placed === 0) return { segments: [], rowsUsed: 0, straightRows: rows, overflow };
  const a = Math.floor(rows / placed);
  const r = rows - a * placed; // r segments à intervalle a+1
  const segments: Segment[] = [];
  if (placed - r > 0) segments.push({ every: a, times: placed - r });
  if (r > 0) segments.push({ every: a + 1, times: r });
  const rowsUsed = segments.reduce((s, x) => s + x.every * x.times, 0);
  return { segments, rowsUsed, straightRows: rows - rowsUsed, overflow };
}

/**
 * Variante pour le tricot à plat : intervalles pairs uniquement (les façonnages tombent sur
 * les rangs endroit). Travaille par paires de rangs puis double les intervalles.
 */
export function distributeEven(count: number, rows: number): Distribution {
  const pairs = Math.floor(rows / 2);
  const d = distribute(count, pairs, 1);
  const segments = d.segments.map((x) => ({ every: x.every * 2, times: x.times }));
  const rowsUsed = segments.reduce((a, x) => a + x.every * x.times, 0);
  return { segments, rowsUsed, straightRows: rows - rowsUsed, overflow: d.overflow };
}

/**
 * Tête de manche : diminutions tous les 2 rangs, puis à chaque rang près du sommet (jamais
 * d'intervalle de 3). Utilise exactement `rows` rangs quand count > rows / 2.
 */
export function distributeCap(count: number, rows: number): Distribution {
  if (count <= 0) return { segments: [], rowsUsed: 0, straightRows: rows, overflow: 0 };
  if (count > rows) return { segments: [{ every: 1, times: rows }], rowsUsed: rows, straightRows: 0, overflow: count - rows };
  if (2 * count <= rows) return distributeEven(count, rows);
  const a = rows - count; // tous les 2 rangs
  const b = 2 * count - rows; // à chaque rang
  const segments: Segment[] = [];
  if (a > 0) segments.push({ every: 2, times: a });
  if (b > 0) segments.push({ every: 1, times: b });
  return { segments, rowsUsed: 2 * a + b, straightRows: rows - 2 * a - b, overflow: 0 };
}

// -------------------------------------------
// Géométrie : emmanchure montée et tête de manche
// -------------------------------------------

export interface ArmholeShape {
  bindOffSts: number; // rabattues au début des 2 premiers rangs (par côté)
  decreases: number; // diminutions 1 m par côté ensuite
  decreaseDist: Distribution; // réparties sur les rangs endroit
  straightRows: number; // rangs droits jusqu'à l'épaule
  perimeterCm: number; // longueur du bord d'emmanchure, par côté, dessous de bras -> épaule
}

/** Emmanchure montée : du demi-corps à la carrure sur armholeRows. */
export function armholeShape(d: GarmentDims, g: Gauge): ArmholeShape {
  const removePerSide = (d.backSts - d.crossBackSts) / 2; // entier (les deux sont pairs)
  // Environ la moitié rabattue d'un coup (dessous de bras), le reste en diminutions pour la courbe.
  const bindOffSts = Math.max(1, Math.min(d.underarmSts, Math.ceil(removePerSide / 2)));
  const decreases = removePerSide - bindOffSts;
  // Diminutions sur les rangs endroit, dans la première moitié de l'emmanchure.
  const shapingRows = Math.max(2, Math.floor(d.armholeRows / 2));
  const decreaseDist = distributeEven(decreases, shapingRows);
  const rowsForShaping = 2 + decreaseDist.rowsUsed;
  const straightRows = Math.max(0, d.armholeRows - rowsForShaping);
  const perimeterCm =
    cmForSts(bindOffSts, g) +
    Math.hypot(cmForSts(decreases, g), cmForRows(decreaseDist.rowsUsed + 2, g)) +
    cmForRows(straightRows, g);
  return { bindOffSts, decreases, decreaseDist, straightRows, perimeterCm };
}

export interface SleeveCapShape {
  capRows: number;
  bindOffSts: number; // = emmanchure
  decreases: number; // par côté
  decreaseDist: Distribution;
  finalBindOff: number; // mailles restantes au sommet
  perimeterCm: number; // longueur du bord de tête, par côté (hors sommet)
  armholePerimeterCm: number;
  diffCm: number; // tête - emmanchure, par côté (sommet réparti)
}

/**
 * Tête de manche montée. La hauteur de tête est cherchée entre 55 % et 85 % de la profondeur
 * d'emmanchure pour que le périmètre de la tête corresponde à celui de l'emmanchure.
 */
export function sleeveCapShape(d: GarmentDims, g: Gauge, armhole: ArmholeShape): SleeveCapShape {
  const capTopSts = even(stsFor(CAP_TOP_WIDTH_CM, g));
  const bindOffSts = armhole.bindOffSts;
  const decreases = Math.max(0, (d.bicepSts - 2 * bindOffSts - capTopSts) / 2);
  let best: SleeveCapShape | null = null;
  for (let ratio = 0.55; ratio <= 0.851; ratio += 0.05) {
    const capRows = even(Math.round(d.armholeRows * ratio));
    const shapingRows = Math.max(2, capRows - 4); // 2 rangs de rabattage au départ, 2 à l'arrivée
    const decreaseDist = distributeCap(decreases, shapingRows);
    const perimeterCm =
      cmForSts(bindOffSts, g) + Math.hypot(cmForSts(decreases, g), cmForRows(shapingRows, g));
    // Le sommet de la tête (capTop) couvre le haut de l'emmanchure : on le répartit sur les deux côtés.
    const diffCm = perimeterCm + cmForSts(capTopSts, g) / 2 - armhole.perimeterCm;
    const cand: SleeveCapShape = {
      capRows, bindOffSts, decreases, decreaseDist, finalBindOff: capTopSts,
      perimeterCm, armholePerimeterCm: armhole.perimeterCm, diffCm,
    };
    if (decreaseDist.overflow > 0) continue;
    if (!best || Math.abs(cand.diffCm) < Math.abs(best.diffCm)) best = cand;
  }
  if (!best) {
    // Impossible de placer les diminutions : tête à 85 %, tout ce qui déborde part en overflow.
    const capRows = even(Math.round(d.armholeRows * 0.85));
    const decreaseDist = distributeCap(decreases, Math.max(2, capRows - 4));
    best = { capRows, bindOffSts, decreases, decreaseDist, finalBindOff: capTopSts, perimeterCm: 0, armholePerimeterCm: armhole.perimeterCm, diffCm: NaN };
  }
  return best;
}

// -------------------------------------------
// Géométrie : encolure
// -------------------------------------------

/** Longueur approximative du bord d'encolure (dos + devant), cm. */
export function neckPerimeterCm(d: GarmentDims, neckline: NecklineKind): number {
  const w = d.backNeckWidthCm;
  const drop = d.frontNeckDropCm;
  const back = w * 1.05;
  const front = neckline === "col-v"
    ? 2 * Math.hypot(drop, w / 2)
    : 2 * Math.hypot(drop, w / 2) * 1.1;
  return back + front;
}

/**
 * Encolure devant ras du cou (bottom-up) : mailles rabattues au centre puis diminutions de
 * chaque côté réparties sur les rangs endroit de frontNeckRows.
 */
export function crewFrontNeckShape(d: GarmentDims, shoulderRows = 0): { centerBindOff: number; sideDecreases: number; dist: Distribution } {
  const maxByRows = Math.max(0, Math.floor((d.frontNeckRows - 1 - shoulderRows) / 2));
  const sideDecreases = Math.max(0, Math.min(Math.floor(d.backNeckSts / 4), maxByRows));
  const centerBindOff = d.backNeckSts - 2 * sideDecreases;
  // Diminutions serrées (tous les 2 rangs) pour arrondir, puis droit jusqu'à l'épaule.
  const rowsUsed = 2 * sideDecreases;
  const dist: Distribution = {
    segments: sideDecreases > 0 ? [{ every: 2, times: sideDecreases }] : [],
    rowsUsed,
    straightRows: Math.max(0, d.frontNeckRows - 1 - shoulderRows - rowsUsed),
    overflow: 0,
  };
  return { centerBindOff, sideDecreases, dist };
}
