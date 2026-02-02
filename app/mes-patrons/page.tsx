"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PatternGrid } from "@/components/PatternGrid";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useTranslation } from "@/lib/i18n";
import type { SavedPatternSummary } from "@/lib/types";

function MesPtronsPageContent() {
  const { t } = useTranslation();
  const [patterns, setPatterns] = useState<SavedPatternSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPatterns() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/patterns");
        const data = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch patterns");
        }

        setPatterns(data.patterns || []);
      } catch (err) {
        if (cancelled) return;
        console.error("Error fetching patterns:", err);
        setError("loadError");
        toast.error(t("savedPatterns.loadError"));
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchPatterns();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = (id: string) => {
    setPatterns((prev) => prev.filter((p) => p.id !== id));
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <p className="text-destructive mb-4">{t("savedPatterns.loadError")}</p>
          <Button onClick={handleRetry}>
            {t("retry")}
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (patterns.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">
          {t("savedPatterns.title")}
        </h1>

        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <div className="text-6xl mb-4">🧶</div>
          <h2 className="text-xl font-semibold mb-2">
            {t("savedPatterns.empty")}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {t("savedPatterns.emptyDescription")}
          </p>
          <Button asChild>
            <Link href="/">
              <Plus className="h-4 w-4 mr-2" />
              {t("savedPatterns.generateFirst")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Patterns list
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {t("savedPatterns.title")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("savedPatterns.patternCount").replace("{count}", String(patterns.length))}
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/">
            <Plus className="h-4 w-4 mr-2" />
            {t("restart")}
          </Link>
        </Button>
      </div>

      <PatternGrid patterns={patterns} onDelete={handleDelete} />
    </div>
  );
}

export default function MesPatronsPage() {
  return (
    <ProtectedRoute>
      <MesPtronsPageContent />
    </ProtectedRoute>
  );
}
