"use client";

import { useMemo } from "react";
import type {
  GeneratedPattern,
  ParsedInstruction,
  ParsedPiece,
  KnittingProgress,
} from "@/lib/types";

// Re-export types for convenience
export type { ParsedInstruction, ParsedPiece, PieceProgress, Marker, KnittingProgress } from "@/lib/types";

// ===========================================
// Utilitaires de détection
// ===========================================

export function detectInstructionType(text: string): {
  isDecrease: boolean;
  isIncrease: boolean;
  isBindOff: boolean;
  isCastOn: boolean;
  isSpecial: boolean;
} {
  const isDecrease = /diminue|decrease|rabatt|bind.?off|dec\b/i.test(text);
  const isIncrease = /augment|increase|inc\b/i.test(text);
  const isBindOff = /rabatt|bind.?off/i.test(text);
  const isCastOn = /monter|cast.?on/i.test(text);
  const isSpecial =
    isDecrease ||
    isIncrease ||
    /emmanchure|armhole|encolure|neckline|epaule|shoulder/i.test(text);

  return { isDecrease, isIncrease, isBindOff, isCastOn, isSpecial };
}

export function getSpecialType(
  detection: ReturnType<typeof detectInstructionType>
): ParsedInstruction["specialType"] {
  if (detection.isBindOff) return "bind-off";
  if (detection.isCastOn) return "cast-on";
  if (detection.isDecrease) return "decrease";
  if (detection.isIncrease) return "increase";
  return undefined;
}

// ===========================================
// Fonction principale de parsing
// ===========================================

export function parsePatternToPieces(
  pattern: GeneratedPattern,
  language: "fr" | "en"
): ParsedPiece[] {
  const pieces: ParsedPiece[] = [];

  for (const piece of pattern.pieces) {
    const parsedInstructions: ParsedInstruction[] = [];
    let currentContext = "";

    for (const instr of piece.instructions) {
      const rowCount = instr.rowEnd - instr.rowStart + 1;
      const instrText = instr.text;

      // Detect special rows
      const detection = detectInstructionType(instrText);
      const specialType = getSpecialType(detection);

      // For multi-row instructions, set context
      if (rowCount > 1) {
        currentContext = instrText;
      }

      // Add entries for each row in the range
      for (let row = instr.rowStart; row <= instr.rowEnd; row++) {
        const isFirstRowOfRange = row === instr.rowStart;

        parsedInstructions.push({
          row,
          instruction: isFirstRowOfRange
            ? instrText
            : language === "fr"
            ? `Continuer (rang ${row - instr.rowStart + 1}/${rowCount})`
            : `Continue (row ${row - instr.rowStart + 1}/${rowCount})`,
          context: currentContext || undefined,
          technicalNote: instr.notes,
          isDecrease: isFirstRowOfRange && detection.isDecrease,
          isIncrease: isFirstRowOfRange && detection.isIncrease,
          isSpecial: isFirstRowOfRange && detection.isSpecial,
          specialType: isFirstRowOfRange ? specialType : undefined,
        });
      }
    }

    // Determine piece id from name
    const pieceId = getPieceIdFromName(piece.name, pieces);

    if (parsedInstructions.length > 0) {
      pieces.push({
        id: pieceId,
        name: piece.name,
        totalRows: piece.totalRows || parsedInstructions.length,
        instructions: parsedInstructions,
      });
    }
  }

  // Fallback if no pieces
  if (pieces.length === 0) {
    pieces.push({
      id: "pattern",
      name: language === "fr" ? "Patron" : "Pattern",
      totalRows: 1,
      instructions: [
        {
          row: 1,
          instruction:
            language === "fr"
              ? "Aucune instruction disponible"
              : "No instructions available",
          isDecrease: false,
          isIncrease: false,
          isSpecial: false,
        },
      ],
    });
  }

  return pieces;
}

function getPieceIdFromName(name: string, existingPieces: ParsedPiece[]): string {
  const nameLower = name.toLowerCase();
  let pieceId = name.replace(/\s+/g, "-").toLowerCase();

  if (nameLower.includes("corps") || nameLower.includes("body")) {
    pieceId = "body";
  } else if (nameLower.includes("dos") || nameLower.includes("back")) {
    pieceId = "back";
  } else if (
    nameLower.includes("devant gauche") ||
    nameLower.includes("left front")
  ) {
    pieceId = "front-left";
  } else if (
    nameLower.includes("devant droit") ||
    nameLower.includes("right front")
  ) {
    pieceId = "front-right";
  } else if (nameLower.includes("devant") || nameLower.includes("front")) {
    pieceId = "front";
  } else if (nameLower.includes("manche") || nameLower.includes("sleeve")) {
    const existingSleeve = existingPieces.find((p) => p.id === "sleeve-left");
    pieceId = existingSleeve ? "sleeve-right" : "sleeve-left";
  } else if (
    nameLower.includes("empiecement") ||
    nameLower.includes("yoke")
  ) {
    pieceId = "yoke";
  } else if (
    nameLower.includes("encolure") ||
    nameLower.includes("neckline") ||
    nameLower.includes("neck")
  ) {
    pieceId = "neckline";
  }

  return pieceId;
}

// ===========================================
// Hook React
// ===========================================

export function usePatternParsing(
  pattern: GeneratedPattern,
  language: "fr" | "en"
) {
  const pieces = useMemo(
    () => parsePatternToPieces(pattern, language),
    [pattern, language]
  );

  return { pieces };
}

// ===========================================
// Helpers pour la gestion du progrès
// ===========================================

const STORAGE_KEY = "lamaille-knitting-progress";

export function loadProgress(patternId: string): KnittingProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as KnittingProgress;
      if (parsed.patternId === patternId) {
        return parsed;
      }
    }
  } catch {
    // Ignore errors
  }
  return null;
}

export function saveProgress(progress: KnittingProgress): void {
  if (typeof window === "undefined") return;
  try {
    progress.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore errors
  }
}

export function initializeProgress(
  patternId: string,
  pieces: ParsedPiece[],
  patternDate?: string
): KnittingProgress {
  const newProgress: KnittingProgress = {
    patternId,
    patternDate,
    pieces: {},
    lastUpdated: new Date().toISOString(),
  };

  for (const piece of pieces) {
    newProgress.pieces[piece.id] = {
      currentRow: 1,
      completed: false,
      markers: [],
    };
  }

  return newProgress;
}
