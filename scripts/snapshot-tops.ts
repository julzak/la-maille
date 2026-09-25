// Instantané des patrons haut (pull, cardigan, gilet) pour prouver qu'un changement du calculateur
// ne modifie pas leur sortie. Lancement : ./node_modules/.bin/tsx scripts/snapshot-tops.ts > out.json
import { SIZE_PRESETS, SIZE_ORDER } from "../lib/size-presets"
import { generateFullPattern } from "../lib/pattern-calculator"
import type { GarmentAnalysis, Gauge } from "../lib/types"

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
const CONFIGS: Record<string, GarmentAnalysis> = {
  "pull raglan crew": A({}),
  "pull raglan V": A({ neckline: { type: "col-v", confidence: 0.9 } }),
  "pull montees corps rond": A({ sleeves: montees }),
  "pull montees pieces V": A({ sleeves: montees, construction: pieces, neckline: { type: "col-v", confidence: 0.9 } }),
  "cardigan montees": A({ garment: { type: "cardigan", confidence: 0.9 }, sleeves: montees, neckline: { type: "ouvert-cardigan", confidence: 0.9 }, closure: { type: "boutons", buttonCountEstimate: 6, confidence: 0.9 } }),
  "pull marteau": A({ sleeves: { type: "marteau", length: "longues", confidence: 0.9 }, construction: pieces }),
  "gilet sans manches": A({ garment: { type: "gilet", confidence: 0.9 }, sleeves: { type: "sans-manches", length: "sans", confidence: 0.9 } }),
  "autre": A({ garment: { type: "autre", confidence: 0.5 } }),
}
const GAUGES: Gauge[] = [{ stitchesPer10cm: 28, rowsPer10cm: 36, needleSize: 2.5 }, { stitchesPer10cm: 20, rowsPer10cm: 28, needleSize: 4 }, { stitchesPer10cm: 13, rowsPer10cm: 18, needleSize: 7 }]
const out: Record<string, unknown> = {}
for (const [c, a] of Object.entries(CONFIGS)) for (const gi of [0, 1, 2]) for (const g of [GAUGES[gi]]) for (const s of SIZE_ORDER) for (const lang of ["fr", "en"] as const) {
  const p = generateFullPattern(a, g, { ...SIZE_PRESETS[s].measurements, ease: 5 }, { weight: "dk" }, lang)
  out[`${c}|${gi}|${s}|${lang}`] = { ...p, id: null, createdAt: null }
}
console.log(JSON.stringify(out))
