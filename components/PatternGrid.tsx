"use client";

import { PatternCard } from "@/components/PatternCard";
import type { SavedPatternSummary } from "@/lib/types";

interface PatternGridProps {
  patterns: SavedPatternSummary[];
  onDelete?: (id: string) => void;
}

export function PatternGrid({ patterns, onDelete }: PatternGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {patterns.map((pattern) => (
        <PatternCard
          key={pattern.id}
          pattern={pattern}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
