/**
 * Diagnostic du taux de rejet (analysable=false) de l'analyse photo.
 *
 *   ./node_modules/.bin/tsx scripts/diag-rejet.ts <dossier-images> [--force] [--model=claude-opus-4-8]
 *
 * Rejoue l'appel d'analyse identique a la prod (claude-opus-5, effort low,
 * meme SYSTEM_PROMPT extrait du source de lib/anthropic.ts) sur chaque image
 * du dossier et rapporte : analysable, rejectionReason, garment.type,
 * overallConfidence. Sert a evaluer si la section "REJETTE UNIQUEMENT" du
 * prompt est trop stricte sur des cas limites realistes (maille fine, photo
 * sombre, floue, vetement porte, crochet, tisse...).
 *
 * Meme principe que diag-latence-opus.ts : cache des resultats dans
 * tasks/rejet-results/ pour ne pas re-facturer les appels (--force pour
 * rejouer).
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

const modelArg = process.argv.find((a) => a.startsWith("--model="));
const MODEL = modelArg ? modelArg.slice("--model=".length) : "claude-opus-5";
// Reproduction fidele de la prod de chaque ere : opus-5 = params actuels
// (8192 tokens, effort low), autres modeles = params de l'ere opus-4-8
// (4096 tokens, pas d'output_config).
const IS_OPUS5 = MODEL === "claude-opus-5";
const MAX_TOKENS = IS_OPUS5 ? 8192 : 4096;
const RESULTS_DIR = new URL("../tasks/rejet-results/", import.meta.url).pathname;

const imagesDir = process.argv[2];
const force = process.argv.includes("--force");
if (!imagesDir) {
  console.error("Usage: tsx scripts/diag-rejet.ts <dossier-images> [--force]");
  process.exit(1);
}

const MEDIA: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

interface CachedResult {
  image: string;
  ms: number;
  raw: string;
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

async function main() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 4 });
  mkdirSync(RESULTS_DIR, { recursive: true });

  const files = readdirSync(imagesDir)
    .filter((f) => MEDIA[extname(f).toLowerCase()])
    .sort();
  if (files.length === 0) {
    console.error(`Aucune image dans ${imagesDir}`);
    process.exit(1);
  }

  const results: CachedResult[] = [];
  for (const file of files) {
    const key = `${MODEL}-${basename(file, extname(file))}`;
    const cachePath = join(RESULTS_DIR, `${key}.json`);
    if (!force && existsSync(cachePath)) {
      results.push(JSON.parse(readFileSync(cachePath, "utf8")));
      console.log(`cache: ${file}`);
      continue;
    }
    const data = readFileSync(join(imagesDir, file)).toString("base64");
    const t0 = Date.now();
    const params: Anthropic.MessageCreateParamsNonStreaming & {
      output_config?: { effort: "low" | "medium" | "high" };
    } = {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      ...(IS_OPUS5 ? { output_config: { effort: "low" as const } } : {}),
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: MEDIA[extname(file).toLowerCase()] as "image/jpeg",
                data,
              },
            },
            { type: "text", text: TEXT_PROMPT },
          ],
        },
      ],
    };
    const response = await client.messages.create(params);
    const ms = Date.now() - t0;
    const text = response.content.find((b) => b.type === "text");
    const raw = text && text.type === "text" ? text.text : "";
    const result: CachedResult = { image: file, ms, raw };
    writeFileSync(cachePath, JSON.stringify(result, null, 2));
    results.push(result);
    console.log(`ok: ${file} (${(ms / 1000).toFixed(1)}s)`);
  }

  console.log("\n| image | analysable | rejectionReason | garment | confiance | ms |");
  console.log("|---|---|---|---|---|---|");
  for (const r of results) {
    const json = tryParseJson(r.raw) as {
      analysable?: boolean;
      rejectionReason?: string | null;
      garment?: { type?: string };
      overallConfidence?: string;
    } | null;
    if (!json) {
      console.log(`| ${r.image} | PARSE_ERROR | | | | ${r.ms} |`);
      continue;
    }
    console.log(
      `| ${r.image} | ${json.analysable} | ${json.rejectionReason ?? ""} | ${json.garment?.type ?? ""} | ${json.overallConfidence ?? ""} | ${r.ms} |`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
