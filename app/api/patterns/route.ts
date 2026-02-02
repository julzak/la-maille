import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SavedPatternInsert, SavedPatternSummary } from "@/lib/types";

// POST /api/patterns - Save a new pattern
export async function POST(request: NextRequest) {
  try {
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

    // Parse request body
    const body: SavedPatternInsert = await request.json();

    // Validate required fields
    if (!body.pattern_id || !body.pattern_data || !body.garment_type) {
      return NextResponse.json(
        { error: "Donnees manquantes", code: "INVALID_DATA" },
        { status: 400 }
      );
    }

    // Check if pattern already saved by this user
    const { data: existing } = await supabase
      .from("saved_patterns")
      .select("id")
      .eq("user_id", user.id)
      .eq("pattern_id", body.pattern_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Ce patron est deja sauvegarde", code: "ALREADY_EXISTS" },
        { status: 409 }
      );
    }

    // Insert the pattern
    const { data, error } = await supabase
      .from("saved_patterns")
      .insert({
        user_id: user.id,
        pattern_id: body.pattern_id,
        name: body.name || null,
        thumbnail_url: body.thumbnail_url || null,
        pattern_data: body.pattern_data,
        garment_type: body.garment_type,
      })
      .select("id, pattern_id, name, thumbnail_url, garment_type, created_at")
      .single();

    if (error) {
      console.error("Error saving pattern:", error);
      return NextResponse.json(
        { error: "Erreur lors de la sauvegarde", code: "DB_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pattern: data,
    });
  } catch (error) {
    console.error("Save pattern error:", error);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite", code: "UNKNOWN" },
      { status: 500 }
    );
  }
}

// GET /api/patterns - List user's saved patterns
export async function GET() {
  try {
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

    // Fetch user's patterns, sorted by creation date (newest first)
    const { data, error } = await supabase
      .from("saved_patterns")
      .select("id, pattern_id, name, thumbnail_url, garment_type, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching patterns:", error);
      return NextResponse.json(
        { error: "Erreur lors du chargement", code: "DB_ERROR" },
        { status: 500 }
      );
    }

    const patterns: SavedPatternSummary[] = data || [];

    return NextResponse.json({
      success: true,
      patterns,
      count: patterns.length,
    });
  } catch (error) {
    console.error("List patterns error:", error);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite", code: "UNKNOWN" },
      { status: 500 }
    );
  }
}
