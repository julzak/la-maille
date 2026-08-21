"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslation } from "@/lib/i18n";
import { trackEvent, getStoredUTMs } from "@/lib/analytics";
import type { GeneratedPattern } from "@/lib/types";

interface SavePatternButtonProps {
  pattern: GeneratedPattern;
  imagePreview?: string | null;
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

export function SavePatternButton({
  pattern,
  imagePreview,
  className,
  variant = "outline",
}: SavePatternButtonProps) {
  const { t } = useTranslation();
  const { user, openAuthModal } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  // Nudge "rendre public" apres sauvegarde. `savedId` = id de la ligne
  // saved_patterns, necessaire pour le PATCH de visibilite.
  const [savedId, setSavedId] = useState<string | null>(null);
  const [nudgeState, setNudgeState] = useState<"idle" | "publishing" | "done" | "dismissed">("idle");

  const handleSave = async () => {
    // If not logged in, open auth modal
    if (!user) {
      openAuthModal("signin");
      toast.info(t("savedPatterns.loginRequired"));
      return;
    }

    if (isSaved || isSaving) return;

    setIsSaving(true);

    try {
      const response = await fetch("/api/patterns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pattern_id: pattern.id,
          name: null, // Could add a naming feature later
          thumbnail_url: imagePreview || null,
          pattern_data: pattern,
          garment_type: pattern.analysis.garment.type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "ALREADY_EXISTS") {
          setIsSaved(true);
          toast.info(t("savedPatterns.alreadySaved"));
          return;
        }
        throw new Error(data.error || "Unknown error");
      }

      setIsSaved(true);
      setSavedId(data.pattern?.id ?? null);
      toast.success(t("savedPatterns.saved"));

      const utms = getStoredUTMs();
      trackEvent('save_pattern', {
        garment_type: pattern.analysis.garment.type,
        ...utms,
      });
    } catch (error) {
      console.error("Error saving pattern:", error);
      toast.error(t("savedPatterns.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  // If already saved, show saved state
  const handleMakePublic = async () => {
    if (!savedId || nudgeState === "publishing") return;
    setNudgeState("publishing");
    try {
      const response = await fetch(`/api/patterns/${savedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: true }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setNudgeState("done");
      toast.success(t("saveNudge.done"));
      trackEvent("make_public", {
        source: "save_nudge",
        garment_type: pattern.analysis.garment.type,
      });
    } catch (error) {
      console.error("Error publishing pattern:", error);
      toast.error(t("publicToggle.error"));
      setNudgeState("idle");
    }
  };

  if (isSaved) {
    const showNudge = savedId && nudgeState !== "dismissed" && nudgeState !== "done";
    return (
      <div className={className}>
        <Button variant={variant} className="w-full" disabled>
          <BookmarkCheck className="h-4 w-4 mr-2" />
          {t("savedPatterns.saved")}
        </Button>
        {showNudge && (
          <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-left">
            <p className="flex items-center gap-1.5 font-medium text-sm mb-1">
              <Globe className="h-4 w-4 text-primary" aria-hidden="true" />
              {t("saveNudge.title")}
            </p>
            <p className="text-xs text-muted-foreground mb-3">{t("saveNudge.text")}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleMakePublic}
                disabled={nudgeState === "publishing"}
              >
                {nudgeState === "publishing" ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Globe className="h-3.5 w-3.5 mr-1.5" />
                )}
                {t("saveNudge.button")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setNudgeState("dismissed")}
              >
                {t("saveNudge.later")}
              </Button>
            </div>
          </div>
        )}
        {nudgeState === "done" && (
          <p className="mt-2 text-xs text-muted-foreground">
            <Link href="/mes-patrons" className="text-primary hover:underline">
              {t("saveNudge.done")}
            </Link>
          </p>
        )}
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      onClick={handleSave}
      disabled={isSaving}
      className={className}
    >
      {isSaving ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {t("savedPatterns.saving")}
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4 mr-2" />
          {t("savedPatterns.save")}
        </>
      )}
    </Button>
  );
}
