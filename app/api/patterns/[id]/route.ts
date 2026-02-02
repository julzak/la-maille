import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SavedPattern } from "@/lib/types";

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
