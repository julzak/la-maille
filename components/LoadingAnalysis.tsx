"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getLoadingMessage } from "@/lib/messages";

interface LoadingAnalysisProps {
  type?: "analyzing" | "generating";
}

export function LoadingAnalysis({ type = "analyzing" }: LoadingAnalysisProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [message, setMessage] = useState(getLoadingMessage(type, 0));

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        setMessage(getLoadingMessage(type, next));
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [type]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Analyse</CardTitle>
          <Skeleton className="h-5 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Message de chargement animé */}
        <div className="flex items-center gap-3 py-2">
          <div className="relative">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-sm text-muted-foreground animate-pulse">
            {message}
          </span>
        </div>

        {/* Skeleton pour les résultats */}
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>

        {/* Indication temps si > 5 secondes */}
        {elapsedSeconds > 5 && (
          <p className="text-xs text-muted-foreground/70 text-center pt-2 border-t">
            L&apos;analyse peut prendre jusqu&apos;à 15 secondes
          </p>
        )}
      </CardContent>
    </Card>
  );
}
