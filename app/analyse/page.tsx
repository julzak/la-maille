"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MeasurementsForm } from "@/components/MeasurementsForm";
import { GarmentOverlay } from "@/components/GarmentOverlay";
import { SaveIndicator } from "@/components/SaveIndicator";
import { WeavingLoader } from "@/components/WeavingLoader";
import { useLaMailleStore, useStoreHydrated } from "@/lib/store";
import { generateFullPattern } from "@/lib/pattern-calculator";
import {
  getRejectionMessage,
  CONFIDENCE_DISPLAY,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/lib/messages";
import { useTranslation } from "@/lib/i18n";
import { useAutoSave } from "@/hooks/useAutoSave";
import { generateProjectId, type StoredProject } from "@/lib/storage";
import type { Gauge, Measurements, YarnInfo } from "@/lib/types";

export default function AnalysePage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const {
    imagePreview,
    imageName,
    imageType,
    analysis,
    analysisLoading,
    analysisError,
    setAnalysis,
    setAnalysisLoading,
    setAnalysisError,
    setFormData,
    setPattern,
    setPatternLoading,
    patternLoading,
  } = useLaMailleStore();

  // State for overlay confirmation
  const [overlayConfirmed, setOverlayConfirmed] = useState(false);
  const [projectId] = useState(() => generateProjectId());

  // Wait for store hydration before making decisions
  const isHydrated = useStoreHydrated();

  // Prepare project data for auto-save
  const projectData = useMemo<StoredProject | null>(() => {
    if (!imagePreview) return null;
    return {
      id: projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      step: analysis ? "measurements" : "analysis",
      imagePreview: imagePreview,
      analysis: analysis || undefined,
    };
  }, [projectId, imagePreview, analysis]);

  // Auto-save project data
  const { status: saveStatus } = useAutoSave(
    "lamaille_current_project",
    projectData,
    { enabled: !!projectData, delay: 2000 }
  );

  // Guard: redirect si pas d'image (seulement après hydration)
  useEffect(() => {
    if (isHydrated && !useLaMailleStore.getState().imagePreview) {
      router.replace("/");
    }
  }, [router, isHydrated]);

  // Lancer l'analyse au montage si on a une image mais pas encore d'analyse
  const runAnalysis = useCallback(async () => {
    if (!imagePreview || !imageType || analysis) return;

    setAnalysisLoading(true);
    setAnalysisError(null);

    try {
      // Convert base64 data URL to File
      const base64Data = imagePreview.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: imageType });
      const file = new File([blob], imageName || "image", { type: imageType });

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || ERROR_MESSAGES.serverError);
      }

      setAnalysis(data.analysis);

      // Toast de succès si analysable
      if (data.analysis.analysable) {
        toast.success("Analyse terminée", {
          description: "Remplissez le formulaire pour générer votre patron.",
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : ERROR_MESSAGES.generic;
      setAnalysisError(errorMessage);
      toast.error("Erreur d'analyse", {
        description: errorMessage,
      });
    }
  }, [
    imagePreview,
    imageType,
    imageName,
    analysis,
    setAnalysis,
    setAnalysisLoading,
    setAnalysisError,
  ]);

  useEffect(() => {
    // Only run analysis after hydration is complete to ensure we have the image data
    if (isHydrated && imagePreview && !analysis && !analysisError) {
      runAnalysis();
    }
  }, [isHydrated, imagePreview, analysis, analysisError, runAnalysis]);

  // Handler pour le formulaire
  const handleFormSubmit = async (data: {
    gauge: Gauge;
    measurements: Measurements;
    yarn: YarnInfo;
  }) => {
    if (!analysis || !analysis.analysable) return;

    setPatternLoading(true);
    setFormData(data.gauge, data.measurements, data.yarn);

    try {
      // Générer le patron
      const pattern = generateFullPattern(
        analysis,
        data.gauge,
        data.measurements,
        data.yarn,
        language
      );

      setPattern(pattern, language);
      toast.success(SUCCESS_MESSAGES.patternGenerated);
      router.push("/patron");
    } catch (err) {
      console.error("Erreur lors de la génération:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de la génération du patron";
      setAnalysisError(errorMessage);
      setPatternLoading(false);
      toast.error("Erreur de génération", {
        description: errorMessage,
      });
    }
  };

  // Handler pour changer d'image
  const handleChangeImage = () => {
    router.push("/");
  };

  // Loading state pendant l'hydratation
  if (!imagePreview) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96 mb-8" />
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="w-full h-64 rounded-lg" />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-3">
              <Skeleton className="h-[400px] rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Déterminer le badge de confiance
  const confidenceDisplay = analysis?.analysable
    ? CONFIDENCE_DISPLAY[analysis.overallConfidence] || CONFIDENCE_DISPLAY.medium
    : null;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            {t("analyzeTitle")}
          </h1>
          <SaveIndicator status={saveStatus} className="mt-2" />
        </div>
        <p className="text-muted-foreground mb-6 md:mb-8">
          {t("analyzeSubtitle")}
        </p>

        <div className="grid lg:grid-cols-5 gap-6 md:gap-8">
          {/* Colonne gauche - Image & Analyse (2/5) */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Aperçu image */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{t("sourceImage")}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleChangeImage}
                    className="text-xs h-7 px-2"
                    aria-label={t("changeImage")}
                  >
                    {t("changeImage")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={imagePreview}
                    alt="Vêtement à analyser"
                    width={400}
                    height={400}
                    className="w-full h-auto object-contain max-h-64"
                    priority
                  />
                </div>
                <p
                  className="text-xs text-muted-foreground mt-2 truncate"
                  title={imageName || undefined}
                >
                  {imageName}
                </p>
              </CardContent>
            </Card>

            {/* État de l'analyse - Loading */}
            {analysisLoading && (
              <Card className="animate-fade-in">
                <CardContent className="py-8">
                  <WeavingLoader message={t("loaderReadingKnit")} size="md" />
                </CardContent>
              </Card>
            )}

            {/* État de l'analyse - Erreur */}
            {analysisError && (
              <Card className="animate-fade-in">
                <CardContent className="text-center p-8">
                  <div className="text-6xl mb-4">🧶</div>
                  <h3 className="font-serif text-xl mb-2">{t("couldntReadThis")}</h3>
                  <p className="text-muted-foreground mb-6">{analysisError}</p>

                  <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
                    <p className="font-medium mb-2">{t("tipsForGoodPhoto")}</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• {t("tipLayFlat")}</li>
                      <li>• {t("tipGoodLighting")}</li>
                      <li>• {t("tipSingleItem")}</li>
                    </ul>
                  </div>

                  <Button onClick={handleChangeImage} className="w-full">
                    {t("tryWithAnotherPhotoBtn")}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Résultat analyse non analysable */}
            {analysis && !analysis.analysable && (
              <Card className="animate-fade-in">
                <CardContent className="text-center p-8">
                  <div className="text-6xl mb-4">🧶</div>
                  <h3 className="font-serif text-xl mb-2">{t("couldntReadThis")}</h3>
                  <p className="text-muted-foreground mb-6">
                    {getRejectionMessage(analysis.rejectionReason || undefined)}
                  </p>

                  <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
                    <p className="font-medium mb-2">{t("tipsForGoodPhoto")}</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• {t("tipLayFlat")}</li>
                      <li>• {t("tipGoodLighting")}</li>
                      <li>• {t("tipSingleItem")}</li>
                    </ul>
                  </div>

                  <Button onClick={handleChangeImage} className="w-full">
                    {t("tryWithAnotherPhotoBtn")}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Résultat analyse OK */}
            {analysis && analysis.analysable && (
              <Card className="animate-fade-in-up">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{t("analysis")}</CardTitle>
                    {confidenceDisplay && (
                      <Badge
                        variant={
                          confidenceDisplay.color === "success"
                            ? "default"
                            : confidenceDisplay.color === "destructive"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs animate-fade-in animate-delay-200"
                      >
                        <span className="mr-1" aria-hidden="true">
                          {confidenceDisplay.icon}
                        </span>
                        {confidenceDisplay.label}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="animate-fade-in-up animate-delay-100">
                      <AnalysisItem
                        label={t("type")}
                        value={t(`garment.${analysis.garment.type}` as const)}
                        confidence={analysis.garment.confidence}
                      />
                    </div>
                    <div className="animate-fade-in-up animate-delay-200">
                      <AnalysisItem
                        label={t("construction")}
                        value={t(`construction.${analysis.construction.method}` as const)}
                        confidence={analysis.construction.confidence}
                      />
                    </div>
                    <div className="animate-fade-in-up animate-delay-300">
                      <AnalysisItem
                        label={t("neckline")}
                        value={t(`neckline.${analysis.neckline.type}` as const)}
                        confidence={analysis.neckline.confidence}
                      />
                    </div>
                    <div className="animate-fade-in-up animate-delay-400">
                      <AnalysisItem
                        label={t("sleeves")}
                        value={`${t(`sleeve.${analysis.sleeves.type}` as const)} - ${t(`sleeve-length.${analysis.sleeves.length}` as const)}`}
                        confidence={analysis.sleeves.confidence}
                      />
                    </div>
                    <div className="animate-fade-in-up animate-delay-500">
                      <AnalysisItem
                        label={t("stitch")}
                        value={t(`stitch.${analysis.stitch.mainPattern}` as const)}
                        confidence={analysis.stitch.confidence}
                      />
                    </div>
                    <div className="animate-fade-in-up animate-delay-100">
                      <AnalysisItem
                        label={t("fit")}
                        value={t(`fit.${analysis.fit.style}` as const)}
                        confidence={analysis.fit.confidence}
                      />
                    </div>
                  </div>

                  {analysis.stitch.notes && (
                    <p className="text-xs text-muted-foreground border-t pt-3">
                      {analysis.stitch.notes}
                    </p>
                  )}

                  {analysis.limitations.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        {t("limitations")} :
                      </p>
                      <ul
                        className="text-xs text-muted-foreground space-y-1"
                        role="list"
                      >
                        {analysis.limitations.map((l, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span
                              className="text-warning shrink-0"
                              aria-hidden="true"
                            >
                              !
                            </span>
                            <span>{l}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne droite - Validation & Formulaire (3/5) */}
          <div className="lg:col-span-3">
            {analysis && analysis.analysable && !overlayConfirmed ? (
              /* Étape 1: Validation visuelle de l'analyse */
              <div>
                <h2 className="text-xl font-bold mb-4">{t("validateAnalysis")}</h2>
                <GarmentOverlay
                  imageUrl={imagePreview!}
                  analysis={analysis}
                  onConfirm={() => setOverlayConfirmed(true)}
                  onReject={handleChangeImage}
                />
              </div>
            ) : analysis && analysis.analysable && overlayConfirmed ? (
              /* Étape 2: Formulaire de mesures */
              <div>
                <h2 className="text-xl font-bold mb-4">{t("yourParameters")}</h2>
                <MeasurementsForm
                  analysis={analysis}
                  onSubmit={handleFormSubmit}
                  isLoading={patternLoading}
                />
              </div>
            ) : analysisLoading ? (
              <div className="min-h-[300px] md:min-h-[400px] flex items-center justify-center">
                <WeavingLoader message={t("loaderReadingKnit")} size="lg" />
              </div>
            ) : analysisError || (analysis && !analysis.analysable) ? (
              <Card className="max-w-md mx-auto text-center p-8 animate-fade-in">
                <div className="text-6xl mb-4">🧶</div>
                <h2 className="font-serif text-xl mb-2">{t("couldntReadThis")}</h2>
                <p className="text-muted-foreground mb-6">
                  {analysisError || t("tryWithAnotherPhoto")}
                </p>

                <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
                  <p className="font-medium mb-2">{t("tipsForGoodPhoto")}</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {t("tipLayFlat")}</li>
                    <li>• {t("tipGoodLighting")}</li>
                    <li>• {t("tipSingleItem")}</li>
                  </ul>
                </div>

                <Button onClick={handleChangeImage} className="w-full">
                  {t("tryWithAnotherPhotoBtn")}
                </Button>
              </Card>
            ) : (
              <div className="min-h-[300px] md:min-h-[400px] flex items-center justify-center">
                <WeavingLoader message={t("loaderReceivingImage")} size="lg" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisItem({
  label,
  value,
  confidence,
}: {
  label: string;
  value: string;
  confidence: number;
}) {
  const confidencePercent = Math.round(confidence * 100);
  const confidenceColor =
    confidencePercent >= 80
      ? "text-success"
      : confidencePercent >= 60
      ? "text-warning"
      : "text-muted-foreground/50";

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">{label}</span>
        <span
          className={`text-xs ${confidenceColor}`}
          title={`Confiance: ${confidencePercent}%`}
          aria-label={`Confiance ${confidencePercent} pour cent`}
        >
          {confidencePercent}%
        </span>
      </div>
      <p className="font-medium text-sm">{value}</p>
    </div>
  );
}
