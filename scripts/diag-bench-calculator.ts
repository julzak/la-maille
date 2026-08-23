import { generateFullPattern } from "../lib/pattern-calculator"
import { SIZE_PRESETS, SIZE_ORDER } from "../lib/size-presets"
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
const variants: Record<string, Partial<GarmentAnalysis>> = {
  "pull raglan seamless": {},
  "pull montees seamless": { sleeves: { type: "montees", length: "longues", confidence: 0.9 } },
  "pull montees pieces": { sleeves: { type: "montees", length: "longues", confidence: 0.9 }, construction: { method: "pieces-assemblees", confidence: 0.95, reasoning: "" } },
  "pull raglan pieces": { construction: { method: "pieces-assemblees", confidence: 0.95, reasoning: "" } },
  "cardigan montees": { garment: { type: "cardigan", confidence: 0.9 }, sleeves: { type: "montees", length: "longues", confidence: 0.9 }, neckline: { type: "ouvert-cardigan", confidence: 0.9 }, closure: { type: "boutons", buttonCountEstimate: 6, confidence: 0.9 } },
}
const gauge: Gauge = { stitchesPer10cm: 20, rowsPer10cm: 28, needleSize: 4 } // DK standard
const ease = 5

for (const [vname, v] of Object.entries(variants)) {
  console.log(`\n===== ${vname} (gauge 20x28, ease +${ease})`)
  for (const size of SIZE_ORDER) {
    const m = { ...SIZE_PRESETS[size].measurements, ease }
    const p = generateFullPattern({ ...base, ...v } as GarmentAnalysis, gauge, m, { weight: "dk" }, "fr")
    const bad: string[] = []
    const lines: string[] = []
    for (const piece of p.pieces) {
      lines.push(`  [${piece.name}] montage ${piece.castOn} m, ${piece.totalRows} rgs (${(piece.totalRows/2.8).toFixed(0)} cm)`)
      for (const ins of piece.instructions) {
        const t = ins.text
        if (/-\d|\b0 m\b|NaN|Infinity/.test(t)) bad.push(`${piece.name}: "${t.slice(0,140)}"`)
        if (ins.rowEnd < ins.rowStart) bad.push(`${piece.name}: rangs ${ins.rowStart}->${ins.rowEnd} (negatif) "${t.slice(0,80)}"`)
      }
    }
    console.log(`-- ${size} (poitrine ${m.chestCircumference}, epaules ${m.shoulderWidth}, biceps ${m.bicepCircumference})`)
    console.log(lines.join("\n"))
    if (bad.length) console.log("  !! " + bad.join("\n  !! "))
    if (size === "M") { for (const piece of p.pieces) for (const ins of piece.instructions) console.log(`     r${ins.rowStart}-${ins.rowEnd}: ${ins.text}`) }
  }
}
