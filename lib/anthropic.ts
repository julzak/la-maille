import Anthropic from "@anthropic-ai/sdk";
import type { GarmentAnalysis } from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `CRITICAL: Return ONLY valid JSON. No text before or after. No markdown code blocks. Just the raw JSON object starting with { and ending with }

Tu es un expert en analyse de vêtements tricotés pour l'application La Maille.
IMPORTANT: Réponds TOUJOURS en français.

RECONNAISSANCE DU TRICOT:
Le tricot se reconnaît par des mailles visibles formant des V (jersey) ou des colonnes (côtes).
Indices de tricot: texture en relief, élasticité visible, motifs de mailles réguliers.
En cas de doute, considère que c'est du tricot et analyse-le (mets une confidence basse si incertain).

ÉTAPE 1 - COMPTAGE DES BOUTONS (OBLIGATOIRE):
Avant toute analyse, compte les boutons visibles sur le vêtement.
Cherche sur le centre vertical: petits cercles, points alignés verticalement, éléments de fermeture.
Note ce nombre dans closure.buttonCountEstimate.

ÉTAPE 2 - DÉDUCTION DU TYPE:
- Si tu comptes 3 boutons ou plus alignés verticalement → garment.type: "cardigan", closure.type: "boutons"
- Si tu comptes 1-2 boutons → probablement décoratifs, vérifie s'il y a une ouverture
- Si tu comptes 0 boutons et pas d'ouverture → garment.type: "pull" ou "gilet"

RAPPEL: Un cardigan peut être sans manches. Les boutons déterminent le type, pas les manches.

DÉTECTION DES MANCHES:
- SANS MANCHES: Épaules nues, emmanchures visibles, bretelles fines ou épaisses
- COURTES: Manches qui s'arrêtent au-dessus du coude
- Regarde attentivement les épaules: si elles sont découvertes, c'est sans manches

ANALYSE DE LA BORDURE D'ENCOLURE (neckband) - OBLIGATOIRE:
Examine attentivement la zone de transition entre le corps et l'encolure:

1. Construction:
   - "picked-up": LE PLUS COURANT. Ligne de démarcation/ridge visible où les mailles ont été relevées. Les côtes du col sont perpendiculaires au jersey du corps. On voit souvent une légère "couture" ou changement de texture à la jonction.
   - "sewn-on": Col tricoté séparément puis cousu. Couture visible, col qui semble "ajouté".
   - "integrated": RARE. Les mailles du col et du corps sont en continuité parfaite, AUCUNE ligne de transition visible. Utilisé seulement dans certaines constructions spécifiques.

ATTENTION: "top-down" ne signifie PAS "col intégré" ! La plupart des pulls top-down ont quand même des mailles relevées pour le col à la fin. Regarde la JONCTION col/corps, pas la méthode de construction.

2. Hauteur:
   - "basse": ~2cm (simple bordure)
   - "moyenne": ~4cm (col standard)
   - "haute": 6cm+ (col roulé, col montant)

3. Point utilisé: côtes 1x1, côtes 2x2, jersey, mousse, autre

4. Col double: Le col semble-t-il replié vers l'intérieur (double épaisseur) ?

IMPORTANT: La bordure d'encolure (neckband) est une pièce DISTINCTE de l'empiècement (yoke).
Ne fusionne JAMAIS ces informations.

RÈGLES:
1. Si tu n'es pas sûr à au moins 60%, mets "unknown" pour cet élément
2. Liste ce que tu ne peux PAS déterminer dans "limitations"
3. Sois tolérant: si ça RESSEMBLE à du tricot, analyse-le avec overallConfidence: "low"

REJETTE UNIQUEMENT si:
- C'est clairement du tissu tissé (pas de mailles visibles du tout)
- Ce n'est pas un vêtement
- L'image est floue/illisible
Dans ce cas: analysable: false, rejectionReason en FRANÇAIS

Retourne UNIQUEMENT un JSON valide avec cette structure exacte :
{
  "analysable": boolean,
  "rejectionReason": string | null,
  "garment": { "type": string, "confidence": number },
  "construction": { "method": string, "confidence": number, "reasoning": string },
  "neckline": { "type": string, "confidence": number },
  "neckband": { "construction": string, "height": string, "stitch": string, "doubled": boolean | null, "confidence": number },
  "sleeves": { "type": string, "length": string, "confidence": number },
  "stitch": { "mainPattern": string, "confidence": number, "notes": string | null },
  "closure": { "type": string, "buttonCountEstimate": number | null, "confidence": number },
  "fit": { "style": string, "confidence": number },
  "limitations": string[],
  "warnings": string[],
  "overallConfidence": "high" | "medium" | "low" | "insufficient"
}

Types valides pour chaque champ :
- garment.type: "pull" | "cardigan" | "gilet" | "autre" | "unknown"
- construction.method: "pieces-assemblees" | "top-down" | "bottom-up" | "side-to-side" | "unknown"
- neckline.type: "ras-du-cou" | "col-v" | "bateau" | "ouvert-cardigan" | "capuche" | "unknown"
- neckband.construction: "picked-up" | "sewn-on" | "integrated" | "unknown"
- neckband.height: "basse" | "moyenne" | "haute" | "unknown"
- neckband.stitch: "cotes-1x1" | "cotes-2x2" | "jersey" | "mousse" | "autre" | "unknown"
- neckband.doubled: true | false | null (si impossible a determiner)
- sleeves.type: "montees" | "raglan" | "marteau" | "sans-manches" | "unknown"
- sleeves.length: "longues" | "3-4" | "courtes" | "sans" | "unknown"
- stitch.mainPattern: "jersey" | "mousse" | "cotes" | "torsades" | "jacquard" | "dentelle" | "autre" | "unknown"
- closure.type: "aucune" | "boutons" | "zip" | "unknown"
- fit.style: "ajuste" | "regular" | "oversized" | "unknown"

Remember: Output ONLY the JSON object. Nothing else. No explanation, no markdown.`;

export type ImageMediaType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

/**
 * Extracts JSON from text that may contain surrounding text or markdown
 */
function extractJSON(text: string): object | null {
  // First, try direct parsing
  try {
    return JSON.parse(text);
  } catch {
    // Continue to extraction methods
  }

  // Handle markdown code blocks
  let cleanText = text.trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    try {
      return JSON.parse(cleanText);
    } catch {
      // Continue to bracket extraction
    }
  }

  // Find the first { and last } to extract JSON object
  const startIndex = text.indexOf("{");
  const endIndex = text.lastIndexOf("}");

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return null;
  }

  const jsonString = text.slice(startIndex, endIndex + 1);

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to extract JSON from response:", e);
    return null;
  }
}

export interface ImageData {
  imageBase64: string;
  mediaType: ImageMediaType;
}

export interface AnalyzeImageOptions {
  images: ImageData[];
}

export class AnalysisError extends Error {
  constructor(
    message: string,
    public code: "INVALID_IMAGE" | "API_ERROR" | "PARSE_ERROR" | "UNKNOWN"
  ) {
    super(message);
    this.name = "AnalysisError";
  }
}

/**
 * Normalize confidence values to 0-1 range
 */
function normalizeConfidence(value: number): number {
  if (typeof value !== "number" || isNaN(value)) return 0.5;
  // If > 1, assume 0-100 scale
  if (value > 1) return Math.min(value / 100, 1);
  return Math.max(0, Math.min(value, 1));
}

/**
 * Map common API response values to valid enum values
 */
const VALUE_MAPPINGS: Record<string, Record<string, string>> = {
  "garment.type": {
    sweater: "pull", pullover: "pull", jumper: "pull",
    vest: "gilet", "sans-manches": "gilet",
    other: "autre",
  },
  "neckline.type": {
    "crew-neck": "ras-du-cou", "crew": "ras-du-cou", "round": "ras-du-cou",
    "col-rond": "ras-du-cou", "round-neck": "ras-du-cou",
    "v-neck": "col-v", "v": "col-v",
    "boat": "bateau", "boat-neck": "bateau", "col-bateau": "bateau",
    "turtleneck": "col-roule", "col-roule": "col-roule", "col-roulé": "col-roule", "mock-neck": "col-roule",
    "hood": "capuche", "hooded": "capuche",
    "open": "ouvert-cardigan", "cardigan": "ouvert-cardigan",
    "ouvrir-cardigan": "ouvert-cardigan", "ouvert": "ouvert-cardigan",
  },
  "sleeves.type": {
    "set-in": "montees", "setin": "montees", "set_in": "montees",
    "drop-shoulder": "marteau", "drop": "marteau", "dropped": "marteau",
    "sleeveless": "sans-manches", "none": "sans-manches",
  },
  "sleeves.length": {
    long: "longues", "full": "longues", "full-length": "longues",
    short: "courtes", "cap": "courtes",
    "three-quarter": "3-4", "3/4": "3-4",
    none: "sans", sleeveless: "sans",
  },
  "construction.method": {
    "flat": "pieces-assemblees", "seamed": "pieces-assemblees", "in-pieces": "pieces-assemblees",
    "in-the-round": "en-rond", "seamless": "en-rond", "circular": "en-rond",
    "top-down": "top-down", "topdown": "top-down",
    "bottom-up": "bottom-up", "bottomup": "bottom-up",
  },
  "stitch.mainPattern": {
    stockinette: "jersey", "stocking": "jersey",
    garter: "mousse", "garter-stitch": "mousse",
    rib: "cotes", ribbing: "cotes", ribs: "cotes",
    cable: "torsades", cables: "torsades",
    lace: "dentelle",
    colorwork: "jacquard", stranded: "jacquard", fairisle: "jacquard",
    other: "autre",
  },
  "fit.style": {
    slim: "ajuste", fitted: "ajuste", close: "ajuste", "ajusté": "ajuste",
    standard: "regular", normal: "regular", classic: "regular", "régulier": "regular",
    loose: "oversized", relaxed: "oversized", boxy: "oversized",
    "surdimensionné": "oversized", "surdimensionne": "oversized", "ample": "oversized",
  },
  "neckband.construction": {
    "picked_up": "picked-up", "pickedup": "picked-up",
    "ramasse": "picked-up", "ramassé": "picked-up", "ramassee": "picked-up",
    "relevees": "picked-up", "relevées": "picked-up", "mailles-relevees": "picked-up",
    "sewn": "sewn-on", "sewn_on": "sewn-on", "cousu": "sewn-on",
    "knit-in": "integrated", "continuous": "integrated", "integre": "integrated", "intégré": "integrated",
  },
  "neckband.height": {
    low: "basse", short: "basse", bas: "basse",
    medium: "moyenne", mid: "moyenne",
    high: "haute", tall: "haute",
  },
};

function mapValue(field: string, value: string): string {
  if (!value || typeof value !== "string") return "unknown";
  const lower = value.toLowerCase().trim();
  return VALUE_MAPPINGS[field]?.[lower] || value;
}

/**
 * Normalize the full analysis response from Claude
 */
function normalizeAnalysis(analysis: GarmentAnalysis): GarmentAnalysis {
  if (!analysis.analysable) return analysis;

  // Normalize garment
  if (analysis.garment) {
    analysis.garment.type = mapValue("garment.type", analysis.garment.type) as GarmentAnalysis["garment"]["type"];
    analysis.garment.confidence = normalizeConfidence(analysis.garment.confidence);
  }

  // Normalize neckline
  if (analysis.neckline) {
    analysis.neckline.type = mapValue("neckline.type", analysis.neckline.type) as GarmentAnalysis["neckline"]["type"];
    analysis.neckline.confidence = normalizeConfidence(analysis.neckline.confidence);
  }

  // Normalize sleeves
  if (analysis.sleeves) {
    analysis.sleeves.type = mapValue("sleeves.type", analysis.sleeves.type) as GarmentAnalysis["sleeves"]["type"];
    analysis.sleeves.length = mapValue("sleeves.length", analysis.sleeves.length) as GarmentAnalysis["sleeves"]["length"];
    analysis.sleeves.confidence = normalizeConfidence(analysis.sleeves.confidence);
  }

  // Normalize construction
  if (analysis.construction) {
    analysis.construction.method = mapValue("construction.method", analysis.construction.method) as GarmentAnalysis["construction"]["method"];
    analysis.construction.confidence = normalizeConfidence(analysis.construction.confidence);
  }

  // Normalize stitch
  if (analysis.stitch) {
    analysis.stitch.mainPattern = mapValue("stitch.mainPattern", analysis.stitch.mainPattern) as GarmentAnalysis["stitch"]["mainPattern"];
    analysis.stitch.confidence = normalizeConfidence(analysis.stitch.confidence);
  }

  // Normalize fit
  if (analysis.fit) {
    analysis.fit.style = mapValue("fit.style", analysis.fit.style) as GarmentAnalysis["fit"]["style"];
    analysis.fit.confidence = normalizeConfidence(analysis.fit.confidence);
  }

  // Normalize neckband
  if (analysis.neckband) {
    analysis.neckband.construction = mapValue("neckband.construction", analysis.neckband.construction) as GarmentAnalysis["neckband"]["construction"];
    analysis.neckband.height = mapValue("neckband.height", analysis.neckband.height) as GarmentAnalysis["neckband"]["height"];
    analysis.neckband.confidence = normalizeConfidence(analysis.neckband.confidence);
  }

  // Normalize closure
  if (analysis.closure) {
    analysis.closure.confidence = normalizeConfidence(analysis.closure.confidence);
  }

  return analysis;
}

export async function analyzeGarmentImage({
  images,
}: AnalyzeImageOptions): Promise<GarmentAnalysis> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AnalysisError(
      "ANTHROPIC_API_KEY is not configured",
      "API_ERROR"
    );
  }

  // Validate images
  if (!images || images.length === 0) {
    throw new AnalysisError("No images provided", "INVALID_IMAGE");
  }

  for (const img of images) {
    if (!img.imageBase64 || img.imageBase64.length === 0) {
      throw new AnalysisError("Image data is empty", "INVALID_IMAGE");
    }
  }

  try {
    // Build content array with all images
    const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [];

    // Add all images
    for (const img of images) {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: img.mediaType,
          data: img.imageBase64,
        },
      });
    }

    // Add the text prompt
    const textPrompt = images.length > 1
      ? `Analyse ce vêtement tricoté en détail. Tu as ${images.length} photos du même vêtement sous différents angles pour t'aider à mieux l'analyser. Retourne le JSON.`
      : "Analyse ce vêtement tricoté en détail. Retourne le JSON.";

    content.push({
      type: "text",
      text: textPrompt,
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    // Extract text content from response
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new AnalysisError(
        "No text response from Claude",
        "PARSE_ERROR"
      );
    }

    const responseText = textContent.text.trim();
    console.log("Raw API response length:", responseText.length);

    // Extract JSON using robust parser
    const parsed = extractJSON(responseText);

    if (!parsed) {
      console.error("Failed to extract JSON from Claude response:", responseText.substring(0, 500));
      throw new AnalysisError(
        "L'analyse n'a pas pu être effectuée. Essayez avec une autre photo.",
        "PARSE_ERROR"
      );
    }

    const analysis = normalizeAnalysis(parsed as GarmentAnalysis);

    // Validate required fields
    if (typeof analysis.analysable !== "boolean") {
      console.error("Invalid analysis structure - missing analysable field:", parsed);
      throw new AnalysisError(
        "L'analyse n'a pas pu être effectuée. Essayez avec une autre photo.",
        "PARSE_ERROR"
      );
    }

    return analysis;
  } catch (error) {
    // Re-throw AnalysisError as-is
    if (error instanceof AnalysisError) {
      throw error;
    }

    // Handle Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      console.error("Anthropic API error:", error.status, error.message);

      if (error.status === 401) {
        throw new AnalysisError(
          "Invalid API key. Please check your ANTHROPIC_API_KEY.",
          "API_ERROR"
        );
      }

      if (error.status === 403) {
        throw new AnalysisError(
          "Access denied. Your API key may not have access to this model.",
          "API_ERROR"
        );
      }

      if (error.status === 404) {
        throw new AnalysisError(
          "Model not found. Please check the model name.",
          "API_ERROR"
        );
      }

      if (error.status === 429) {
        throw new AnalysisError(
          "Rate limit exceeded. Please try again later.",
          "API_ERROR"
        );
      }

      if (error.status === 500 || error.status === 502 || error.status === 503) {
        throw new AnalysisError(
          "Anthropic service temporarily unavailable. Please try again.",
          "API_ERROR"
        );
      }

      throw new AnalysisError(
        `API error (${error.status}): ${error.message}`,
        "API_ERROR"
      );
    }

    // Unknown error - log full details
    console.error("Unknown error during analysis:", {
      error,
      errorType: error?.constructor?.name,
      errorMessage: error instanceof Error ? error.message : String(error),
      hasApiKey: !!process.env.ANTHROPIC_API_KEY,
      apiKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
    });

    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    throw new AnalysisError(
      `Erreur: ${errorMsg}`,
      "UNKNOWN"
    );
  }
}
