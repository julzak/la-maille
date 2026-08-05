import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  detectPatternLanguage,
  generatePublicSlug,
} from "@/lib/public-patterns";
import type { GeneratedPattern, SavedPattern } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/patterns/[id] - Get a single pattern with full data
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifie", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // Fetch the pattern (RLS will ensure user can only access their own)
    const { data, error } = await supabase
      .from("saved_patterns")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Patron non trouve", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const pattern: SavedPattern = data;

    return NextResponse.json({
      success: true,
      pattern,
    });
  } catch (error) {
    console.error("Get pattern error:", error);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite", code: "UNKNOWN" },
      { status: 500 }
    );
  }
}

// PATCH /api/patterns/[id] - Toggle public visibility (BRIEF-03)
// Body : { is_public: boolean }
// Activer genere un slug lisible + suffixe aleatoire (conserve ensuite :
// re-publier redonne la meme URL). Desactiver rend la page publique 404
// immediatement (rendu force-dynamic + RLS is_public = true).
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifie", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body.is_public !== "boolean") {
      return NextResponse.json(
        { error: "Donnees invalides", code: "INVALID_DATA" },
        { status: 400 }
      );
    }
    const makePublic: boolean = body.is_public;

    // Lit le patron (RLS + filtre user_id : uniquement ses propres patrons).
    const { data: existing, error: fetchError } = await supabase
      .from("saved_patterns")
      .select("id, pattern_data, public_slug")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError && fetchError.code === "42703") {
      // Colonnes is_public/public_slug absentes : migration non appliquee.
      return NextResponse.json(
        {
          error: "Publication indisponible pour le moment",
          code: "MIGRATION_REQUIRED",
        },
        { status: 503 }
      );
    }

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Patron non trouve", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Slug conserve une fois genere (URL stable en cas de re-publication).
    let slug: string | null = existing.public_slug || null;

    if (makePublic && !slug) {
      const patternData = existing.pattern_data as GeneratedPattern;
      const language = detectPatternLanguage(patternData);

      // Retry en cas de collision sur l'index unique (23505), tres improbable.
      for (let attempt = 0; attempt < 3; attempt++) {
        const candidate = generatePublicSlug(patternData, language);
        const { error: updateError } = await supabase
          .from("saved_patterns")
          .update({ is_public: true, public_slug: candidate })
          .eq("id", id)
          .eq("user_id", user.id);

        if (!updateError) {
          slug = candidate;
          break;
        }
        if (updateError.code !== "23505") {
          console.error("Error publishing pattern:", updateError);
          return NextResponse.json(
            { error: "Erreur lors de la publication", code: "DB_ERROR" },
            { status: 500 }
          );
        }
      }

      if (!slug) {
        return NextResponse.json(
          { error: "Erreur lors de la publication", code: "DB_ERROR" },
          { status: 500 }
        );
      }
    } else {
      const { error: updateError } = await supabase
        .from("saved_patterns")
        .update({ is_public: makePublic })
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating pattern visibility:", updateError);
        return NextResponse.json(
          { error: "Erreur lors de la mise a jour", code: "DB_ERROR" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      is_public: makePublic,
      public_slug: slug,
    });
  } catch (error) {
    console.error("Patch pattern error:", error);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite", code: "UNKNOWN" },
      { status: 500 }
    );
  }
}

// DELETE /api/patterns/[id] - Delete a pattern
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifie", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // Delete the pattern (RLS will ensure user can only delete their own)
    const { error } = await supabase
      .from("saved_patterns")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting pattern:", error);
      return NextResponse.json(
        { error: "Erreur lors de la suppression", code: "DB_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete pattern error:", error);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite", code: "UNKNOWN" },
      { status: 500 }
    );
  }
}
