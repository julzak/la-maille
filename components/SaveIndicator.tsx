"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface SaveIndicatorProps {
  status: "idle" | "saving" | "saved" | "error";
  className?: string;
}

export function SaveIndicator({ status, className }: SaveIndicatorProps) {
  const { t } = useTranslation();

  if (status === "idle") return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-xs transition-opacity duration-300",
        status === "saving" && "text-muted-foreground",
        status === "saved" && "text-green-600",
        status === "error" && "text-destructive",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {status === "saving" && (
        <>
          <span
            className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
          <span>{t("saving")}</span>
        </>
      )}
      {status === "saved" && (
        <>
          <span aria-hidden="true">✓</span>
          <span>{t("saved")}</span>
        </>
      )}
      {status === "error" && (
        <>
          <span aria-hidden="true">!</span>
          <span>Erreur</span>
        </>
      )}
    </div>
  );
}

export default SaveIndicator;
