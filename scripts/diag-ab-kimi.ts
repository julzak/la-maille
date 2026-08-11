/**
 * Diagnostic A/B qualité d'analyse photo : claude-opus-5 (prod) vs kimi-k3 (Moonshot).
 *
 *   ./node_modules/.bin/tsx scripts/diag-ab-kimi.ts tasks/ab-kimi-images
 *   ./node_modules/.bin/tsx scripts/diag-ab-kimi.ts tasks/ab-kimi-images --force   # ignore le cache
 *
 * Principe :
 *  - Réutilise le SYSTEM_PROMPT et le prompt texte EXACTS de lib/anthropic.ts.
 *    Ils n'y sont pas exportés : on les extrait du source à l'exécution plutôt
 *    que de les dupliquer (zéro modification du fichier de prod). Le modèle
 *    ANALYSIS_MODEL est importé normalement (il est exporté).
 *  - Une image = une analyse (1 appel par modèle), même construction de message
 *    que la prod : parts image base64 d'abord, prompt texte ensuite.
 *  - Chaque réponse réussie est mise en cache dans tasks/ab-kimi-results/ :
 *    relancer le script ne re-facture que les appels manquants (ex. compléter
 *    le côté Kimi quand la clé arrive, sans re-payer Opus).
 *  - Sortie : tasks/ab-kimi-report.md, côte à côte par image.
 *
 * Clés : ANTHROPIC_API_KEY via .env.local ; clé Moonshot dans ~/.config/moonshot/key.
 * Si une clé manque, le côté concerné est marqué en erreur et le reste tourne.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "fs";
import { homedir } from "os";
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
  // pas de .env.local : on suppose l'environnement deja configure
}

// ---------------------------------------------------------------------------
// Extraction du prompt de prod (lib/anthropic.ts ne l'exporte pas)
// ---------------------------------------------------------------------------
const anthropicSourcePath = new URL("../lib/anthropic.ts", import.meta.url);
const anthropicSource = readFileSync(anthropicSourcePath, "utf8");

const spMatch = anthropicSource.match(/const SYSTEM_PROMPT = `([\s\S]*?)`;/);
if (!spMatch) {
  console.error("Impossible d'extraire SYSTEM_PROMPT de lib/anthropic.ts : le source a changé, adapter la regex.");
  process.exit(1);
}
const SYSTEM_PROMPT = spMatch[1];

const tpMatch = anthropicSource.match(/"(Analyse ce vêtement tricoté en détail\. Retourne le JSON\.)"/);
if (!tpMatch) {
  console.error("Impossible d'extraire le prompt texte de lib/anthropic.ts : le source a changé, adapter la regex.");
  process.exit(1);
}
const TEXT_PROMPT = tpMatch[1];

const MAX_TOKENS = 8192; // identique à la prod

// ---------------------------------------------------------------------------
// Config modèles
// ---------------------------------------------------------------------------
interface ModelResult {
  model: string;
  ok: boolean;
  raw?: string;
  ms?: number;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  error?: string;
}

// $/M tokens (input, output)
const PRICING: Record<string, [number, number]> = {
  "claude-opus-5": [5, 25],
  "kimi-k3": [3, 15],
};

const KIMI_MODEL = "kimi-k3";
const KIMI_ENDPOINT = "https://api.moonshot.ai/v1/chat/completions";
const KIMI_KEY_PATH = join(homedir(), ".config", "moonshot", "key");

type MediaType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";
const MEDIA_TYPES: Record<string, MediaType> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function cost(model: string, inTok?: number, outTok?: number): number | undefined {
  const p = PRICING[model];
  if (!p || inTok === undefined || outTok === undefined) return undefined;
  return (inTok * p[0] + outTok * p[1]) / 1_000_000;
}

// Même extraction tolérante que la prod (extractJSON n'est pas exporté) :
// on tente juste { premier .. } dernier pour vérifier la validité.
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

// ---------------------------------------------------------------------------
// Appels modèles (même construction de message que analyzeGarmentImage)
// ---------------------------------------------------------------------------
async function callOpus(model: string, imageBase64: string, mediaType: MediaType): Promise<ModelResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { model, ok: false, error: "ANTHROPIC_API_KEY absente (.env.local)" };
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 4 });
  const t0 = performance.now();
  try {
    const response = await client.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
            { type: "text", text: TEXT_PROMPT },
          ],
        },
      ],
    });
    const ms = Math.round(performance.now() - t0);
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { model, ok: false, ms, error: "Pas de bloc texte dans la réponse" };
    }
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    return {
      model, ok: true, ms,
      raw: textBlock.text.trim(),
      inputTokens, outputTokens,
      costUsd: cost(model, inputTokens, outputTokens),
    };
  } catch (e) {
    return { model, ok: false, ms: Math.round(performance.now() - t0), error: e instanceof Error ? e.message : String(e) };
  }
}

async function callKimi(imageBase64: string, mediaType: MediaType): Promise<ModelResult> {
  let apiKey: string;
  try {
    apiKey = readFileSync(KIMI_KEY_PATH, "utf8").trim();
  } catch {
    return { model: KIMI_MODEL, ok: false, error: `Clé Moonshot introuvable (${KIMI_KEY_PATH})` };
  }
  const t0 = performance.now();
  try {
    const res = await fetch(KIMI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: KIMI_MODEL,
        max_tokens: MAX_TOKENS,
        // kimi-k3 rejette toute valeur != 1
        temperature: 1,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:${mediaType};base64,${imageBase64}` } },
              { type: "text", text: TEXT_PROMPT },
            ],
          },
        ],
      }),
    });
    const ms = Math.round(performance.now() - t0);
    if (!res.ok) {
      const body = await res.text();
      return { model: KIMI_MODEL, ok: false, ms, error: `HTTP ${res.status}: ${body.slice(0, 300)}` };
    }
    const data = await res.json();
    const raw: string | undefined = data.choices?.[0]?.message?.content;
    if (!raw) {
      return { model: KIMI_MODEL, ok: false, ms, error: `Réponse sans contenu: ${JSON.stringify(data).slice(0, 300)}` };
    }
    const inputTokens: number | undefined = data.usage?.prompt_tokens;
    const outputTokens: number | undefined = data.usage?.completion_tokens;
    return {
      model: KIMI_MODEL, ok: true, ms,
      raw: raw.trim(),
      inputTokens, outputTokens,
      costUsd: cost(KIMI_MODEL, inputTokens, outputTokens),
    };
  } catch (e) {
    return { model: KIMI_MODEL, ok: false, ms: Math.round(performance.now() - t0), error: e instanceof Error ? e.message : String(e) };
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const force = process.argv.includes("--force");
  const imagesDir = args[0];
  if (!imagesDir) {
    console.error("Usage: tsx scripts/diag-ab-kimi.ts <dossier-images> [--force]");
    process.exit(1);
  }

  const { ANALYSIS_MODEL } = await import("../lib/anthropic");

  const files = readdirSync(imagesDir)
    .filter((f) => MEDIA_TYPES[extname(f).toLowerCase()])
    .sort();
  if (files.length === 0) {
    console.error(`Aucune image dans ${imagesDir}`);
    process.exit(1);
  }
  console.log(`Modèles : ${ANALYSIS_MODEL} vs ${KIMI_MODEL} | ${files.length} images | prompt système : ${SYSTEM_PROMPT.length} caractères`);

  const cacheDir = new URL("../tasks/ab-kimi-results/", import.meta.url).pathname;
  mkdirSync(cacheDir, { recursive: true });

  const results: Record<string, Record<string, ModelResult>> = {};

  for (const file of files) {
    const name = basename(file, extname(file));
    const mediaType = MEDIA_TYPES[extname(file).toLowerCase()];
    const imageBase64 = readFileSync(join(imagesDir, file)).toString("base64");
    results[name] = {};

    for (const model of [ANALYSIS_MODEL, KIMI_MODEL]) {
      const cachePath = join(cacheDir, `${name}__${model}.json`);
      if (!force && existsSync(cachePath)) {
        results[name][model] = JSON.parse(readFileSync(cachePath, "utf8"));
        console.log(`  [cache] ${name} / ${model}`);
        continue;
      }
      process.stdout.write(`  [appel] ${name} / ${model} ... `);
      const r = model === KIMI_MODEL
        ? await callKimi(imageBase64, mediaType)
        : await callOpus(model, imageBase64, mediaType);
      results[name][model] = r;
      if (r.ok) {
        writeFileSync(cachePath, JSON.stringify(r, null, 2));
        console.log(`ok (${r.ms} ms, ${r.inputTokens}/${r.outputTokens} tok)`);
      } else {
        console.log(`ÉCHEC: ${r.error}`);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Rapport markdown
  // -------------------------------------------------------------------------
  const models = [ANALYSIS_MODEL, KIMI_MODEL];
  const lines: string[] = [];
  lines.push("# A/B analyse photo : claude-opus-5 vs kimi-k3");
  lines.push("");
  lines.push(`Généré le ${new Date().toISOString().slice(0, 16).replace("T", " ")} par \`scripts/diag-ab-kimi.ts\`.`);
  lines.push("");
  lines.push(`Même system prompt (extrait de \`lib/anthropic.ts\`, ${SYSTEM_PROMPT.length} caractères), même construction de message que la prod (image base64 puis prompt texte), max_tokens ${MAX_TOKENS}. Kimi : temperature 1 (imposée par le modèle), API OpenAI-compatible Moonshot.`);
  lines.push("");
  lines.push(`Tarifs utilisés ($/M tokens input/output) : Opus 5 = ${PRICING["claude-opus-5"][0]}/${PRICING["claude-opus-5"][1]}, Kimi K3 = ${PRICING[KIMI_MODEL][0]}/${PRICING[KIMI_MODEL][1]}.`);
  lines.push("");
  // Note de contexte libre (provenance des images, blocages...) maintenue à la main.
  try {
    lines.push(readFileSync(join(imagesDir, "NOTES.md"), "utf8").trim());
    lines.push("");
  } catch {
    // pas de NOTES.md : rien à inclure
  }

  // Tableau de synthèse
  lines.push("## Synthèse");
  lines.push("");
  lines.push("| Image | Modèle | Statut | Latence | Tokens in/out | Coût | JSON valide | Champs \"unknown\" | Confiance globale |");
  lines.push("|---|---|---|---|---|---|---|---|---|");
  const totals: Record<string, { ms: number; cost: number; n: number; okCount: number }> = {};
  for (const model of models) totals[model] = { ms: 0, cost: 0, n: 0, okCount: 0 };

  for (const name of Object.keys(results)) {
    for (const model of models) {
      const r = results[name][model];
      if (!r) continue;
      const parsed = r.ok && r.raw ? tryParseJson(r.raw) : null;
      const row = [
        name,
        model,
        r.ok ? "ok" : `échec`,
        r.ms !== undefined ? `${(r.ms / 1000).toFixed(1)} s` : "n/a",
        r.inputTokens !== undefined ? `${r.inputTokens} / ${r.outputTokens}` : "n/a",
        r.costUsd !== undefined ? `$${r.costUsd.toFixed(4)}` : "n/a",
        r.ok ? (parsed ? "oui" : "NON") : "n/a",
        parsed ? String(countUnknowns(parsed)) : "n/a",
        parsed ? String((parsed as { overallConfidence?: string }).overallConfidence ?? "absent") : "n/a",
      ];
      lines.push(`| ${row.join(" | ")} |`);
      if (r.ok) {
        totals[model].okCount++;
        totals[model].ms += r.ms ?? 0;
        totals[model].cost += r.costUsd ?? 0;
      }
      totals[model].n++;
    }
  }
  lines.push("");
  for (const model of models) {
    const t = totals[model];
    if (t.okCount > 0) {
      lines.push(`**${model}** : ${t.okCount}/${t.n} analyses ok, latence moyenne ${(t.ms / t.okCount / 1000).toFixed(1)} s, coût total $${t.cost.toFixed(4)} (moyenne $${(t.cost / t.okCount).toFixed(4)}/analyse).`);
    } else {
      lines.push(`**${model}** : aucune analyse réussie (${t.n} tentatives).`);
    }
    lines.push("");
  }

  // Détail côte à côte
  lines.push("## Détail par image");
  for (const name of Object.keys(results)) {
    lines.push("");
    lines.push(`### ${name}`);
    lines.push("");
    lines.push(`![${name}](ab-kimi-images/${files.find((f) => f.startsWith(name)) ?? name})`);
    for (const model of models) {
      const r = results[name][model];
      lines.push("");
      lines.push(`#### ${model}`);
      if (!r) {
        lines.push("Pas de résultat.");
        continue;
      }
      if (!r.ok) {
        lines.push(`Échec : ${r.error}`);
        continue;
      }
      const parsed = r.raw ? tryParseJson(r.raw) : null;
      lines.push(`Latence ${(r.ms! / 1000).toFixed(1)} s, ${r.inputTokens}/${r.outputTokens} tokens, $${r.costUsd?.toFixed(4)}.`);
      lines.push("");
      lines.push("```json");
      lines.push(parsed ? JSON.stringify(parsed, null, 2) : (r.raw ?? ""));
      lines.push("```");
      if (!parsed) lines.push("(sortie brute ci-dessus : JSON non parsable)");
    }
  }

  const reportPath = new URL("../tasks/ab-kimi-report.md", import.meta.url).pathname;
  writeFileSync(reportPath, lines.join("\n") + "\n");
  console.log(`\nRapport écrit : ${reportPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
