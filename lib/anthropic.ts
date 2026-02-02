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

    const analysis = parsed as GarmentAnalysis;

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
