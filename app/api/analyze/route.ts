import { NextRequest, NextResponse } from "next/server";
import {
  analyzeGarmentImage,
  AnalysisError,
  ANALYSIS_MODEL,
  type ImageMediaType,
  type ImageData,
} from "@/lib/anthropic";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { GarmentAnalysis } from "@/lib/types";

/**
 * Logge une generation en base (best-effort). N'echoue jamais le flux user :
 * toute erreur est avalee et juste loggee.
 */
async function logGeneration(
  analysis: GarmentAnalysis,
  numImages: number
): Promise<void> {
  try {
    const admin = createAdminClient();
    if (!admin) return; // service_role non configuree -> on skip silencieusement

    // Recupere l'utilisateur connecte si session presente (sinon anonyme)
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      // pas de session valide -> generation anonyme
    }

    await admin.from("generations").insert({
      user_id: userId,
      analysable: analysis.analysable,
      garment_type: analysis.analysable ? analysis.garment.type : null,
      num_images: numImages,
      model: ANALYSIS_MODEL,
    });
  } catch (err) {
    console.error("Failed to log generation:", err);
  }
}

const ALLOWED_TYPES: ImageMediaType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB per image
const MAX_IMAGES = 5;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Support both single "image" and multiple "images" fields
    const singleFile = formData.get("image") as File | null;
    const multipleFiles = formData.getAll("images") as File[];

    const files: File[] = singleFile ? [singleFile] : multipleFiles;

    // Validate file presence
    if (files.length === 0) {
      return NextResponse.json(
        { error: "No image provided", code: "INVALID_IMAGE" },
        { status: 400 }
      );
    }

    // Validate number of files
    if (files.length > MAX_IMAGES) {
      return NextResponse.json(
        {
          error: `Trop d'images. Maximum ${MAX_IMAGES} photos.`,
          code: "INVALID_IMAGE",
        },
        { status: 400 }
      );
    }

    // Validate each file and convert to ImageData
    const images: ImageData[] = [];

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type as ImageMediaType)) {
        return NextResponse.json(
          {
            error: "Format non supporté. Utilisez JPG, PNG ou WebP.",
            code: "INVALID_IMAGE",
          },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          {
            error: "Image trop lourde. Maximum 10MB par image.",
            code: "INVALID_IMAGE",
          },
          { status: 400 }
        );
      }

      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");

      images.push({
        imageBase64: base64,
        mediaType: file.type as ImageMediaType,
      });
    }

    // Analyze with Claude
    const analysis = await analyzeGarmentImage({ images });

    // Track the generation (best-effort, ne bloque pas la reponse)
    await logGeneration(analysis, images.length);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Analysis error:", error);

    if (error instanceof AnalysisError) {
      const statusCode =
        error.code === "INVALID_IMAGE"
          ? 400
          : error.code === "API_ERROR"
            ? 502
            : 500;

      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: statusCode }
      );
    }

    // Log additional details for debugging
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      // Check for common API errors
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes("api key") || errorMessage.includes("authentication") || errorMessage.includes("unauthorized")) {
        return NextResponse.json(
          {
            error: "Erreur de configuration API. Contactez l'administrateur.",
            code: "API_ERROR"
          },
          { status: 502 }
        );
      }

      return NextResponse.json(
        {
          error: `Erreur: ${error.message}`,
          code: "UNKNOWN"
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite. Réessayez.", code: "UNKNOWN" },
      { status: 500 }
    );
  }
}

// Reject other methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
