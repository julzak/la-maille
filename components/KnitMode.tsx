"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
import {
  usePatternParsing,
  loadProgress,
  saveProgress,
  initializeProgress,
  type ParsedInstruction,
  type KnittingProgress,
} from "@/hooks/usePatternParsing";

interface KnitModeProps {
  pattern: GeneratedPattern;
  onExit: () => void;
}

export function KnitMode({ pattern, onExit }: KnitModeProps) {
  const { t, language } = useTranslation();

  // Parse pattern into pieces using shared hook
  const { pieces } = usePatternParsing(pattern, language);

  // State
  const [currentPieceIndex, setCurrentPieceIndex] = useState(0);
  const [progress, setProgress] = useState<KnittingProgress | null>(null);
  const [nightMode, setNightMode] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedProgress, setSavedProgress] = useState<KnittingProgress | null>(null);

  const currentPiece = pieces[currentPieceIndex];
  const patternId = pattern.id;

  // Initialize fresh progress
  const initProgress = useCallback(() => {
    const newProgress = initializeProgress(patternId, pieces);
    setProgress(newProgress);
    saveProgress(newProgress);
  }, [patternId, pieces]);

  // Load saved progress on mount
  useEffect(() => {
    const saved = loadProgress(patternId);
    if (saved) {
      // Check if there's meaningful progress (not all at row 1)
      const hasProgress = Object.values(saved.pieces).some(
        (p) => p.currentRow > 1 || p.completed
      );
      if (hasProgress) {
        setSavedProgress(saved);
        setShowResumeDialog(true);
      } else {
        setProgress(saved);
      }
    } else {
      initProgress();
    }
  }, [patternId, initProgress]);

  // Resume from saved progress
  const handleResume = () => {
    if (savedProgress) {
      setProgress(savedProgress);
      // Find the piece they were working on
      const lastPieceId = Object.entries(savedProgress.pieces).find(
        ([, p]) => !p.completed && p.currentRow > 1
      )?.[0];
      if (lastPieceId) {
        const idx = pieces.findIndex((p) => p.id === lastPieceId);
        if (idx >= 0) setCurrentPieceIndex(idx);
      }
    }
    setShowResumeDialog(false);
  };

  // Start over
  const handleStartOver = () => {
    initProgress();
    setShowResumeDialog(false);
  };

  // Get current row for current piece
  const getCurrentRow = (): number => {
    if (!progress || !currentPiece) return 1;
    return progress.pieces[currentPiece.id]?.currentRow || 1;
  };

  // Navigate rows
  const goToRow = useCallback((newRow: number) => {
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
  }, [progress, currentPiece]);

  const nextRow = useCallback(() => {
    if (!progress || !currentPiece) return;
    const currentRow = progress.pieces[currentPiece.id]?.currentRow || 1;
    goToRow(currentRow + 1);
  }, [progress, currentPiece, goToRow]);

  const prevRow = useCallback(() => {
    if (!progress || !currentPiece) return;
    const currentRow = progress.pieces[currentPiece.id]?.currentRow || 1;
    goToRow(currentRow - 1);
  }, [progress, currentPiece, goToRow]);

  // Get current instruction
  const getCurrentInstruction = (): ParsedInstruction | null => {
    if (!currentPiece) return null;
    const row = getCurrentRow();
    return currentPiece.instructions[row - 1] || null;
  };

  // Get special row type label
  const getSpecialTypeLabel = (
    type?: "decrease" | "increase" | "bind-off" | "cast-on"
  ): string => {
    switch (type) {
      case "decrease":
        return language === "fr" ? "Diminution" : "Decrease";
      case "increase":
        return language === "fr" ? "Augmentation" : "Increase";
      case "bind-off":
        return language === "fr" ? "Rabattage" : "Bind off";
      case "cast-on":
        return language === "fr" ? "Montage" : "Cast on";
      default:
        return "";
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextRow();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevRow();
      } else if (e.key === "Escape") {
        onExit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextRow, prevRow, onExit]);

  const currentRow = getCurrentRow();
  const instruction = getCurrentInstruction();
  const totalRows = currentPiece?.totalRows || 1;
  const progressPercent = Math.round((currentRow / totalRows) * 100);

  // Loading state - but show dialog if we have saved progress to resume
  if (!progress && !showResumeDialog) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  return (
    <>
      {/* Resume dialog - shown when there's saved progress */}
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("knitModeWelcomeBack")}</DialogTitle>
            <DialogDescription>
              {t("knitModeContinueFrom").replace(
                "{row}",
                String(
                  savedProgress?.pieces[currentPiece?.id || ""]?.currentRow || 1
                )
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={handleStartOver} className="flex-1">
              {t("startOver")}
            </Button>
            <Button onClick={handleResume} className="flex-1">
              {t("knitModeContinue")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Show loading background when dialog is open but progress not yet set */}
      {!progress && showResumeDialog && (
        <div className="fixed inset-0 z-[100] bg-background" />
      )}

      {/* Main fullscreen interface - only show when progress is loaded */}
      {progress && (
      <div
        className={cn(
          "fixed inset-0 z-[100] flex flex-col transition-colors duration-300",
          nightMode ? "night-mode" : "bg-background"
        )}
      >
        {/* Header minimal */}
        <header
          className={cn(
            "p-4 flex justify-between items-center border-b",
            nightMode ? "border-[#3d3a36]" : "border-border"
          )}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onExit}
            className={cn(
              "flex-shrink-0",
              nightMode ? "bg-[#2d2a26] border-[#3d3a36] text-[#e8e4dc] hover:bg-[#3d3a36]" : ""
            )}
            aria-label={t("goBackToPattern")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="md:mr-2"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="hidden md:inline">{t("goBackToPattern")}</span>
          </Button>

          <span
            className={cn(
              "font-mono text-sm truncate max-w-[40%] text-center",
              nightMode ? "text-[#8b8680]" : "text-muted-foreground"
            )}
          >
            {currentPiece?.name} • {t("row")} {currentRow}/{totalRows}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNightMode(!nightMode)}
            className={nightMode ? "text-[#e8e4dc] hover:text-white" : ""}
          >
            {nightMode ? "☀️" : "🌙"}
          </Button>
        </header>

        {/* Piece selector */}
        <div
          className={cn(
            "flex gap-2 p-4 overflow-x-auto border-b",
            nightMode ? "border-[#3d3a36]" : "border-border"
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
                  "rounded-full whitespace-nowrap",
                  nightMode &&
                    !isCurrent &&
                    "bg-[#2d2a26] border-[#3d3a36] text-[#e8e4dc] hover:bg-[#3d3a36]"
                )}
              >
                {piece.name}
                {isCompleted && " ✓"}
              </Button>
            );
          })}
        </div>

        {/* Main instruction area */}
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center overflow-y-auto">
          {/* Special row alert */}
          {instruction?.isSpecial && instruction.specialType && (
            <div
              className={cn(
                "px-4 py-2 rounded-full mb-6 font-medium animate-pulse",
                instruction.specialType === "decrease" &&
                  "bg-orange-500/20 text-orange-600",
                instruction.specialType === "increase" &&
                  "bg-blue-500/20 text-blue-600",
                instruction.specialType === "bind-off" &&
                  "bg-red-500/20 text-red-600",
                instruction.specialType === "cast-on" &&
                  "bg-green-500/20 text-green-600",
                nightMode && "bg-warning/30 text-[#e8e4dc]"
              )}
            >
              ⚠️ {getSpecialTypeLabel(instruction.specialType)}{" "}
              {language === "fr" ? "sur ce rang" : "on this row"}
            </div>
          )}

          {/* Current instruction - BIG */}
          <p
            className={cn(
              "text-2xl md:text-3xl font-serif leading-relaxed max-w-md",
              nightMode ? "text-[#e8e4dc]" : "text-foreground"
            )}
          >
            {instruction?.instruction || "-"}
          </p>

          {/* Technical note */}
          {instruction?.technicalNote && (
            <p
              className={cn(
                "mt-6 font-mono text-sm px-4 py-2 rounded-lg",
                nightMode
                  ? "bg-[#2d2a26] text-[#8b8680]"
                  : "bg-muted/50 text-muted-foreground"
              )}
            >
              {instruction.technicalNote}
            </p>
          )}
        </main>

        {/* Progress bar */}
        <div className="px-6">
          <div
            className={cn(
              "h-1.5 rounded-full overflow-hidden",
              nightMode ? "bg-[#2d2a26]" : "bg-muted"
            )}
          >
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p
            className={cn(
              "text-center text-xs mt-2",
              nightMode ? "text-[#8b8680]" : "text-muted-foreground"
            )}
          >
            {progressPercent}% {language === "fr" ? "terminé" : "complete"}
          </p>
        </div>

        {/* Touch controls */}
        <footer className="p-8 flex justify-center items-center gap-8">
          {/* Previous button */}
          <button
            className={cn(
              "w-14 h-14 rounded-full border-2 flex items-center justify-center text-xl",
              "disabled:opacity-30 active:scale-95 transition-transform",
              nightMode
                ? "border-[#3d3a36] bg-[#2d2a26] text-[#e8e4dc]"
                : "border-border bg-card"
            )}
            onClick={prevRow}
            disabled={currentRow <= 1}
            aria-label={t("previousRow")}
          >
            ←
          </button>

          {/* Big tap button */}
          <button
            className={cn(
              "w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg",
              "active:scale-95 transition-transform",
              "bg-primary text-primary-foreground"
            )}
            onClick={nextRow}
            disabled={currentRow >= totalRows}
            aria-label={t("nextRow")}
          >
            <span className="text-3xl font-mono font-bold">{currentRow}</span>
            <span className="text-xs opacity-80">tap +1</span>
          </button>

          {/* Next button */}
          <button
            className={cn(
              "w-14 h-14 rounded-full border-2 flex items-center justify-center text-xl",
              "disabled:opacity-30 active:scale-95 transition-transform",
              nightMode
                ? "border-[#3d3a36] bg-[#2d2a26] text-[#e8e4dc]"
                : "border-border bg-card"
            )}
            onClick={nextRow}
            disabled={currentRow >= totalRows}
            aria-label={t("nextRow")}
          >
            →
          </button>
        </footer>
      </div>
      )}
    </>
  );
}
