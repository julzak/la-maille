import { NextRequest, NextResponse } from "next/server";
import {
  analyzeGarmentImage,
  AnalysisError,
  type ImageMediaType,
} from "@/lib/anthropic";

const ALLOWED_TYPES: ImageMediaType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    // Validate file presence
    if (!file) {
      return NextResponse.json(
        { error: "No image provided", code: "INVALID_IMAGE" },
        { status: 400 }
      );
    }

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
          error: "Image trop lourde. Maximum 10MB.",
          code: "INVALID_IMAGE",
        },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // Analyze with Claude
    const analysis = await analyzeGarmentImage({
      imageBase64: base64,
      mediaType: file.type as ImageMediaType,
    });

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
