"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslation } from "@/lib/i18n";
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
      toast.success(t("savedPatterns.saved"));
    } catch (error) {
      console.error("Error saving pattern:", error);
      toast.error(t("savedPatterns.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  // If already saved, show saved state
  if (isSaved) {
    return (
      <Button
        variant={variant}
        className={className}
        disabled
      >
        <BookmarkCheck className="h-4 w-4 mr-2" />
        {t("savedPatterns.saved")}
      </Button>
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
