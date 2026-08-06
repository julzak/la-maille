/**
 * Diagnostic latence analyse photo : effet des leviers API sur claude-opus-5
 * et comparaison claude-sonnet-5, sur les 4 images du test A/B.
 *
 *   ./node_modules/.bin/tsx scripts/diag-latence-opus.ts tasks/ab-kimi-images
 *   ./node_modules/.bin/tsx scripts/diag-latence-opus.ts tasks/ab-kimi-images --force
 *
 * Même principe que diag-ab-kimi.ts : SYSTEM_PROMPT et prompt texte extraits
 * du source de lib/anthropic.ts (non exportés), même construction de message
 * que la prod, cache des résultats dans tasks/latence-results/ (les appels
 * déjà en cache ne sont pas re-facturés ; un cache sans sortie complète est
 * rejoué si la variante en a besoin pour la section qualité).
 *
 * Variantes :
 *  - baseline        : identique prod (thinking adaptatif par défaut, effort high)
 *  - effort-low      : output_config.effort = "low"
 *  - effort-medium   : output_config.effort = "medium"
 *  - compact-low     : effort low + consigne de sortie compacte dans le system prompt
 *  - thinking-off    : thinking disabled (contre-productif, gardé pour mémoire)
 *  - low-hires       : effort low sur les mêmes images agrandies à 2576px
 *                      (tasks/latence-hires/) pour mesurer l'effet de la taille
 *                      d'image, la prod n'ayant aucun redimensionnement
 *  - fast / fast-effort-low : speed fast (quota org à 0 au 2026-08-06)
 *  - sonnet-5 / sonnet-5-low : claude-sonnet-5 ($3/$15)
 *
 * Rapport : tasks/latence-opus-report.md (tableau + sorties complètes pour
 * juger la qualité de effort-low / compact-low / sonnet-5-low vs baseline).
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "fs";
import { join, basename, extname } from "path";
import Anthropic from "@anthropic-ai/sdk";

// Chargement minimal de .env.local (pas de dependance dotenv).
try {
  const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=("?)(.*)\2$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[3];
    }
  }
} catch {
  // pas de .env.local : environnement deja configure
}

const anthropicSource = readFileSync(new URL("../lib/anthropic.ts", import.meta.url), "utf8");
const spMatch = anthropicSource.match(/const SYSTEM_PROMPT = `([\s\S]*?)`;/);
const tpMatch = anthropicSource.match(/"(Analyse ce vêtement tricoté en détail\. Retourne le JSON\.)"/);
if (!spMatch || !tpMatch) {
  console.error("Extraction du prompt depuis lib/anthropic.ts impossible : adapter les regex.");
  process.exit(1);
}
const SYSTEM_PROMPT = spMatch[1];
const TEXT_PROMPT = tpMatch[1];
const MAX_TOKENS = 8192;

const COMPACT_SUFFIX = `

CONCISION DE LA SORTIE:
- construction.reasoning : une seule phrase courte.
- limitations : maximum 2 éléments, une courte phrase chacun.
- warnings : maximum 1 élément court, ou tableau vide.
- stitch.notes : une phrase maximum, ou null.`;

interface Variant {
  key: string;
  desc: string;
  model: string;
  pricing: [number, number]; // $/M input, output
  extra: Record<string, unknown>;
  betas?: string[];
  systemSuffix?: string;
  imagesDir?: string; // override du dossier d'images
  needsRaw?: boolean; // sortie complète requise pour la section qualité
}

const VARIANTS: Variant[] = [
  { key: "baseline", desc: "identique prod (thinking adaptatif, effort high)", model: "claude-opus-5", pricing: [5, 25], extra: {} },
  { key: "effort-low", desc: "effort low", model: "claude-opus-5", pricing: [5, 25], extra: { output_config: { effort: "low" } }, needsRaw: true },
  { key: "effort-medium", desc: "effort medium", model: "claude-opus-5", pricing: [5, 25], extra: { output_config: { effort: "medium" } }, needsRaw: true },
  { key: "compact-low", desc: "effort low + consigne sortie compacte", model: "claude-opus-5", pricing: [5, 25], extra: { output_config: { effort: "low" } }, systemSuffix: COMPACT_SUFFIX, needsRaw: true },
  { key: "thinking-off", desc: "thinking disabled", model: "claude-opus-5", pricing: [5, 25], extra: { thinking: { type: "disabled" } } },
  { key: "low-hires", desc: "effort low, images 2576px (simule photo iPhone)", model: "claude-opus-5", pricing: [5, 25], extra: { output_config: { effort: "low" } }, imagesDir: "tasks/latence-hires" },
  { key: "fast", desc: "speed fast ($10/$50)", model: "claude-opus-5", pricing: [10, 50], extra: { speed: "fast" }, betas: ["fast-mode-2026-02-01"] },
  { key: "fast-effort-low", desc: "speed fast + effort low ($10/$50)", model: "claude-opus-5", pricing: [10, 50], extra: { speed: "fast", output_config: { effort: "low" } }, betas: ["fast-mode-2026-02-01"] },
  { key: "sonnet-5", desc: "claude-sonnet-5, défauts (adaptatif, effort high)", model: "claude-sonnet-5", pricing: [3, 15], extra: {}, needsRaw: true },
  { key: "sonnet-5-low", desc: "claude-sonnet-5, effort low", model: "claude-sonnet-5", pricing: [3, 15], extra: { output_config: { effort: "low" } }, needsRaw: true },
];

// Variantes dont la sortie complète est montrée dans la section qualité.
const QUALITY_KEYS = ["effort-low", "compact-low", "sonnet-5-low"];

interface RunResult {
  variant: string;
  image: string;
  ok: boolean;
  ms?: number;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  jsonOk?: boolean;
  overallConfidence?: string;
  unknowns?: number;
  raw?: string;
  error?: string;
}

function tryParseJson(raw: string): Record<string, unknown> | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

function countUnknowns(obj: unknown): number {
  if (obj === null || typeof obj !== "object") return obj === "unknown" ? 1 : 0;
  return Object.values(obj).reduce((n: number, v) => n + countUnknowns(v), 0);
}

async function runVariant(
  client: Anthropic,
  variant: Variant,
  image: string,
  imageBase64: string,
): Promise<RunResult> {
  const params = {
    model: variant.model,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT + (variant.systemSuffix ?? ""),
    messages: [
      {
        role: "user" as const,
        content: [
          { type: "image" as const, source: { type: "base64" as const, media_type: "image/jpeg" as const, data: imageBase64 } },
          { type: "text" as const, text: TEXT_PROMPT },
        ],
      },
    ],
    ...variant.extra,
  };
  const t0 = performance.now();
  try {
    // speed/output_config pas encore dans les typings du SDK 0.71 -> any (script de diag).
    const response = variant.betas
      ? await (client.beta.messages as any).create({ ...params, betas: variant.betas })
      : await (client.messages as any).create(params);
    const ms = Math.round(performance.now() - t0);
    const textBlock = response.content.find((b: { type: string }) => b.type === "text");
    const raw: string = textBlock?.text?.trim() ?? "";
    const parsed = tryParseJson(raw);
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    return {
      variant: variant.key, image, ok: true, ms,
      inputTokens, outputTokens,
      costUsd: (inputTokens * variant.pricing[0] + outputTokens * variant.pricing[1]) / 1_000_000,
      jsonOk: parsed !== null,
      overallConfidence: parsed ? String((parsed as { overallConfidence?: string }).overallConfidence ?? "absent") : undefined,
      unknowns: parsed ? countUnknowns(parsed) : undefined,
      raw,
    };
  } catch (e) {
    return {
      variant: variant.key, image, ok: false,
      ms: Math.round(performance.now() - t0),
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const force = process.argv.includes("--force");
  const defaultImagesDir = args[0];
  if (!defaultImagesDir) {
    console.error("Usage: tsx scripts/diag-latence-opus.ts <dossier-images> [--force]");
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY absente (.env.local)");
    process.exit(1);
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 4 });

  const files = readdirSync(defaultImagesDir).filter((f) => f.endsWith(".jpg")).sort();
  const cacheDir = new URL("../tasks/latence-results/", import.meta.url).pathname;
  mkdirSync(cacheDir, { recursive: true });

  const results: RunResult[] = [];
  for (const variant of VARIANTS) {
    const imagesDir = variant.imagesDir ?? defaultImagesDir;
    for (const file of files) {
      const name = basename(file, extname(file));
      const cachePath = join(cacheDir, `${name}__${variant.key}.json`);
      if (!force && existsSync(cachePath)) {
        const cached: RunResult = JSON.parse(readFileSync(cachePath, "utf8"));
        if (!variant.needsRaw || cached.raw !== undefined) {
          results.push(cached);
          console.log(`  [cache] ${variant.key} / ${name}`);
          continue;
        }
        // cache ancien sans sortie complète : on rejoue l'appel
      }
      process.stdout.write(`  [appel] ${variant.key} / ${name} ... `);
      const imageBase64 = readFileSync(join(imagesDir, file)).toString("base64");
      const r = await runVariant(client, variant, name, imageBase64);
      results.push(r);
      if (r.ok) {
        writeFileSync(cachePath, JSON.stringify(r, null, 2));
        console.log(`${(r.ms! / 1000).toFixed(1)} s (${r.inputTokens} in / ${r.outputTokens} out, JSON ${r.jsonOk ? "ok" : "KO"})`);
      } else {
        console.log(`ÉCHEC: ${r.error?.slice(0, 120)}`);
      }
    }
  }

  // Rapport
  const lines: string[] = [];
  lines.push("# Latence analyse photo : leviers claude-opus-5 et comparaison sonnet-5");
  lines.push("");
  lines.push("Généré par `scripts/diag-latence-opus.ts` sur les 4 images de `tasks/ab-kimi-images/` (mêmes prompts et construction de message que la prod, 1 image par appel). La variante low-hires utilise les mêmes images agrandies à 2576px pour simuler une photo smartphone non redimensionnée (la prod n'a aucun redimensionnement, limite 10 MB par photo).");
  lines.push("");
  lines.push("| Variante | Params | Latence moy | Latence min-max | Tokens in/out moy | Coût moy/analyse | JSON valide |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const variant of VARIANTS) {
    const rs = results.filter((r) => r.variant === variant.key);
    const ok = rs.filter((r) => r.ok);
    if (ok.length === 0) {
      lines.push(`| ${variant.key} | ${variant.desc} | échec | - | - | - | ${rs[0]?.error?.slice(0, 60) ?? "?"} |`);
      continue;
    }
    const avg = (sel: (r: RunResult) => number) => ok.reduce((s, r) => s + sel(r), 0) / ok.length;
    const msArr = ok.map((r) => r.ms!);
    lines.push(`| ${variant.key} | ${variant.desc} | ${(avg((r) => r.ms!) / 1000).toFixed(1)} s | ${(Math.min(...msArr) / 1000).toFixed(1)}-${(Math.max(...msArr) / 1000).toFixed(1)} s | ${Math.round(avg((r) => r.inputTokens!))} / ${Math.round(avg((r) => r.outputTokens!))} | $${avg((r) => r.costUsd!).toFixed(4)} | ${ok.filter((r) => r.jsonOk).length}/${ok.length} |`);
  }
  lines.push("");
  lines.push("## Détail par appel");
  lines.push("");
  lines.push("| Variante | Image | Latence | Tokens in/out | Coût | JSON | Confiance | Champs unknown |");
  lines.push("|---|---|---|---|---|---|---|---|");
  for (const r of results) {
    if (!r.ok) {
      lines.push(`| ${r.variant} | ${r.image} | échec | - | - | - | - | ${r.error?.slice(0, 60)} |`);
      continue;
    }
    lines.push(`| ${r.variant} | ${r.image} | ${(r.ms! / 1000).toFixed(1)} s | ${r.inputTokens}/${r.outputTokens} | $${r.costUsd!.toFixed(4)} | ${r.jsonOk ? "ok" : "KO"} | ${r.overallConfidence} | ${r.unknowns} |`);
  }

  // Section qualité : sorties complètes côte à côte, baseline prise dans le
  // cache du test A/B Kimi (mêmes images, mêmes params que la prod).
  lines.push("");
  lines.push("## Sorties complètes (pour jugement qualité)");
  lines.push("");
  lines.push("Baseline = sortie du test A/B (`tasks/ab-kimi-results/`), identique prod.");
  const abCacheDir = new URL("../tasks/ab-kimi-results/", import.meta.url).pathname;
  for (const file of files) {
    const name = basename(file, extname(file));
    lines.push("");
    lines.push(`### ${name}`);
    const blocks: Array<[string, string | undefined]> = [];
    try {
      const ab = JSON.parse(readFileSync(join(abCacheDir, `${name}__claude-opus-5.json`), "utf8"));
      blocks.push(["baseline (prod)", ab.raw]);
    } catch {
      blocks.push(["baseline (prod)", undefined]);
    }
    for (const key of QUALITY_KEYS) {
      const r = results.find((x) => x.variant === key && x.image === name);
      blocks.push([key, r?.raw]);
    }
    for (const [label, raw] of blocks) {
      lines.push("");
      lines.push(`#### ${label}`);
      if (!raw) {
        lines.push("(sortie non disponible)");
        continue;
      }
      const parsed = tryParseJson(raw);
      lines.push("```json");
      lines.push(parsed ? JSON.stringify(parsed, null, 2) : raw);
      lines.push("```");
    }
  }

  const reportPath = new URL("../tasks/latence-opus-report.md", import.meta.url).pathname;
  writeFileSync(reportPath, lines.join("\n") + "\n");
  console.log(`\nRapport écrit : ${reportPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
