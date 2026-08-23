// Régression du calculateur de patrons.
// Lancement : ./node_modules/.bin/tsx scripts/test-calculator.ts
// Sanity check (doit échouer) : CALC=/chemin/vers/ancien-calculateur.ts ./node_modules/.bin/tsx scripts/test-calculator.ts
//
// Invariants vérifiés sur 6 tailles x 3 échantillons x 9 configurations :
//  1. aucun nombre négatif, non entier, NaN, ni "0 m." dans un montage / rabattage / relevage
//  2. plages de rangs cohérentes (fin >= début, pas de chevauchement hors "en même temps")
//  3. pièces qui se correspondent : biceps manche = biceps corps, dessous de bras manche = corps,
//     épaules devant = épaules dos, tour de corps raglan = cible, manche raglan = biceps
//  4. contrôle du périmètre tête de manche / emmanchure (compté, non bloquant)

import path from "path"
import { SIZE_PRESETS, SIZE_ORDER } from "../lib/size-presets"
import { computeDims } from "../lib/shaping"
import type { GarmentAnalysis, Gauge, GeneratedPattern } from "../lib/types"

const calcPath = process.env.CALC ? path.resolve(process.env.CALC) : path.join(__dirname, "../lib/pattern-calculator")
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { generateFullPattern } = require(calcPath) as { generateFullPattern: (...a: any[]) => GeneratedPattern }

const base: GarmentAnalysis = {
  analysable: true, rejectionReason: null,
  garment: { type: "pull", confidence: 0.9 },
  construction: { method: "top-down", confidence: 0.8, reasoning: "" },
  neckline: { type: "ras-du-cou", confidence: 0.9 },
  neckband: { construction: "picked-up", height: "moyenne", stitch: "cotes-1x1", doubled: false, confidence: 0.8 },
  sleeves: { type: "raglan", length: "longues", confidence: 0.9 },
  stitch: { mainPattern: "jersey", confidence: 0.9, notes: null },
  closure: { type: "aucune", buttonCountEstimate: null, confidence: 0.9 },
  fit: { style: "regular", confidence: 0.8 },
  limitations: [], warnings: [], overallConfidence: "high",
}
const A = (v: Partial<GarmentAnalysis>): GarmentAnalysis => ({ ...base, ...v })
const montees = { type: "montees" as const, length: "longues" as const, confidence: 0.9 }
const pieces = { method: "pieces-assemblees" as const, confidence: 0.95, reasoning: "" }
const cardigan = { type: "cardigan" as const, confidence: 0.9 }
const CONFIGS: Record<string, GarmentAnalysis> = {
  "pull raglan crew": A({}),
  "pull raglan V": A({ neckline: { type: "col-v", confidence: 0.9 } }),
  "pull montees corps rond": A({ sleeves: montees }),
  "pull montees pieces V": A({ sleeves: montees, construction: pieces, neckline: { type: "col-v", confidence: 0.9 } }),
  "pull montees 3/4": A({ sleeves: { ...montees, length: "3-4" } }),
  "cardigan montees": A({ garment: cardigan, sleeves: montees, neckline: { type: "ouvert-cardigan", confidence: 0.9 }, closure: { type: "boutons", buttonCountEstimate: 6, confidence: 0.9 } }),
  "cardigan raglan": A({ garment: cardigan, closure: { type: "boutons", buttonCountEstimate: 5, confidence: 0.9 } }),
  "pull marteau": A({ sleeves: { type: "marteau", length: "longues", confidence: 0.9 }, construction: pieces }),
  "gilet sans manches": A({ garment: { type: "gilet", confidence: 0.9 }, sleeves: { type: "sans-manches", length: "sans", confidence: 0.9 } }),
}
const GAUGES: Record<string, Gauge> = {
  fin: { stitchesPer10cm: 28, rowsPer10cm: 36, needleSize: 2.5 },
  dk: { stitchesPer10cm: 20, rowsPer10cm: 28, needleSize: 4 },
  gros: { stitchesPer10cm: 13, rowsPer10cm: 18, needleSize: 7 },
}

const num = (re: RegExp, s: string): number | null => { const m = s.match(re); return m ? Number(m[1]) : null }
const all = (p: GeneratedPattern) => p.pieces.flatMap(pc => pc.instructions.map(i => `${i.text} ${i.notes ?? ""}`))

let failures = 0, checks = 0, capWarnings = 0
const fail = (ctx: string, msg: string) => { failures++; console.log(`FAIL [${ctx}] ${msg}`) }

for (const [cname, analysis] of Object.entries(CONFIGS)) for (const [gname, gauge] of Object.entries(GAUGES)) for (const size of SIZE_ORDER) {
  const m = { ...SIZE_PRESETS[size].measurements, ease: 5 }
  const ctx = `${cname} / ${gname} / ${size}`
  let p: GeneratedPattern
  try { p = generateFullPattern(analysis, gauge, m, { weight: "dk" }, "fr") } catch (e) { fail(ctx, `exception ${e}`); continue }
  const texts = all(p)

  // 1. nombres
  for (const t of texts) {
    checks++
    if (/NaN|Infinity/.test(t)) fail(ctx, `NaN/Infinity : "${t.slice(0, 120)}"`)
    if (/(^|[^\d])-\d/.test(t)) fail(ctx, `nombre negatif : "${t.slice(0, 120)}"`)
    if (/\d+\.\d+ (fois|times)/.test(t)) fail(ctx, `non entier : "${t.slice(0, 120)}"`)
    if (/(monter|rabattre|relever|reprendre) (les |la |l')?0 m/i.test(t)) fail(ctx, `zero maille : "${t.slice(0, 120)}"`)
  }
  // 2. rangs
  for (const pc of p.pieces) {
    if (/boutonnage|front bands/i.test(pc.name)) continue
    let prevEnd = 0
    for (const i of pc.instructions) {
      checks++
      if (i.rowEnd < i.rowStart) fail(ctx, `${pc.name}: rangs ${i.rowStart}->${i.rowEnd}`)
      const simultaneous = /en même temps|at the same time/i.test(i.text)
      if (!simultaneous && i.rowStart <= prevEnd && i.rowStart > 1) fail(ctx, `${pc.name}: chevauchement r${i.rowStart} <= fin precedente r${prevEnd} "${i.text.slice(0, 80)}"`)
      if (!simultaneous) prevEnd = Math.max(prevEnd, i.rowEnd)
    }
  }
  // 3. correspondance entre pièces
  const d = computeDims(m, gauge, analysis.neckline.type === "col-v" ? "col-v" : "ras-du-cou", analysis.sleeves.length)
  const sleeve = p.pieces.find(pc => /manche|sleeve/i.test(pc.name))
  const back = p.pieces.find(pc => /^dos|^back/i.test(pc.name))
  const fronts = p.pieces.filter(pc => /^devant|^front/i.test(pc.name))
  const yoke = p.pieces.find(pc => /empiècement|yoke/i.test(pc.name))
  const sleeveTxt = sleeve ? sleeve.instructions.map(i => i.text).join(" ") : ""
  checks++
  if (yoke) {
    const sep = yoke.instructions.map(i => i.text).join(" ")
    const bodyAtSep = num(/Corps : (\d+) m/, sep)
    if (bodyAtSep !== d.bodySts) fail(ctx, `raglan corps ${bodyAtSep} != ${d.bodySts}`)
    const sleeveAtSep = num(/Total : (\d+) m/, sleeveTxt)
    if (sleeveAtSep === null || Math.abs(sleeveAtSep - d.bicepSts) > 2) fail(ctx, `raglan manche ${sleeveAtSep} vs biceps ${d.bicepSts}`)
    const wrist = num(/On obtient (\d+) m/, sleeveTxt)
    if (wrist !== null && wrist !== d.wristSts) fail(ctx, `poignet ${wrist} != ${d.wristSts}`)
    const castOnParts = yoke.instructions[0].text.split(/Placer|Place/)[0].match(/(\d+) m\. (?:devant|manche|dos|raglan)/g) || []
    const sum = castOnParts.reduce((s, x) => s + Number(x.split(" ")[0]), 0)
    const castOn = num(/Monter (\d+) m/, yoke.instructions[0].text)
    if (castOn !== null && sum !== castOn) fail(ctx, `montage raglan ${castOn} != somme des parties ${sum}`)
  } else if (sleeve && back) {
    const top = num(/On obtient (\d+) m/, sleeveTxt)
    const isDrop = /marteau/.test(cname)
    if (!isDrop && top !== d.bicepSts) fail(ctx, `biceps manche ${top} != ${d.bicepSts}`)
    const capBO = num(/Tête de manche : rabattre (\d+) m/, sleeveTxt)
    const backTxt = back.instructions.map(i => i.text).join(" ")
    const bodyTxt = p.pieces.find(pc => /corps|body/i.test(pc.name))?.instructions.map(i => i.text).join(" ") ?? backTxt
    const armBO = num(/rabattre (\d+) m\. (?:au début des 2 prochains rangs|de chaque côté de chaque marqueur)/, bodyTxt)
    if (!isDrop && capBO !== armBO) fail(ctx, `dessous de bras manche ${capBO} != corps ${armBO}`)
    const shoulders = (t: string) => (t.match(/\(([\d, ]+) m\.\)/) || t.match(/rabattre les (\d+) m\. d'épaule/) || [])[1]
    const backSh = shoulders(backTxt)
    for (const f of fronts) {
      const fs = shoulders(f.instructions.map(i => i.text).join(" "))
      if (fs !== backSh) fail(ctx, `épaules ${f.name} (${fs}) != dos (${backSh})`)
    }
    const capWarn = sleeve.warnings.some(w => /tête de manche diffère|cap edge differs/.test(w))
    if (capWarn) capWarnings++
  }
  if (back) {
    const backTxt = back.instructions.map(i => i.text).join(" ")
    const neck = num(/rabattre les (\d+) m\. centrales, puis/, backTxt)
    if (neck !== null && neck !== d.backNeckSts && !/marteau/.test(cname)) fail(ctx, `encolure dos ${neck} != ${d.backNeckSts}`)
    if (neck !== null && neck < 4) fail(ctx, `encolure dos trop petite ${neck}`)
  }
}

const total = Object.keys(CONFIGS).length * Object.keys(GAUGES).length * SIZE_ORDER.length
console.log(`\n${total} patrons, ${checks} controles, ${failures} echecs, ${capWarnings} avertissements tête de manche`)
process.exit(failures > 0 ? 1 : 0)
