"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "@/lib/i18n";
import { useLaMailleStore } from "@/lib/store";
import type { SavedPatternSummary, GeneratedPattern } from "@/lib/types";

interface PatternCardProps {
  pattern: SavedPatternSummary;
  onDelete?: (id: string) => void;
}

export function PatternCard({ pattern, onDelete }: PatternCardProps) {
  const { t, language } = useTranslation();
  const router = useRouter();
  const { setPattern } = useLaMailleStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formattedDate = new Date(pattern.created_at).toLocaleDateString(
    language === "fr" ? "fr-FR" : "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  const garmentTypeKey = `garment.${pattern.garment_type}` as "garment.pull" | "garment.cardigan" | "garment.gilet" | "garment.autre" | "garment.unknown";
  const garmentLabel = t(garmentTypeKey);

  const handleDelete = async () => {
    setIsDeleting(true);
    setShowDeleteDialog(false);

    try {
      const response = await fetch(`/api/patterns/${pattern.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      toast.success(t("savedPatterns.deleted"));
      onDelete?.(pattern.id);
    } catch (error) {
      console.error("Error deleting pattern:", error);
      toast.error(t("savedPatterns.deleteError"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/patterns/${pattern.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load pattern");
      }

      const fullPattern = data.pattern.pattern_data as GeneratedPattern;

      // Hydrate the store with the pattern data
      setPattern(fullPattern, language);

      // If there's a thumbnail, set it as the image preview
      if (pattern.thumbnail_url) {
        // Create a minimal File object for backward compatibility
        const fakeFile = new File([], "saved-pattern.jpg", { type: "image/jpeg" });
        // We need to update the store to set the image preview
        useLaMailleStore.setState({
          imagePreview: pattern.thumbnail_url,
          imageFile: fakeFile,
          imageName: "saved-pattern.jpg",
          imageType: "image/jpeg",
        });
      }

      // Navigate to the pattern page
      router.push("/patron");
    } catch (error) {
      console.error("Error loading pattern:", error);
      toast.error(t("savedPatterns.loadError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="relative aspect-square bg-muted">
        {pattern.thumbnail_url ? (
          <Image
            src={pattern.thumbnail_url}
            alt={pattern.name || garmentLabel}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <span className="text-4xl">🧶</span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            onClick={handleView}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {t("savedPatterns.view")}
          </Button>
        </div>
      </div>

      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Badge variant="secondary" className="mb-1">
              {garmentLabel}
            </Badge>
            {pattern.name && (
              <p className="font-medium truncate text-sm">{pattern.name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formattedDate}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleView}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("savedPatterns.view")
          )}
        </Button>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("savedPatterns.deleteConfirm")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("savedPatterns.deleteConfirmDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <Button
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("savedPatterns.delete")}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
