// Rejoue la VRAIE analyse (lib/anthropic.ts : prompt + normalisation) sur les photos de
// tasks/bonnet-images, puis génère le patron quand la photo est acceptée. Cache dans
// tasks/bonnet-results/ (--force pour rejouer, chaque appel est facturé).
//   set -a; source .env.local; set +a; ./node_modules/.bin/tsx scripts/diag-bonnet-analyse.ts [--force]
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "fs"
import { join } from "path"
import { analyzeGarmentImage } from "../lib/anthropic"
import { generateFullPattern } from "../lib/pattern-calculator"
import { hatMeasurementsForSize } from "../lib/garments/hat-sizes"
import { SIZE_PRESETS } from "../lib/size-presets"
import { garmentCategory } from "../lib/types"

const dir = join(__dirname, "../tasks/bonnet-images"), out = join(__dirname, "../tasks/bonnet-results")
mkdirSync(out, { recursive: true })
async function main() {
  for (const f of readdirSync(dir).filter(f => f.endsWith(".jpg")).sort()) {
    const cache = join(out, f.replace(".jpg", ".json"))
    let analysis
    if (existsSync(cache) && !process.argv.includes("--force")) analysis = JSON.parse(readFileSync(cache, "utf8"))
    else {
      const t0 = Date.now()
      const r = await analyzeGarmentImage({ images: [{ imageBase64: readFileSync(join(dir, f)).toString("base64"), mediaType: "image/jpeg" }], language: "fr" })
      analysis = r.analysis; writeFileSync(cache, JSON.stringify(analysis, null, 2)); console.log(`  (${Date.now() - t0} ms)`)
    }
    let line = `${f} | analysable=${analysis.analysable} | type=${analysis.garment?.type}`
    if (analysis.analysable && analysis.hat) line += ` | hat=${JSON.stringify(analysis.hat)} | stitch=${analysis.stitch.mainPattern}`
    if (!analysis.analysable) line += ` | ${analysis.rejectionReason}`
    if (analysis.analysable) {
      for (const lang of ["fr", "en"] as const) {
        const m = garmentCategory(analysis.garment.type) === "hat" ? hatMeasurementsForSize("adulte", analysis.hat?.shape) : { ...SIZE_PRESETS.M.measurements, ease: 8 }
        const p = generateFullPattern(analysis, { stitchesPer10cm: 22, rowsPer10cm: 30, needleSize: 4 }, m, { weight: "dk" }, lang)
        line += ` | ${lang}: ${p.pieces.map(x => x.name).join("+")} (${p.pieces[0].totalRows} rgs, ${p.pieces[0].warnings.length} avert.)`
      }
    }
    console.log(line)
  }
}
main().catch(e => { console.error(e); process.exit(1) })
