"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PatternPiece, CalculationStep, Gauge } from "@/lib/types";
import { SchematicSVG, getDimensionsFromPiece } from "@/components/SchematicSVG";

interface PatternSectionProps {
  title: string;
  piece: PatternPiece;
  defaultOpen?: boolean;
  gauge?: Gauge;
  measurements?: {
    armLength?: number;
    wristCircumference?: number;
    bicepCircumference?: number;
  };
  id?: string; // Unique ID for accessibility
}

export function PatternSection({
  title,
  piece,
  defaultOpen = false,
  gauge,
  measurements,
  id,
}: PatternSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showCalculations, setShowCalculations] = useState(false);
  const [showSchematic, setShowSchematic] = useState(true);

  // Generate unique ID for accessibility
  const sectionId = id || title.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const contentId = `section-${sectionId}-content`;
  const buttonId = `section-${sectionId}-button`;

  // Déterminer la couleur de bordure selon le type de pièce
  const isSleeveSection = title.toLowerCase().includes("manche");
  const borderColor = isSleeveSection ? "border-l-secondary" : "border-l-accent";

  // Calculer les dimensions pour le schéma
  const schematicData = gauge
    ? getDimensionsFromPiece(title, piece.castOn, piece.totalRows, gauge, measurements)
    : null;

  return (
    <div className={cn("border rounded-lg overflow-hidden", borderColor, "border-l-4")}>
      {/* Header cliquable */}
      <button
        id={buttonId}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
          )}
          <span className="font-semibold text-lg">{title}</span>
        </div>
        <Badge variant="outline" className="font-mono">
          {piece.castOn} m.
        </Badge>
      </button>

      {/* Corps */}
      {isOpen && (
        <div
          id={contentId}
          role="region"
          aria-labelledby={buttonId}
          className="px-4 pb-4 space-y-6"
        >
          {/* a) Résumé rapide + Schéma */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Résumé */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-4 p-3 bg-muted/30 rounded-lg h-full items-center">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Monter</span>
                  <span className="font-mono font-semibold text-lg">{piece.castOn}</span>
                  <span className="text-muted-foreground text-sm">mailles</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Tricoter</span>
                  <span className="font-mono font-semibold text-lg">{piece.totalRows}</span>
                  <span className="text-muted-foreground text-sm">rangs au total</span>
                </div>
              </div>
            </div>

            {/* Schéma technique */}
            {schematicData && (
              <div className="sm:w-48 shrink-0">
                <div className="border rounded-lg p-2 bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Schéma</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setShowSchematic(!showSchematic)}
                    >
                      {showSchematic ? "Masquer" : "Afficher"}
                    </Button>
                  </div>
                  {showSchematic && (
                    <SchematicSVG
                      piece={schematicData.piece}
                      dimensions={schematicData.dimensions}
                      showMeasurements={true}
                      className="mx-auto"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* b) Instructions détaillées */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Instructions
            </h4>
            <div className="space-y-2">
              {piece.instructions.map((instruction, index) => (
                <div
                  key={index}
                  className="flex gap-4 py-2 border-b border-dashed last:border-0"
                >
                  {/* Rangs concernés */}
                  <div className="shrink-0 w-24">
                    {instruction.rowStart > 0 && (
                      <span className="font-mono text-sm text-muted-foreground">
                        {instruction.rowStart === instruction.rowEnd
                          ? `Rang ${instruction.rowStart}`
                          : `Rangs ${instruction.rowStart}-${instruction.rowEnd}`}
                      </span>
                    )}
                  </div>

                  {/* Texte et notes */}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm leading-relaxed">{instruction.text}</p>
                    {instruction.notes && (
                      <p className="text-xs text-muted-foreground italic">
                        {instruction.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* c) Calculs (expandable) */}
          {piece.calculations.length > 0 && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCalculations(!showCalculations)}
                className="text-muted-foreground hover:text-foreground -ml-2"
                aria-expanded={showCalculations}
                aria-controls={`${sectionId}-calculations`}
              >
                {showCalculations ? (
                  <ChevronDown className="h-4 w-4 mr-1" aria-hidden="true" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" aria-hidden="true" />
                )}
                Voir les calculs ({piece.calculations.length})
              </Button>

              {showCalculations && (
                <div
                  id={`${sectionId}-calculations`}
                  role="region"
                  aria-label="Détails des calculs"
                  className="ml-4 space-y-3 p-3 bg-muted/20 rounded-lg border"
                >
                  {piece.calculations.map((calc, index) => (
                    <CalculationDisplay key={index} calculation={calc} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* d) Avertissements */}
          {piece.warnings.length > 0 && (
            <div className="space-y-2">
              {piece.warnings.map((warning, index) => (
                <Alert key={index} className="border-warning bg-warning/10">
                  <AlertDescription className="flex items-start gap-2 text-sm">
                    <span className="shrink-0">⚠️</span>
                    <span>{warning}</span>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Sous-composant pour afficher un calcul
function CalculationDisplay({ calculation }: { calculation: CalculationStep }) {
  const hasRounding = calculation.result !== calculation.rounded;

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{calculation.description}</p>
      <p className="font-mono text-xs text-muted-foreground bg-background px-2 py-1 rounded">
        {calculation.formula}
      </p>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Résultat :</span>
        {hasRounding ? (
          <>
            <span className="font-mono text-muted-foreground line-through">
              {calculation.result.toFixed(2)}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="font-mono font-semibold">{calculation.rounded}</span>
          </>
        ) : (
          <span className="font-mono font-semibold">{calculation.rounded}</span>
        )}
      </div>
      {calculation.roundingNote && (
        <p className="text-xs text-muted-foreground italic">
          {calculation.roundingNote}
        </p>
      )}
    </div>
  );
}
