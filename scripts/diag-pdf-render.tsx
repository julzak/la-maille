// Rend le PDF d'un patron hors navigateur pour inspection (pdfinfo / pdftotext).
// Lancement : ./node_modules/.bin/tsx --tsconfig scripts/tsconfig.pdf.json scripts/diag-pdf-render.tsx
import { createElement } from "react"
import { renderToBuffer } from "@react-pdf/renderer"
import { writeFileSync } from "fs"
import { generateFullPattern } from "../lib/pattern-calculator"
import { SIZE_PRESETS } from "../lib/size-presets"
import { PatternDocument } from "../lib/pdf/PatternDocument"
const a: any = { analysable: true, rejectionReason: null, garment: { type: "pull", confidence: 0.9 }, construction: { method: "top-down", confidence: 0.8, reasoning: "" }, neckline: { type: "ras-du-cou", confidence: 0.9 }, neckband: { construction: "picked-up", height: "basse", stitch: "cotes-1x1", doubled: false, confidence: 0.8 }, sleeves: { type: "raglan", length: "longues", confidence: 0.9 }, stitch: { mainPattern: "jersey", confidence: 0.9, notes: null }, closure: { type: "aucune", buttonCountEstimate: null, confidence: 0.9 }, fit: { style: "oversized", confidence: 0.8 }, limitations: [], warnings: [], overallConfidence: "high" }
async function main() {
  const p = generateFullPattern(a, { stitchesPer10cm: 22, rowsPer10cm: 30, needleSize: 4 }, { ...SIZE_PRESETS.M.measurements, ease: 14 }, { weight: "dk" }, "fr")
  const buf = await renderToBuffer(createElement(PatternDocument as any, { pattern: p, analysis: a, language: "fr" }) as any)
  writeFileSync("/tmp/la-maille-test.pdf", buf)
  console.log("pdf bytes", buf.length)
}
main().catch(e => { console.error(e); process.exit(1) })
