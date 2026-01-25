"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import type { GeneratedPattern } from "@/lib/types";

interface KnittingModeProps {
  pattern: GeneratedPattern;
  onExit: () => void;
}

interface Marker {
  row: number;
  note: string;
  timestamp: Date;
}

interface PieceProgress {
  currentRow: number;
  completed: boolean;
  markers: Marker[];
}

interface KnittingProgress {
  patternId: string;
  patternDate: string;
  pieces: { [pieceName: string]: PieceProgress };
  lastUpdated: Date;
}

interface ParsedInstruction {
  row: number;
  instruction: string;
  context: string;
  isDecrease: boolean;
  isIncrease: boolean;
  isSpecial: boolean;
}

interface ParsedPiece {
  id: string;
  name: string;
  totalRows: number;
  instructions: ParsedInstruction[];
}

// Parse pattern pieces into row-by-row instructions
function parsePatternToPieces(pattern: GeneratedPattern, language: "fr" | "en"): ParsedPiece[] {
  const pieces: ParsedPiece[] = [];

  for (const piece of pattern.pieces) {
    const parsedInstructions: ParsedInstruction[] = [];
    let currentContext = "";

    // Process each instruction range
    for (const instr of piece.instructions) {
      const rowCount = instr.rowEnd - instr.rowStart + 1;
      const instrText = instr.text;

      // Check for decrease/increase patterns
      const isDecrease = /diminue|decrease|rabatt|bind off|dec\b/i.test(instrText);
      const isIncrease = /augment|increase|inc\b/i.test(instrText);
      const isSpecial = isDecrease || isIncrease || /emmanchure|armhole|encolure|neckline|epaule|shoulder/i.test(instrText);

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
            : `${language === "fr" ? "Continuer" : "Continue"} (${row - instr.rowStart + 1}/${rowCount})`,
          context: currentContext,
          isDecrease: isFirstRowOfRange && isDecrease,
          isIncrease: isFirstRowOfRange && isIncrease,
          isSpecial: isFirstRowOfRange && isSpecial,
        });
      }
    }

    // Determine piece id from name
    const nameLower = piece.name.toLowerCase();
    let pieceId = piece.name.replace(/\s+/g, "-").toLowerCase();

    if (nameLower.includes("corps") || nameLower.includes("body")) {
      pieceId = "body";
    } else if (nameLower.includes("dos") || nameLower.includes("back")) {
      pieceId = "back";
    } else if (nameLower.includes("devant gauche") || nameLower.includes("left front")) {
      pieceId = "front-left";
    } else if (nameLower.includes("devant droit") || nameLower.includes("right front")) {
      pieceId = "front-right";
    } else if (nameLower.includes("devant") || nameLower.includes("front")) {
      pieceId = "front";
    } else if (nameLower.includes("manche") || nameLower.includes("sleeve")) {
      const existingSleeve = pieces.find(p => p.id === "sleeve-left");
      pieceId = existingSleeve ? "sleeve-right" : "sleeve-left";
    } else if (nameLower.includes("empiecement") || nameLower.includes("yoke")) {
      pieceId = "yoke";
    } else if (nameLower.includes("encolure") || nameLower.includes("neckline") || nameLower.includes("neck")) {
      pieceId = "neckline";
    }

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
      instructions: [{
        row: 1,
        instruction: language === "fr" ? "Aucune instruction disponible" : "No instructions available",
        context: "",
        isDecrease: false,
        isIncrease: false,
        isSpecial: false,
      }],
    });
  }

  return pieces;
}

// Storage key for progress
const STORAGE_KEY = "lamaille-knitting-progress";

export function KnittingMode({ pattern, onExit }: KnittingModeProps) {
  const { t, language } = useTranslation();

  // Parse pattern into pieces
  const pieces = parsePatternToPieces(pattern, language);

  // State
  const [currentPieceIndex, setCurrentPieceIndex] = useState(0);
  const [progress, setProgress] = useState<KnittingProgress | null>(null);
  const [nightMode, setNightMode] = useState(false);
  const [showMarkerDialog, setShowMarkerDialog] = useState(false);
  const [markerNote, setMarkerNote] = useState("");
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedProgress, setSavedProgress] = useState<KnittingProgress | null>(null);

  // Refs for swipe handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const mainRef = useRef<HTMLDivElement>(null);

  const currentPiece = pieces[currentPieceIndex];
  const patternId = pattern.id;

  // Load saved progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as KnittingProgress;
        // Check if it's the same pattern
        if (parsed.patternId === patternId) {
          setSavedProgress(parsed);
          setShowResumeDialog(true);
        } else {
          // Different pattern, initialize fresh
          initializeProgress();
        }
      } else {
        initializeProgress();
      }
    } catch {
      initializeProgress();
    }
  }, [patternId]);

  // Initialize fresh progress
  const initializeProgress = useCallback(() => {
    const newProgress: KnittingProgress = {
      patternId,
      patternDate: pattern.createdAt instanceof Date ? pattern.createdAt.toISOString() : String(pattern.createdAt),
      pieces: {},
      lastUpdated: new Date(),
    };

    for (const piece of pieces) {
      newProgress.pieces[piece.id] = {
        currentRow: 1,
        completed: false,
        markers: [],
      };
    }

    setProgress(newProgress);
    saveProgress(newProgress);
  }, [patternId, pattern.createdAt, pieces]);

  // Resume from saved progress
  const handleResume = () => {
    if (savedProgress) {
      setProgress(savedProgress);
      // Find the piece they were working on
      const lastPieceId = Object.entries(savedProgress.pieces).find(
        ([, p]) => !p.completed && p.currentRow > 1
      )?.[0];
      if (lastPieceId) {
        const idx = pieces.findIndex(p => p.id === lastPieceId);
        if (idx >= 0) setCurrentPieceIndex(idx);
      }
    }
    setShowResumeDialog(false);
  };

  // Start over
  const handleStartOver = () => {
    initializeProgress();
    setShowResumeDialog(false);
  };

  // Save progress to localStorage
  const saveProgress = (prog: KnittingProgress) => {
    try {
      prog.lastUpdated = new Date();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prog));
    } catch {
      // Storage might be full, ignore
    }
  };

  // Get current row for current piece
  const getCurrentRow = () => {
    if (!progress || !currentPiece) return 1;
    return progress.pieces[currentPiece.id]?.currentRow || 1;
  };

  // Navigate rows
  const goToRow = (newRow: number) => {
    if (!progress || !currentPiece) return;

    const clampedRow = Math.max(1, Math.min(newRow, currentPiece.totalRows));
    const newProgress = { ...progress };
    newProgress.pieces[currentPiece.id] = {
      ...newProgress.pieces[currentPiece.id],
      currentRow: clampedRow,
      completed: clampedRow >= currentPiece.totalRows,
    };

    setProgress(newProgress);
    saveProgress(newProgress);
  };

  const nextRow = () => goToRow(getCurrentRow() + 1);
  const prevRow = () => goToRow(getCurrentRow() - 1);

  // Add marker
  const addMarker = () => {
    if (!progress || !currentPiece) return;

    const newMarker: Marker = {
      row: getCurrentRow(),
      note: markerNote,
      timestamp: new Date(),
    };

    const newProgress = { ...progress };
    const pieceProgress = newProgress.pieces[currentPiece.id];
    pieceProgress.markers = [...(pieceProgress.markers || []), newMarker];

    setProgress(newProgress);
    saveProgress(newProgress);
    setMarkerNote("");
    setShowMarkerDialog(false);
  };

  // Delete marker
  const deleteMarker = (index: number) => {
    if (!progress || !currentPiece) return;

    const newProgress = { ...progress };
    const pieceProgress = newProgress.pieces[currentPiece.id];
    pieceProgress.markers = pieceProgress.markers.filter((_, i) => i !== index);

    setProgress(newProgress);
    saveProgress(newProgress);
  };

  // Get current instruction
  const getCurrentInstruction = (): ParsedInstruction | null => {
    if (!currentPiece) return null;
    const row = getCurrentRow();
    return currentPiece.instructions[row - 1] || null;
  };

  // Check for upcoming decreases/increases
  const getAlert = (): { type: "decrease" | "increase" | "complete" | null; rowsAway: number } => {
    if (!currentPiece) return { type: null, rowsAway: 0 };

    const row = getCurrentRow();
    const currentInstr = getCurrentInstruction();

    // Check if current row is decrease/increase
    if (currentInstr?.isDecrease) return { type: "decrease", rowsAway: 0 };
    if (currentInstr?.isIncrease) return { type: "increase", rowsAway: 0 };

    // Check if section is complete
    if (row >= currentPiece.totalRows) return { type: "complete", rowsAway: 0 };

    // Look ahead for decreases/increases (within 3 rows)
    for (let i = 1; i <= 3; i++) {
      const futureInstr = currentPiece.instructions[row - 1 + i];
      if (futureInstr?.isDecrease) return { type: "decrease", rowsAway: i };
      if (futureInstr?.isIncrease) return { type: "increase", rowsAway: i };
    }

    return { type: null, rowsAway: 0 };
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left -> next row
        nextRow();
      } else {
        // Swipe right -> previous row
        prevRow();
      }
    }
  };

  // Get markers for current piece
  const getMarkers = (): Marker[] => {
    if (!progress || !currentPiece) return [];
    return progress.pieces[currentPiece.id]?.markers || [];
  };

  // Get next piece name
  const getNextPieceName = (): string | null => {
    if (currentPieceIndex < pieces.length - 1) {
      return pieces[currentPieceIndex + 1].name;
    }
    return null;
  };

  const currentRow = getCurrentRow();
  const instruction = getCurrentInstruction();
  const alert = getAlert();
  const markers = getMarkers();
  const progressPercent = currentPiece ? Math.round((currentRow / currentPiece.totalRows) * 100) : 0;

  // If no progress loaded yet, show loading
  if (!progress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t("loading")}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col transition-colors duration-300",
        nightMode ? "bg-gray-900 text-gray-100" : "bg-background text-foreground"
      )}
    >
      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-b",
          nightMode ? "bg-gray-900 border-gray-700" : "bg-background border-border"
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onExit}
          className={nightMode ? "text-gray-300 hover:text-white" : ""}
        >
          <span className="mr-1">X</span> {t("exitKnitting")}
        </Button>

        <div className="text-right">
          <p className="text-sm font-medium">
            {t("panel")}: {currentPiece?.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("row")} {currentRow}/{currentPiece?.totalRows}
          </p>
        </div>
      </header>

      {/* Piece selector */}
      <div
        className={cn(
          "flex gap-1 p-2 overflow-x-auto border-b",
          nightMode ? "border-gray-700" : "border-border"
        )}
      >
        {pieces.map((piece, index) => {
          const pieceProgress = progress.pieces[piece.id];
          const isCompleted = pieceProgress?.completed;
          const isCurrent = index === currentPieceIndex;

          return (
            <Button
              key={piece.id}
              variant={isCurrent ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPieceIndex(index)}
              className={cn(
                "whitespace-nowrap min-h-[36px]",
                isCurrent && !nightMode && "bg-accent text-accent-foreground",
                isCurrent && nightMode && "bg-accent text-white",
                isCompleted && !isCurrent && "opacity-50"
              )}
            >
              {isCompleted && "✓ "}
              {piece.name}
            </Button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className={cn("h-2", nightMode ? "bg-gray-800" : "bg-muted")}>
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main instruction area */}
      <main
        ref={mainRef}
        className="flex-1 flex flex-col justify-center p-6"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Alert banner */}
        {alert.type && (
          <div
            className={cn(
              "mb-4 p-3 rounded-lg text-center font-medium",
              alert.type === "decrease" && alert.rowsAway === 0 && "bg-orange-500 text-white",
              alert.type === "decrease" && alert.rowsAway > 0 && "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
              alert.type === "increase" && alert.rowsAway === 0 && "bg-blue-500 text-white",
              alert.type === "increase" && alert.rowsAway > 0 && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
              alert.type === "complete" && "bg-green-500 text-white"
            )}
          >
            {alert.type === "decrease" && alert.rowsAway === 0 && t("decreaseNow")}
            {alert.type === "decrease" && alert.rowsAway > 0 && t("decreaseInRows").replace("{0}", String(alert.rowsAway))}
            {alert.type === "increase" && alert.rowsAway === 0 && t("increaseNow")}
            {alert.type === "increase" && alert.rowsAway > 0 && t("increaseInRows").replace("{0}", String(alert.rowsAway))}
            {alert.type === "complete" && (
              <>
                {t("sectionComplete")}
                {getNextPieceName() && (
                  <span className="block text-sm mt-1">
                    {t("goToNext")} {getNextPieceName()}
                  </span>
                )}
              </>
            )}
          </div>
        )}

        {/* Current instruction - BIG */}
        <div
          className={cn(
            "text-center mb-6 p-6 rounded-xl",
            instruction?.isSpecial && !nightMode && "bg-accent/10 border-2 border-accent",
            instruction?.isSpecial && nightMode && "bg-accent/20 border-2 border-accent",
            !instruction?.isSpecial && nightMode && "bg-gray-800",
            !instruction?.isSpecial && !nightMode && "bg-muted/50"
          )}
        >
          <p
            className={cn(
              "text-xl md:text-2xl font-semibold leading-relaxed",
              nightMode ? "text-gray-100" : "text-foreground"
            )}
          >
            {instruction?.instruction || "-"}
          </p>
        </div>

        {/* Context */}
        {instruction?.context && (
          <div className="text-center mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              {t("contextLabel")}
            </p>
            <p className={cn("text-sm", nightMode ? "text-gray-400" : "text-muted-foreground")}>
              {instruction.context}
            </p>
          </div>
        )}

        {/* Markers for current row */}
        {markers.filter(m => m.row === currentRow).length > 0 && (
          <div className="mt-4">
            {markers
              .filter(m => m.row === currentRow)
              .map((marker, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-2 rounded text-sm flex items-center gap-2",
                    nightMode ? "bg-yellow-900/50 text-yellow-100" : "bg-yellow-100 text-yellow-800"
                  )}
                >
                  <span>📍</span>
                  <span>{marker.note || t("markerHere")}</span>
                </div>
              ))}
          </div>
        )}

        {/* Swipe hint */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          {t("swipeHint")}
        </p>
      </main>

      {/* Bottom navigation */}
      <div
        className={cn(
          "sticky bottom-0 p-4 border-t",
          nightMode ? "bg-gray-900 border-gray-700" : "bg-background border-border"
        )}
      >
        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <Button
            variant="outline"
            size="lg"
            onClick={prevRow}
            disabled={currentRow <= 1}
            className={cn(
              "flex-1 min-h-[56px] text-lg",
              nightMode && "bg-gray-800 border-gray-600 hover:bg-gray-700"
            )}
          >
            ← {t("previousRow")}
          </Button>

          <div
            className={cn(
              "text-3xl font-bold tabular-nums min-w-[60px] text-center",
              nightMode ? "text-gray-100" : "text-foreground"
            )}
          >
            {currentRow}
          </div>

          <Button
            variant="default"
            size="lg"
            onClick={nextRow}
            disabled={currentRow >= (currentPiece?.totalRows || 1)}
            className="flex-1 min-h-[56px] text-lg bg-accent hover:bg-accent/90"
          >
            {t("nextRow")} →
          </Button>
        </div>

        {/* Secondary actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMarkerDialog(true)}
            className={nightMode ? "text-gray-300" : ""}
          >
            📍 {t("markerHere")}
          </Button>

          <div className="flex items-center gap-2">
            <Label htmlFor="night-mode" className="text-sm">
              {t("nightMode")}
            </Label>
            <Switch
              id="night-mode"
              checked={nightMode}
              onCheckedChange={setNightMode}
            />
          </div>
        </div>
      </div>

      {/* Marker dialog */}
      <Dialog open={showMarkerDialog} onOpenChange={setShowMarkerDialog}>
        <DialogContent className={nightMode ? "bg-gray-800 text-gray-100" : ""}>
          <DialogHeader>
            <DialogTitle>{t("addMarker")}</DialogTitle>
            <DialogDescription>
              {t("row")} {currentRow} - {currentPiece?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder={t("markerNote")}
              value={markerNote}
              onChange={(e) => setMarkerNote(e.target.value)}
              className={nightMode ? "bg-gray-700 border-gray-600" : ""}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowMarkerDialog(false)} className="flex-1">
                {t("close")}
              </Button>
              <Button onClick={addMarker} className="flex-1 bg-accent hover:bg-accent/90">
                {t("addMarker")}
              </Button>
            </div>
          </div>

          {/* Existing markers */}
          {markers.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <p className="text-sm font-medium mb-2">{t("markersLabel")}</p>
              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {markers.map((marker, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center justify-between p-2 rounded text-sm",
                      nightMode ? "bg-gray-700" : "bg-muted"
                    )}
                  >
                    <span>
                      {t("row")} {marker.row}: {marker.note || "📍"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMarker(idx)}
                      className="text-destructive hover:text-destructive h-auto p-1"
                    >
                      {t("deleteMarker")}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resume dialog */}
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("resumeKnitting")}</DialogTitle>
            <DialogDescription>
              {savedProgress && (
                <>
                  {Object.entries(savedProgress.pieces)
                    .filter(([, p]) => p.currentRow > 1)
                    .map(([pieceId, pieceProgress]) => {
                      const piece = pieces.find(p => p.id === pieceId);
                      return (
                        <span key={pieceId} className="block">
                          {piece?.name}: {t("row")} {pieceProgress.currentRow}
                        </span>
                      );
                    })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleStartOver} className="flex-1">
              {t("startOver")}
            </Button>
            <Button onClick={handleResume} className="flex-1 bg-accent hover:bg-accent/90">
              {t("resumeAt")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
