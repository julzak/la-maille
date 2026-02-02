"use client";

import { useState, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ERROR_MESSAGES } from "@/lib/messages";
import { useTranslation } from "@/lib/i18n";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB per image
const MAX_IMAGES = 5;

interface SelectedImage {
  file: File;
  preview: string;
  id: string;
}

interface ImageUploaderProps {
  onImagesSelected: (files: File[], previews: string[]) => void;
  isLoading?: boolean;
}

type UploaderState = "idle" | "dragover" | "selected" | "error";

// SVG illustrations for photo tips
function TipFrontView() {
  return (
    <svg viewBox="0 0 80 100" className="w-16 h-20" aria-hidden="true">
      <rect x="15" y="10" width="50" height="70" rx="4" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
      <path d="M25 25 L40 20 L55 25 L55 50 L40 55 L25 50 Z" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
      <circle cx="40" cy="15" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
      <line x1="25" y1="55" x2="25" y2="75" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
      <line x1="55" y1="55" x2="55" y2="75" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
      <circle cx="8" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="1" className="text-yellow-500" />
      <line x1="8" y1="12" x2="8" y2="6" stroke="currentColor" strokeWidth="1" className="text-yellow-500" />
      <line x1="14" y1="14" x2="18" y2="10" stroke="currentColor" strokeWidth="1" className="text-yellow-500" />
      <line x1="16" y1="20" x2="22" y2="20" stroke="currentColor" strokeWidth="1" className="text-yellow-500" />
    </svg>
  );
}

function TipHanger() {
  return (
    <svg viewBox="0 0 80 100" className="w-16 h-20" aria-hidden="true">
      <path d="M40 5 L40 15 M30 15 L50 15 L55 20 L55 25 L25 25 L25 20 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
      <path d="M28 30 L40 25 L52 30 L52 70 L40 75 L28 70 Z" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
      <line x1="28" y1="40" x2="20" y2="60" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
      <line x1="52" y1="40" x2="60" y2="60" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
    </svg>
  );
}

function TipAlone() {
  return (
    <svg viewBox="0 0 80 100" className="w-16 h-20" aria-hidden="true">
      <rect x="5" y="5" width="70" height="90" rx="4" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" className="text-muted-foreground" />
      <path d="M25 25 L40 20 L55 25 L55 65 L40 70 L25 65 Z" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
      <circle cx="40" cy="15" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
      <line x1="25" y1="35" x2="15" y2="55" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
      <line x1="55" y1="35" x2="65" y2="55" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
      <line x1="10" y1="85" x2="25" y2="85" stroke="currentColor" strokeWidth="1" className="text-destructive" />
      <line x1="55" y1="85" x2="70" y2="85" stroke="currentColor" strokeWidth="1" className="text-destructive" />
      <circle cx="17" cy="82" r="2" fill="currentColor" className="text-destructive" />
      <circle cx="63" cy="82" r="2" fill="currentColor" className="text-destructive" />
    </svg>
  );
}

export function ImageUploader({
  onImagesSelected,
  isLoading = false,
}: ImageUploaderProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<UploaderState>("idle");
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return ERROR_MESSAGES.invalidFormat;
    }
    if (file.size > MAX_SIZE) {
      return ERROR_MESSAGES.imageTooBig;
    }
    return null;
  }, []);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remainingSlots = MAX_IMAGES - selectedImages.length;
      const filesToProcess = fileArray.slice(0, remainingSlots);

      let hasError = false;
      const newImages: SelectedImage[] = [];

      for (const file of filesToProcess) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          hasError = true;
          break;
        }
      }

      if (hasError) {
        setState("error");
        return;
      }

      setError(null);

      // Process each file
      let processed = 0;
      for (const file of filesToProcess) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          newImages.push({
            file,
            preview: url,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          });
          processed++;

          if (processed === filesToProcess.length) {
            setSelectedImages((prev) => [...prev, ...newImages]);
            setState("selected");
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [validateFile, selectedImages.length]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      } else {
        if (selectedImages.length === 0) {
          setState("idle");
        }
      }
    },
    [handleFiles, selectedImages.length]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setState("dragover");
    },
    []
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (selectedImages.length > 0) {
        setState("selected");
      } else {
        setState("idle");
      }
    },
    [selectedImages.length]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const handleClick = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  const handleRemoveImage = useCallback((id: string) => {
    setSelectedImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      if (updated.length === 0) {
        setState("idle");
      }
      return updated;
    });
  }, []);

  const handleReset = useCallback(() => {
    setSelectedImages([]);
    setError(null);
    setState("idle");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const handleAnalyze = useCallback(() => {
    if (selectedImages.length > 0) {
      const files = selectedImages.map((img) => img.file);
      const previews = selectedImages.map((img) => img.preview);
      onImagesSelected(files, previews);
    }
  }, [selectedImages, onImagesSelected]);

  const getContainerClasses = () => {
    const base = "relative rounded-xl transition-all duration-200";

    switch (state) {
      case "dragover":
        return `${base} border-2 border-dashed border-accent bg-accent/10`;
      case "selected":
        return `${base} border border-border bg-background`;
      case "error":
        return `${base} border-2 border-dashed border-destructive bg-destructive/5`;
      default:
        return `${base} border-2 border-dashed border-accent hover:border-accent/70 hover:bg-accent/5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`;
    }
  };

  const instructionsId = "upload-instructions";

  return (
    <div className="space-y-4">
      {/* Hidden instructions for screen readers */}
      <p id={instructionsId} className="sr-only">
        {t("maxSize")}
      </p>

      {/* Tips for multiple photos - shown in idle state */}
      {state === "idle" && (
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="py-4 space-y-2">
            <p className="text-sm text-foreground">
              💡 {t("multiPhotoTip")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("multiPhotoTip2")}
            </p>
          </CardContent>
        </Card>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={state === "idle" ? handleClick : undefined}
        onKeyDown={state === "idle" ? handleKeyDown : undefined}
        className={getContainerClasses()}
        role={state === "idle" ? "button" : undefined}
        tabIndex={state === "idle" ? 0 : undefined}
        aria-label={state === "idle" ? t("dropZoneLabel") : undefined}
        aria-describedby={state === "idle" ? instructionsId : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          onChange={handleChange}
          className="hidden"
          aria-label={t("browseFiles")}
          aria-describedby={instructionsId}
          id="image-upload"
        />

        {state === "selected" && selectedImages.length > 0 ? (
          <div className="p-4 md:p-6">
            <div className="space-y-4">
              {/* Image grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedImages.map((img) => (
                  <div key={img.id} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.preview}
                      alt={img.file.name}
                      className="w-full aspect-square object-cover rounded-lg shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute top-1 right-1 p-1 bg-background/80 hover:bg-background rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={t("removePhoto")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* Add more photos button */}
                {selectedImages.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={handleClick}
                    className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-accent/50 hover:bg-accent/5 flex flex-col items-center justify-center gap-2 transition-colors"
                  >
                    <span className="text-2xl">+</span>
                    <span className="text-xs text-muted-foreground">{t("addMorePhotos")}</span>
                  </button>
                )}
              </div>

              {/* Count and actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {t("photosSelected").replace("{count}", String(selectedImages.length))}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleReset}
                    disabled={isLoading}
                    className="min-h-[44px]"
                  >
                    {t("changeImageBtn")}
                  </Button>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="bg-accent hover:bg-accent/90 min-h-[44px]"
                    aria-busy={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
                          aria-hidden="true"
                        />
                        {t("analyzingBtn")}
                      </>
                    ) : (
                      t("analyzeThisImage")
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : state !== "error" ? (
          <div className="p-8 md:p-12 text-center">
            <div
              className="text-4xl md:text-5xl mb-4"
              aria-hidden="true"
              role="img"
            >
              {state === "dragover" ? "📥" : "📤"}
            </div>
            <p className="text-base md:text-lg font-medium mb-2">
              {state === "dragover"
                ? t("dropImageHere")
                : t("dragPhotoHere")}
            </p>
            <p className="text-sm text-muted-foreground mb-4">{t("or")}</p>
            <Button
              variant="outline"
              size="default"
              onClick={handleClick}
              className="min-h-[44px] touch-manipulation"
              aria-label={t("browseFiles")}
            >
              {t("browseFiles")}
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              {t("maxSize")}
            </p>
          </div>
        ) : null}
      </div>

      {/* Status announcement for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {state === "selected" && t("imageUploadSuccess")}
        {state === "error" && error && t("imageUploadError")}
      </div>

      {/* Error card with tips */}
      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6 space-y-4">
            {/* Error message */}
            <div className="flex items-start gap-3" role="alert">
              <span className="text-xl shrink-0" aria-hidden="true">❌</span>
              <p className="text-destructive font-medium">{error}</p>
            </div>

            {/* Tips section */}
            <div className="space-y-3">
              <p className="text-sm font-medium">{t("photoTipsTitle")}</p>

              {/* Example images */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-2 p-3 bg-background rounded-lg">
                  <TipFrontView />
                  <p className="text-xs text-center text-muted-foreground leading-tight">
                    <span className="text-green-600" aria-hidden="true">✓</span> {t("photoTipFront")}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-background rounded-lg">
                  <TipHanger />
                  <p className="text-xs text-center text-muted-foreground leading-tight">
                    <span className="text-green-600" aria-hidden="true">✓</span> {t("photoTipHanger")}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-background rounded-lg">
                  <TipAlone />
                  <p className="text-xs text-center text-muted-foreground leading-tight">
                    <span className="text-green-600" aria-hidden="true">✓</span> {t("photoTipAlone")}
                  </p>
                </div>
              </div>
            </div>

            {/* Retry button */}
            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full"
            >
              {t("retryWithAnotherPhoto")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
