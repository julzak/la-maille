// Régression du générateur de bonnets.
// Lancement : ./node_modules/.bin/tsx scripts/test-hat.ts
// Sanity check (doit échouer) : BREAK=1 ./node_modules/.bin/tsx scripts/test-hat.ts
//
// Invariants vérifiés sur 7 tailles x 3 échantillons x 6 configurations x 2 langues :
//  1. aucun nombre négatif, non entier, NaN, ni "0 m." dans un montage
//  2. plages de rangs cohérentes, dernier rang décrit = totalRows, mode Tricot couvre 1..totalRows
//  3. montage multiple de 8 (quartiers) et du motif de côtes, tour tricoté à ±4 m. de la cible
//  4. sommet : le décompte des mailles tour par tour tombe à 8, chaque diminution retire exactement 8 m.
//  5. hauteur : bord visible + corps + sommet = hauteur demandée à 1 tour près (sauf avertissement)
//  6. un bonnet ne produit jamais de pièce de pull, un pull jamais de bonnet

import { generateFullPattern } from "../lib/pattern-calculator"
import { computeHatDims, HAT_CROWN_SECTIONS } from "../lib/garments/hat"
import { HAT_SIZE_ORDER, hatMeasurementsForSize } from "../lib/garments/hat-sizes"
import { SIZE_PRESETS } from "../lib/size-presets"
import { rowsFor, stsFor } from "../lib/shaping"
import { parsePatternToPieces } from "../hooks/usePatternParsing"
import type { GarmentAnalysis, Gauge, GeneratedPattern, HatAnalysis, HatMeasurements } from "../lib/types"

const hatBase: GarmentAnalysis = {
  analysable: true, rejectionReason: null,
  garment: { type: "bonnet", confidence: 0.9 },
  construction: { method: "bottom-up", confidence: 0.8, reasoning: "" },
  neckline: { type: "unknown", confidence: 0 },
  neckband: { construction: "unknown", height: "unknown", stitch: "unknown", doubled: null, confidence: 0 },
  sleeves: { type: "unknown", length: "sans", confidence: 0 },
  stitch: { mainPattern: "jersey", confidence: 0.9, notes: null },
  closure: { type: "aucune", buttonCountEstimate: null, confidence: 0 },
  fit: { style: "unknown", confidence: 0 },
  hat: { brim: { type: "cotes-1x1", folded: false }, shape: "ajuste", crown: "quartiers", pompom: false, confidence: 0.9 },
  limitations: [], warnings: [], overallConfidence: "high",
}
const H = (hat: Partial<HatAnalysis>, extra: Partial<GarmentAnalysis> = {}): GarmentAnalysis => ({ ...hatBase, ...extra, hat: { ...hatBase.hat!, ...hat } })
const CONFIGS: Record<string, GarmentAnalysis> = {
  "ajuste cotes 1x1": H({}),
  "ajuste cotes 2x2": H({ brim: { type: "cotes-2x2", folded: false } }),
  "revers cotes 2x2 pompon": H({ brim: { type: "cotes-2x2", folded: true }, pompom: true }),
  "ample mousse": H({ shape: "ample", brim: { type: "mousse", folded: false } }),
  "bord roule": H({ brim: { type: "roule", folded: false } }),
  "bord inconnu torsades": H({ brim: { type: "unknown", folded: null } }, { stitch: { mainPattern: "torsades", confidence: 0.8, notes: null } }),
}
const GAUGES: Record<string, Gauge> = {
  fin: { stitchesPer10cm: 28, rowsPer10cm: 36, needleSize: 2.5 },
  dk: { stitchesPer10cm: 20, rowsPer10cm: 28, needleSize: 4 },
  gros: { stitchesPer10cm: 13, rowsPer10cm: 18, needleSize: 7 },
}

let failures = 0, checks = 0, heightWarnings = 0
const fail = (ctx: string, msg: string) => { failures++; console.log(`FAIL [${ctx}] ${msg}`) }
const check = (ok: boolean, ctx: string, msg: string) => { checks++; if (!ok) fail(ctx, msg) }
const BREAK = process.env.BREAK === "1"

for (const [cname, analysis] of Object.entries(CONFIGS)) for (const [gname, gauge] of Object.entries(GAUGES)) for (const size of HAT_SIZE_ORDER) for (const lang of ["fr", "en"] as const) {
  const ctx = `${cname} / ${gname} / ${size} / ${lang}`
  const m: HatMeasurements = hatMeasurementsForSize(size, analysis.hat!.shape)
  let p: GeneratedPattern
  try { p = generateFullPattern(analysis, gauge, m, { weight: "dk" }, lang) } catch (e) { fail(ctx, `exception ${e}`); continue }
  const d = computeHatDims(m, gauge, analysis)
  if (BREAK) d.castOn += 1 // sabotage : le montage ne tombe plus sur un multiple de 8

  // 6. une seule pièce, un bonnet
  check(p.pieces.length === 1 && /bonnet|hat/i.test(p.pieces[0].name), ctx, `pièces inattendues : ${p.pieces.map(x => x.name).join(", ")}`)
  const piece = p.pieces[0]
  const texts = piece.instructions.map(i => `${i.text} ${i.notes ?? ""}`)

  // 1. nombres
  for (const t of texts) {
    check(!/NaN|Infinity|undefined/.test(t), ctx, `valeur invalide : ${t}`)
    check(!/(^|\s)-\d/.test(t), ctx, `nombre négatif : ${t}`)
    check(!/Monter 0 m|Cast on 0 st/.test(t), ctx, `montage nul : ${t}`)
  }
  // 2. rangs
  let prevEnd = 0
  for (const i of piece.instructions) {
    check(i.rowEnd >= i.rowStart, ctx, `plage inversée ${i.rowStart}-${i.rowEnd}`)
    check(i.rowStart === prevEnd + 1, ctx, `trou ou chevauchement avant le rang ${i.rowStart} (précédent ${prevEnd})`)
    prevEnd = i.rowEnd
  }
  check(prevEnd === piece.totalRows, ctx, `dernier rang ${prevEnd} != totalRows ${piece.totalRows}`)
  for (const pp of parsePatternToPieces(p, lang)) {
    const rows = pp.instructions.map(i => i.row)
    check(rows.length === pp.totalRows && rows.every((r, i) => r === i + 1), ctx, `mode Tricot : ${rows.length} rangs pour ${pp.totalRows}`)
  }
  // 3. montage
  const rib = analysis.hat!.brim.type === "cotes-2x2" ? 4 : analysis.hat!.brim.type === "mousse" || analysis.hat!.brim.type === "roule" ? 1 : 2
  check(d.castOn % HAT_CROWN_SECTIONS === 0 && d.castOn % rib === 0, ctx, `montage ${d.castOn} pas multiple de ${HAT_CROWN_SECTIONS} et ${rib}`)
  check(piece.castOn === d.castOn || BREAK, ctx, `castOn pièce ${piece.castOn} != ${d.castOn}`)
  check(Math.abs(d.castOn - stsFor(d.finishedCircCm, gauge)) <= 4 || d.castOn === 24, ctx, `montage ${d.castOn} trop loin de la cible ${stsFor(d.finishedCircCm, gauge)}`)
  check(new RegExp(`(Monter|Cast on) ${d.castOn} (m\\.|sts)`).test(texts[0]), ctx, `le texte de montage ne mentionne pas ${d.castOn}`)
  // 4. sommet : on rejoue le décompte annoncé dans chaque tour
  let sts = d.castOn
  for (const t of texts.slice(d.bodyRows > 0 ? 2 : 1)) {
    const announced = Number((t.match(/\((\d+) (m\.|sts)\)/) || [])[1])
    if (/diminutions|Decrease round/.test(t)) { check(announced === sts - HAT_CROWN_SECTIONS, ctx, `diminution annoncée ${announced}, attendu ${sts - HAT_CROWN_SECTIONS}`); sts -= HAT_CROWN_SECTIONS }
    else check(announced === sts, ctx, `tour droit annoncé ${announced}, attendu ${sts}`)
  }
  check(sts === d.remainingSts && sts >= 6 && sts <= 12, ctx, `mailles restantes ${sts}`)
  // 5. hauteur
  const target = rowsFor(m.hatHeight, gauge)
  const knitVisible = d.visibleBrimRows + d.bodyRows + d.crownRows
  if (piece.warnings.some(w => /plus courte|shorter/.test(w))) heightWarnings++
  else check(Math.abs(knitVisible - target) <= 1, ctx, `hauteur ${knitVisible} tours vs cible ${target}`)
  check(d.brimRows === (analysis.hat!.brim.folded ? 2 : 1) * d.visibleBrimRows, ctx, `bord ${d.brimRows} tours incohérent avec le revers`)
  // avertissement motif
  if (analysis.stitch.mainPattern === "torsades") check(piece.warnings.some(w => /torsades|cables/.test(w)), ctx, "avertissement motif absent")
  check(p.estimatedYardage > 0, ctx, `métrage ${p.estimatedYardage}`)
}

// 6. étanchéité des catégories
try {
  generateFullPattern(hatBase, GAUGES.dk, { ...SIZE_PRESETS.M.measurements, ease: 5 }, { weight: "dk" }, "fr")
  fail("categorie", "un bonnet avec des mesures de pull a produit un patron")
} catch { checks++ }
try {
  generateFullPattern({ ...hatBase, garment: { type: "pull", confidence: 0.9 }, hat: undefined }, GAUGES.dk, hatMeasurementsForSize("adulte"), { weight: "dk" }, "fr")
  fail("categorie", "un pull avec des mesures de bonnet a produit un patron")
} catch { checks++ }

const total = Object.keys(CONFIGS).length * Object.keys(GAUGES).length * HAT_SIZE_ORDER.length * 2
console.log(`\n${total} patrons bonnet, ${checks} controles, ${failures} echecs, ${heightWarnings} avertissements hauteur`)
process.exit(failures > 0 ? 1 : 0)
