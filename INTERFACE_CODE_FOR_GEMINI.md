# OK Patron - Interface Code for UX Review

## 1. Home Page (app/page.tsx)

```tsx
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUploader } from "@/components/ImageUploader";
import { useOKPatronStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setImage, setAnalysisLoading, analysisLoading } = useOKPatronStore();

  const handleImageSelected = async (file: File, preview: string) => {
    setImage(file, preview);
    setAnalysisLoading(true);
    router.push("/analyse");
  };

  return (
    <div>
      {/* HERO SECTION */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {t("homeTitle")}
          </h1>
          <p className="text-xl text-muted-foreground">{t("homeSubtitle")}</p>
        </div>
      </section>

      {/* ZONE UPLOAD */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-2xl">
          <ImageUploader
            onImageSelected={handleImageSelected}
            isLoading={analysisLoading}
          />
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("homeHowItWorks")}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <StepCard
              emoji="📸"
              step={1}
              stepLabel={t("step")}
              title={t("step1Title")}
              description={t("step1Desc")}
            />
            <StepCard
              emoji="🔍"
              step={2}
              stepLabel={t("step")}
              title={t("step2Title")}
              description={t("step2Desc")}
            />
            <StepCard
              emoji="📏"
              step={3}
              stepLabel={t("step")}
              title={t("step3Title")}
              description={t("step3Desc")}
            />
            <StepCard
              emoji="🧶"
              step={4}
              stepLabel={t("step")}
              title={t("step4Title")}
              description={t("step4Desc")}
            />
          </div>
        </div>
      </section>

      {/* SECTION HONNÊTETÉ */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-12">
                {/* Ce que je sais faire */}
                <div>
                  <h3 className="text-xl font-bold mb-6">{t("whatICanDo")}</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-success mt-0.5">✅</span>
                      <span>{t("basicSweaters")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-success mt-0.5">✅</span>
                      <span>{t("basicStitches")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-success mt-0.5">✅</span>
                      <span>{t("adaptedCalcs")}</span>
                    </li>
                  </ul>
                </div>

                {/* Mes limites */}
                <div>
                  <h3 className="text-xl font-bold mb-6">{t("myLimits")}</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-warning mt-0.5">⚠️</span>
                      <span>{t("cablesLimit")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-warning mt-0.5">⚠️</span>
                      <span>{t("colorworkLimit")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-destructive mt-0.5">❌</span>
                      <span>{t("laceLimit")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-destructive mt-0.5">❌</span>
                      <span>{t("experimentalLimit")}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function StepCard({
  emoji,
  step,
  stepLabel,
  title,
  description,
}: {
  emoji: string;
  step: number;
  stepLabel: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-background rounded-xl p-6 border">
      <div className="flex items-start gap-4">
        <span className="text-3xl">{emoji}</span>
        <div>
          <div className="text-sm text-muted-foreground mb-1">
            {stepLabel} {step}
          </div>
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
```

## 2. Analysis Page (app/analyse/page.tsx)

```tsx
"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MeasurementsForm } from "@/components/MeasurementsForm";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { EmptyState } from "@/components/EmptyState";
import { useOKPatronStore } from "@/lib/store";
import { generateFullPattern } from "@/lib/pattern-calculator";
import {
  getRejectionMessage,
  CONFIDENCE_DISPLAY,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/lib/messages";
import { useTranslation } from "@/lib/i18n";
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
  } = useOKPatronStore();

  // Guard: redirect si pas d'image après un court délai
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!useOKPatronStore.getState().imagePreview) {
        router.replace("/");
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [router]);

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
    if (imagePreview && !analysis && !analysisError) {
      runAnalysis();
    }
  }, [imagePreview, analysis, analysisError, runAnalysis]);

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

  // Handler pour réessayer
  const handleRetry = () => {
    setAnalysisError(null);
    // Force re-analysis
    useOKPatronStore.setState({ analysis: null });
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
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {t("analyzeTitle")}
        </h1>
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
            {analysisLoading && <LoadingAnalysis type="analyzing" />}

            {/* État de l'analyse - Erreur */}
            {analysisError && (
              <Alert variant="destructive">
                <AlertDescription>
                  <p className="font-medium mb-1">{t("analysisError")}</p>
                  <p className="text-sm">{analysisError}</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      aria-label={t("retry")}
                    >
                      {t("retry")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleChangeImage}
                      aria-label={t("otherImage")}
                    >
                      {t("otherImage")}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Résultat analyse non analysable */}
            {analysis && !analysis.analysable && (
              <Alert variant="destructive">
                <AlertDescription>
                  <p className="font-medium mb-1">{t("imageNotAnalyzable")}</p>
                  <p className="text-sm">
                    {getRejectionMessage(analysis.rejectionReason || undefined)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={handleChangeImage}
                    aria-label={t("tryAnotherImage")}
                  >
                    {t("tryAnotherImage")}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Résultat analyse OK */}
            {analysis && analysis.analysable && (
              <Card>
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
                        className="text-xs"
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
                    <AnalysisItem
                      label={t("type")}
                      value={t(`garment.${analysis.garment.type}` as const)}
                      confidence={analysis.garment.confidence}
                    />
                    <AnalysisItem
                      label={t("construction")}
                      value={t(`construction.${analysis.construction.method}` as const)}
                      confidence={analysis.construction.confidence}
                    />
                    <AnalysisItem
                      label={t("neckline")}
                      value={t(`neckline.${analysis.neckline.type}` as const)}
                      confidence={analysis.neckline.confidence}
                    />
                    <AnalysisItem
                      label={t("sleeves")}
                      value={`${t(`sleeve.${analysis.sleeves.type}` as const)} - ${t(`sleeve-length.${analysis.sleeves.length}` as const)}`}
                      confidence={analysis.sleeves.confidence}
                    />
                    <AnalysisItem
                      label={t("stitch")}
                      value={t(`stitch.${analysis.stitch.mainPattern}` as const)}
                      confidence={analysis.stitch.confidence}
                    />
                    <AnalysisItem
                      label={t("fit")}
                      value={t(`fit.${analysis.fit.style}` as const)}
                      confidence={analysis.fit.confidence}
                    />
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

          {/* Colonne droite - Formulaire (3/5) */}
          <div className="lg:col-span-3">
            {analysis && analysis.analysable ? (
              <div>
                <h2 className="text-xl font-bold mb-4">{t("yourParameters")}</h2>
                <MeasurementsForm
                  analysis={analysis}
                  onSubmit={handleFormSubmit}
                  isLoading={patternLoading}
                />
              </div>
            ) : analysisLoading ? (
              <Card className="h-full min-h-[300px] md:min-h-[400px]">
                <CardContent className="h-full flex items-center justify-center p-6">
                  <EmptyState
                    icon="🔍"
                    title={t("analysisInProgress")}
                    description={t("formWillAppear")}
                  />
                </CardContent>
              </Card>
            ) : analysisError || (analysis && !analysis.analysable) ? (
              <Card className="h-full min-h-[300px] md:min-h-[400px]">
                <CardContent className="h-full flex items-center justify-center p-6">
                  <EmptyState
                    icon="😕"
                    title={t("analysisImpossible")}
                    description={t("tryWithAnotherPhoto")}
                    action={{
                      label: t("changeImage"),
                      onClick: handleChangeImage,
                    }}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full min-h-[300px] md:min-h-[400px]">
                <CardContent className="h-full flex items-center justify-center p-6">
                  <EmptyState
                    icon="📷"
                    title={t("waiting")}
                    description={t("analysisWillStart")}
                  />
                </CardContent>
              </Card>
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
```

## 3. Pattern Page (app/patron/page.tsx)

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Download, Share2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { PatternSection } from "@/components/PatternSection";
import { useOKPatronStore } from "@/lib/store";
import { getStitchWarning } from "@/lib/messages";
import { useTranslation, translateLimitation } from "@/lib/i18n";
import { generateFullPattern } from "@/lib/pattern-calculator";
import {
  generatePatternPDF,
  getPatternFilename,
  shareOrDownloadPDF,
  canShareFiles,
} from "@/lib/pdf-utils";

export default function PatronPage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const {
    pattern,
    patternLanguage,
    imagePreview,
    hasPattern,
    resetAll,
    analysis,
    gauge,
    measurements,
    yarn,
    setPattern,
  } = useOKPatronStore();

  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [assemblyOpen, setAssemblyOpen] = useState(false);
  const [finishingOpen, setFinishingOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [canShare, setCanShare] = useState(false);

  // Hydratation
  useEffect(() => {
    setIsHydrated(true);
    // Check if device supports file sharing (mobile)
    setCanShare(canShareFiles());
  }, []);

  // Regenerate pattern when language changes
  useEffect(() => {
    // Regenerate if language differs from pattern language, or if patternLanguage is not set (legacy patterns)
    const needsRegeneration = isHydrated &&
      pattern &&
      analysis &&
      analysis.analysable &&
      gauge &&
      measurements &&
      yarn &&
      (patternLanguage === null || language !== patternLanguage);

    if (needsRegeneration) {
      const newPattern = generateFullPattern(
        analysis,
        gauge,
        measurements,
        yarn,
        language
      );
      setPattern(newPattern, language);
    }
  }, [
    isHydrated,
    language,
    patternLanguage,
    pattern,
    analysis,
    gauge,
    measurements,
    yarn,
    setPattern,
  ]);

  // Guard: redirect si pas de patron
  useEffect(() => {
    if (isHydrated && !hasPattern()) {
      router.replace("/");
    }
  }, [isHydrated, hasPattern, router]);

  // Gérer le scroll pour réafficher le disclaimer
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY && currentScrollY > 100) {
        setShowDisclaimer(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Afficher un toast d'avertissement pour les points complexes
  useEffect(() => {
    if (pattern?.analysis.stitch.mainPattern) {
      const warning = getStitchWarning(pattern.analysis.stitch.mainPattern);
      if (warning) {
        toast.warning(t("complexStitchDetected"), {
          description: warning,
          duration: 8000,
        });
      }
    }
  }, [pattern?.analysis.stitch.mainPattern, t]);

  const handleReset = () => {
    resetAll();
    router.push("/");
  };

  // Download PDF
  const handleDownloadPDF = useCallback(async () => {
    if (!pattern || isGeneratingPDF) return;

    setIsGeneratingPDF(true);
    toast.info(t("generatingPDFMessage"), {
      description: t("mayTakeFewSeconds"),
      duration: 3000,
    });

    try {
      const blob = await generatePatternPDF(pattern);
      const filename = getPatternFilename(pattern);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t("pdfDownloaded"), {
        description: filename,
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error(t("pdfGenerationError"), {
        description: t("pleaseRetry"),
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [pattern, isGeneratingPDF, t]);

  // Share PDF (mobile)
  const handleSharePDF = useCallback(async () => {
    if (!pattern || isGeneratingPDF) return;

    setIsGeneratingPDF(true);
    toast.info(t("preparingShare"), {
      duration: 2000,
    });

    try {
      const blob = await generatePatternPDF(pattern);
      const filename = getPatternFilename(pattern);
      const garmentTypeLabel = t(`garment.${pattern.analysis.garment.type}` as const);

      const { shared } = await shareOrDownloadPDF(
        blob,
        filename,
        `${t("yourPattern")} - ${garmentTypeLabel}`
      );

      if (shared) {
        toast.success(t("pdfShared"));
      } else {
        toast.success(t("pdfDownloaded"), {
          description: filename,
        });
      }
    } catch (error) {
      console.error("PDF share failed:", error);
      toast.error(t("shareError"), {
        description: t("pdfDownloadedInstead"),
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [pattern, isGeneratingPDF, t]);

  // Loading pendant l'hydratation
  if (!isHydrated || !pattern) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>

          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                <Skeleton className="w-24 h-24 rounded-lg shrink-0" />
                <div className="flex-1 grid sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const calculatedWidth = Math.round(
    pattern.measurements.chestCircumference + pattern.measurements.ease
  );

  const garmentTypeLabel = t(`garment.${pattern.analysis.garment.type}` as const);
  const createdDate = new Date(pattern.createdAt).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* DISCLAIMER BANNER */}
      {showDisclaimer && (
        <div
          className="sticky top-0 z-50 bg-warning/20 border-b border-warning"
          role="alert"
          aria-live="polite"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-xl" aria-hidden="true">
                  !
                </span>
                <div>
                  <p className="font-medium text-sm">
                    {t("disclaimer")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("verifyAndSwatch")}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDisclaimer(false)}
                className="shrink-0"
                aria-label={t("close")}
              >
                <span aria-hidden="true">x</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-2xl md:text-3xl font-bold">{t("yourPattern")}</h1>
            <p className="text-sm text-muted-foreground">{t("generatedOn")} {createdDate}</p>
          </div>

          {/* 1. RÉSUMÉ DU PROJET */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t("projectSummary")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Miniature */}
                {imagePreview && (
                  <div className="shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={imagePreview}
                        alt="Image source du vetement"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Infos */}
                <div className="flex-1 grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      {t("type")}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="font-medium">{garmentTypeLabel}</span>
                      <Badge
                        variant={
                          pattern.analysis.overallConfidence === "high"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {t(`confidence.${pattern.analysis.overallConfidence}` as const)}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      {t("construction")}
                    </span>
                    <p className="font-medium mt-0.5">
                      {t(`construction.${pattern.analysis.construction.method}` as const)}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      {t("gauge")}
                    </span>
                    <p className="font-medium mt-0.5">
                      <span className="font-mono">{pattern.gauge.stitchesPer10cm}</span>{" "}
                      m x <span className="font-mono">{pattern.gauge.rowsPer10cm}</span>{" "}
                      r / 10 cm
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      {t("calculatedSize")}
                    </span>
                    <p className="font-medium mt-0.5">
                      ~<span className="font-mono">{calculatedWidth}</span> {t("chestLabel")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. MATÉRIEL */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t("materialsNeeded")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm" role="list">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground w-16 sm:w-20 shrink-0">
                    {t("yarnLabel")}
                  </span>
                  <span>
                    <strong>{t(`yarn.${pattern.yarn.weight}` as const)}</strong>
                    {pattern.yarn.composition && ` - ${pattern.yarn.composition}`}
                    {" - "}
                    <span className="text-muted-foreground">
                      {t("estimate")}{" "}
                      <span className="font-mono">
                        {Math.round(pattern.estimatedYardage * 0.9)}-
                        {Math.round(pattern.estimatedYardage * 1.1)}
                      </span>{" "}
                      g
                    </span>
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground w-16 sm:w-20 shrink-0">
                    {t("needles")}
                  </span>
                  <span>
                    <strong>
                      <span className="font-mono">{pattern.gauge.needleSize}</span> mm
                    </strong>
                    {" - "}{t("circularMin")}
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground w-16 sm:w-20 shrink-0">
                    {t("accessories")}
                  </span>
                  <span>{t("accessoriesList")}</span>
                </li>

                {pattern.analysis.closure.type === "boutons" && (
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground w-16 sm:w-20 shrink-0">
                      {t("buttons")}
                    </span>
                    <span>
                      <strong>
                        <span className="font-mono">
                          {pattern.analysis.closure.buttonCountEstimate || 5}
                        </span>{" "}
                      </strong>
                      {t("buttonsDescription")}
                    </span>
                  </li>
                )}

                {pattern.analysis.closure.type === "zip" && (
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground w-16 sm:w-20 shrink-0">
                      {t("zipper")}
                    </span>
                    <span>
                      {t("zipperSeparable")} ~
                      <span className="font-mono">{pattern.measurements.bodyLength}</span>{" "}
                      cm
                    </span>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* 3. PATRON */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t("patternInstructions")}</CardTitle>
              <CardDescription className="text-sm">
                {t("touchToExpand")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              {/* Pièces du patron */}
              {pattern.pieces.map((piece, index) => (
                <div key={index}>
                  <PatternSection
                    title={piece.name}
                    piece={piece}
                    defaultOpen={index === 0}
                    gauge={pattern.gauge}
                    measurements={{
                      armLength: pattern.measurements.armLength,
                      wristCircumference: pattern.measurements.wristCircumference,
                      bicepCircumference: pattern.measurements.bicepCircumference,
                    }}
                  />
                </div>
              ))}

              {/* ASSEMBLAGE */}
              <div className="border rounded-lg overflow-hidden border-l-4 border-l-muted-foreground">
                <button
                  onClick={() => setAssemblyOpen(!assemblyOpen)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 active:bg-muted transition-colors text-left min-h-[56px] touch-manipulation"
                  aria-expanded={assemblyOpen}
                  aria-controls="assembly-content"
                >
                  <div className="flex items-center gap-3">
                    {assemblyOpen ? (
                      <ChevronDown
                        className="h-5 w-5 text-muted-foreground shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronRight
                        className="h-5 w-5 text-muted-foreground shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span className="text-lg" aria-hidden="true">
                      -
                    </span>
                    <span className="font-semibold text-base md:text-lg">
                      {t("assembly")}
                    </span>
                  </div>
                </button>

                <div
                  id="assembly-content"
                  className={`px-4 pb-4 ${assemblyOpen ? "" : "hidden"}`}
                >
                  <ol className="space-y-2 text-sm list-decimal list-inside ml-4">
                    {pattern.assembly.map((step, i) => (
                      <li key={i} className="leading-relaxed">
                        {step.replace(/^\d+\.\s*/, "")}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* FINITIONS */}
              <div className="border rounded-lg overflow-hidden border-l-4 border-l-muted-foreground">
                <button
                  onClick={() => setFinishingOpen(!finishingOpen)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 active:bg-muted transition-colors text-left min-h-[56px] touch-manipulation"
                  aria-expanded={finishingOpen}
                  aria-controls="finishing-content"
                >
                  <div className="flex items-center gap-3">
                    {finishingOpen ? (
                      <ChevronDown
                        className="h-5 w-5 text-muted-foreground shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronRight
                        className="h-5 w-5 text-muted-foreground shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span className="text-lg" aria-hidden="true">
                      *
                    </span>
                    <span className="font-semibold text-base md:text-lg">{t("finishing")}</span>
                  </div>
                </button>

                <div
                  id="finishing-content"
                  className={`px-4 pb-4 ${finishingOpen ? "" : "hidden"}`}
                >
                  <ul className="space-y-2 text-sm ml-4" role="list">
                    {pattern.finishing.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-muted-foreground" aria-hidden="true">
                          -
                        </span>
                        <span>{step.replace(/^-\s*/, "")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. LIMITATIONS */}
          {pattern.analysis.limitations.length > 0 && (
            <Alert className="border-warning bg-warning/10" role="alert">
              <AlertDescription>
                <div className="flex items-start gap-3">
                  <span className="text-xl" aria-hidden="true">
                    !
                  </span>
                  <div>
                    <p className="font-medium mb-2">
                      {t("couldNotDetermine")}
                    </p>
                    <ul className="space-y-1 text-sm" role="list">
                      {pattern.analysis.limitations.map((limitation, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-muted-foreground" aria-hidden="true">
                            -
                          </span>
                          <span>{translateLimitation(limitation, language)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-muted-foreground mt-3">
                      {t("requiresJudgment")}
                    </p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* 5. DISCLAIMER COMPLET */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground whitespace-pre-line">
                {pattern.disclaimer}
              </p>
            </CardContent>
          </Card>

          {/* 6. ACTIONS */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            {canShare ? (
              <Button
                onClick={handleSharePDF}
                disabled={isGeneratingPDF}
                className="flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 min-h-[44px] w-full sm:w-auto"
                aria-label={t("sharePDF")}
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                {isGeneratingPDF ? t("generatingPDF") : t("sharePDF")}
              </Button>
            ) : (
              <Button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 min-h-[44px] w-full sm:w-auto"
                aria-label={t("downloadPDF")}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {isGeneratingPDF ? t("generatingPDF") : t("downloadPDF")}
              </Button>
            )}

            {canShare && (
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
                aria-label={t("downloadPDF")}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {t("download")}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleReset}
              className="min-h-[44px] w-full sm:w-auto"
              aria-label={t("restart")}
            >
              {t("restart")}
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                window.location.href =
                  "mailto:contact@okpatron.fr?subject=Probleme avec un patron genere&body=ID du patron: " +
                  pattern.id;
              }}
              className="text-muted-foreground min-h-[44px] w-full sm:w-auto"
              aria-label={t("reportProblem")}
            >
              {t("reportProblem")}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
```

## 4. Image Uploader (components/ImageUploader.tsx)

```tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ERROR_MESSAGES } from "@/lib/messages";
import { useTranslation } from "@/lib/i18n";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface ImageUploaderProps {
  onImageSelected: (file: File, preview: string) => void;
  isLoading?: boolean;
}

type UploaderState = "idle" | "dragover" | "selected" | "error";

export function ImageUploader({
  onImageSelected,
  isLoading = false,
}: ImageUploaderProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<UploaderState>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        setState("error");
        setPreview(null);
        setSelectedFile(null);
        return;
      }

      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPreview(url);
        setSelectedFile(file);
        setState("selected");
      };
      reader.readAsDataURL(file);
    },
    [validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      } else {
        setState("idle");
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (state !== "selected") {
        setState("dragover");
      }
    },
    [state]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (state !== "selected") {
        setState("idle");
      }
    },
    [state]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
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

  const handleReset = useCallback(() => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    setState("idle");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const handleAnalyze = useCallback(() => {
    if (selectedFile && preview) {
      onImageSelected(selectedFile, preview);
    }
  }, [selectedFile, preview, onImageSelected]);

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

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={state !== "selected" ? handleClick : undefined}
        onKeyDown={state !== "selected" ? handleKeyDown : undefined}
        className={getContainerClasses()}
        role={state !== "selected" ? "button" : undefined}
        tabIndex={state !== "selected" ? 0 : undefined}
        aria-label={
          state !== "selected" ? t("dropZoneLabel") : undefined
        }
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleChange}
          className="hidden"
          aria-label="Sélectionner une image"
          id="image-upload"
        />

        {state === "selected" && preview && selectedFile ? (
          <div className="p-4 md:p-6">
            <div className="flex flex-col items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Aperçu de l'image sélectionnée"
                className="max-h-[250px] md:max-h-[300px] w-auto rounded-lg shadow-sm"
              />
              <p
                className="text-sm text-muted-foreground truncate max-w-full px-4"
                title={selectedFile.name}
              >
                {selectedFile.name}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleReset}
                  disabled={isLoading}
                  className="w-full sm:w-auto min-h-[44px]"
                  aria-label={t("changeImageBtn")}
                >
                  {t("changeImageBtn")}
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="bg-accent hover:bg-accent/90 w-full sm:w-auto min-h-[44px]"
                  aria-label={
                    isLoading ? t("analyzingBtn") : t("analyzeThisImage")
                  }
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
        ) : (
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
        )}
      </div>

      {error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

## 5. Measurements Form (components/MeasurementsForm.tsx)

```tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { GarmentAnalysis, Gauge, Measurements, YarnInfo } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

interface MeasurementsFormProps {
  analysis: GarmentAnalysis;
  onSubmit: (data: {
    gauge: Gauge;
    measurements: Measurements;
    yarn: YarnInfo;
  }) => void;
  isLoading: boolean;
}

interface FormErrors {
  stitchesPer10cm?: string;
  rowsPer10cm?: string;
  chestCircumference?: string;
  bodyLength?: string;
  shoulderWidth?: string;
  armLength?: string;
  wristCircumference?: string;
  bicepCircumference?: string;
}

const NEEDLE_SIZES = [
  "2",
  "2.5",
  "3",
  "3.5",
  "4",
  "4.5",
  "5",
  "5.5",
  "6",
  "6.5",
  "7",
  "7.5",
  "8",
  "9",
  "10",
  "12",
];

const YARN_WEIGHTS: YarnInfo["weight"][] = [
  "lace",
  "fingering",
  "sport",
  "dk",
  "worsted",
  "aran",
  "bulky",
];

export function MeasurementsForm({
  analysis,
  onSubmit,
  isLoading,
}: MeasurementsFormProps) {
  const { t } = useTranslation();

  // Gauge state
  const [gauge, setGauge] = useState<Gauge>({
    stitchesPer10cm: 22,
    rowsPer10cm: 30,
    needleSize: 4,
  });

  // Yarn state
  const [yarn, setYarn] = useState<YarnInfo>({
    weight: "dk",
    composition: "",
  });

  // Measurements state
  const [measurements, setMeasurements] = useState<Measurements>({
    chestCircumference: 96,
    bodyLength: 60,
    shoulderWidth: 42,
    armLength: 58,
    wristCircumference: 16,
    bicepCircumference: 30,
    ease: 8,
  });

  // Errors state
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Set default ease based on analysis fit
  useEffect(() => {
    if (analysis.fit.style === "ajuste") {
      setMeasurements((m) => ({ ...m, ease: 4 }));
    } else if (analysis.fit.style === "oversized") {
      setMeasurements((m) => ({ ...m, ease: 14 }));
    } else if (analysis.fit.style === "regular") {
      setMeasurements((m) => ({ ...m, ease: 8 }));
    }
  }, [analysis.fit.style]);

  // Validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Gauge validation
    if (
      !gauge.stitchesPer10cm ||
      gauge.stitchesPer10cm < 10 ||
      gauge.stitchesPer10cm > 40
    ) {
      newErrors.stitchesPer10cm = "Entre 10 et 40 mailles";
    }
    if (
      !gauge.rowsPer10cm ||
      gauge.rowsPer10cm < 15 ||
      gauge.rowsPer10cm > 60
    ) {
      newErrors.rowsPer10cm = "Entre 15 et 60 rangs";
    }

    // Measurements validation
    if (
      !measurements.chestCircumference ||
      measurements.chestCircumference < 60 ||
      measurements.chestCircumference > 160
    ) {
      newErrors.chestCircumference = "Entre 60 et 160 cm";
    }
    if (
      !measurements.bodyLength ||
      measurements.bodyLength < 30 ||
      measurements.bodyLength > 100
    ) {
      newErrors.bodyLength = "Entre 30 et 100 cm";
    }
    if (
      !measurements.shoulderWidth ||
      measurements.shoulderWidth < 30 ||
      measurements.shoulderWidth > 60
    ) {
      newErrors.shoulderWidth = "Entre 30 et 60 cm";
    }
    if (
      !measurements.armLength ||
      measurements.armLength < 30 ||
      measurements.armLength > 80
    ) {
      newErrors.armLength = "Entre 30 et 80 cm";
    }
    if (
      !measurements.wristCircumference ||
      measurements.wristCircumference < 12 ||
      measurements.wristCircumference > 25
    ) {
      newErrors.wristCircumference = "Entre 12 et 25 cm";
    }
    if (
      !measurements.bicepCircumference ||
      measurements.bicepCircumference < 20 ||
      measurements.bicepCircumference > 50
    ) {
      newErrors.bicepCircumference = "Entre 20 et 50 cm";
    }

    // Coherence checks
    if (measurements.wristCircumference >= measurements.bicepCircumference) {
      newErrors.wristCircumference = "Doit etre inferieur au tour de biceps";
    }
    if (measurements.bicepCircumference >= measurements.chestCircumference) {
      newErrors.bicepCircumference = "Doit etre inferieur au tour de poitrine";
    }
    if (measurements.shoulderWidth >= measurements.chestCircumference / 2) {
      newErrors.shoulderWidth = "Semble trop large par rapport a la poitrine";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => new Set(prev).add(field));
    validate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mark all fields as touched
    setTouched(
      new Set([
        "stitchesPer10cm",
        "rowsPer10cm",
        "chestCircumference",
        "bodyLength",
        "shoulderWidth",
        "armLength",
        "wristCircumference",
        "bicepCircumference",
      ])
    );

    if (validate()) {
      onSubmit({ gauge, measurements, yarn });
    }
  };

  const isFormValid = () => {
    return (
      gauge.stitchesPer10cm >= 10 &&
      gauge.stitchesPer10cm <= 40 &&
      gauge.rowsPer10cm >= 15 &&
      gauge.rowsPer10cm <= 60 &&
      measurements.chestCircumference >= 60 &&
      measurements.bodyLength >= 30 &&
      measurements.shoulderWidth >= 30 &&
      measurements.armLength >= 30 &&
      measurements.wristCircumference >= 12 &&
      measurements.bicepCircumference >= 20 &&
      measurements.wristCircumference < measurements.bicepCircumference &&
      measurements.bicepCircumference < measurements.chestCircumference
    );
  };

  const getEaseLabel = (ease: number) => {
    if (ease <= 5) return t("fitted");
    if (ease <= 10) return t("regular");
    return t("oversized");
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* SECTION 1: ÉCHANTILLON */}
        <Card className="border-accent">
          <CardHeader className="pb-3 md:pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base md:text-lg">{t("gauge")}</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <span className="text-xs md:text-sm underline decoration-dotted">
                      {t("whyEssential")}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t("gaugeExplanation")}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription className="text-xs md:text-sm">
              {t("gaugeDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="stitchesPer10cm" className="text-sm font-medium">
                  {t("stitchesPer10cm")} *
                </Label>
                <Input
                  id="stitchesPer10cm"
                  type="number"
                  inputMode="numeric"
                  min={10}
                  max={40}
                  value={gauge.stitchesPer10cm}
                  onChange={(e) =>
                    setGauge({ ...gauge, stitchesPer10cm: Number(e.target.value) })
                  }
                  onBlur={() => handleBlur("stitchesPer10cm")}
                  className={`min-h-[44px] ${
                    touched.has("stitchesPer10cm") && errors.stitchesPer10cm
                      ? "border-destructive"
                      : ""
                  }`}
                  aria-invalid={
                    touched.has("stitchesPer10cm") && !!errors.stitchesPer10cm
                  }
                  aria-describedby={
                    errors.stitchesPer10cm ? "stitchesPer10cm-error" : undefined
                  }
                />
                {touched.has("stitchesPer10cm") && errors.stitchesPer10cm && (
                  <p
                    id="stitchesPer10cm-error"
                    className="text-xs text-destructive"
                    role="alert"
                  >
                    {errors.stitchesPer10cm}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rowsPer10cm" className="text-sm font-medium">
                  {t("rowsPer10cm")} *
                </Label>
                <Input
                  id="rowsPer10cm"
                  type="number"
                  inputMode="numeric"
                  min={15}
                  max={60}
                  value={gauge.rowsPer10cm}
                  onChange={(e) =>
                    setGauge({ ...gauge, rowsPer10cm: Number(e.target.value) })
                  }
                  onBlur={() => handleBlur("rowsPer10cm")}
                  className={`min-h-[44px] ${
                    touched.has("rowsPer10cm") && errors.rowsPer10cm
                      ? "border-destructive"
                      : ""
                  }`}
                  aria-invalid={
                    touched.has("rowsPer10cm") && !!errors.rowsPer10cm
                  }
                  aria-describedby={
                    errors.rowsPer10cm ? "rowsPer10cm-error" : undefined
                  }
                />
                {touched.has("rowsPer10cm") && errors.rowsPer10cm && (
                  <p
                    id="rowsPer10cm-error"
                    className="text-xs text-destructive"
                    role="alert"
                  >
                    {errors.rowsPer10cm}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="needleSize" className="text-sm font-medium">
                {t("needleSize")}
              </Label>
              <Select
                value={String(gauge.needleSize)}
                onValueChange={(v) =>
                  setGauge({ ...gauge, needleSize: Number(v) })
                }
              >
                <SelectTrigger id="needleSize" className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NEEDLE_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size} mm
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: FIL */}
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-base md:text-lg">{t("yarn")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="yarnWeight" className="text-sm font-medium">
                {t("yarnWeight")}
              </Label>
              <Select
                value={yarn.weight}
                onValueChange={(v) =>
                  setYarn({ ...yarn, weight: v as YarnInfo["weight"] })
                }
              >
                <SelectTrigger id="yarnWeight" className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YARN_WEIGHTS.map((weight) => (
                    <SelectItem key={weight} value={weight}>
                      {t(`yarn.${weight}` as const)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="yarnComposition" className="text-sm font-medium">
                {t("composition")}
              </Label>
              <Input
                id="yarnComposition"
                type="text"
                placeholder={t("compositionPlaceholder")}
                value={yarn.composition || ""}
                onChange={(e) => setYarn({ ...yarn, composition: e.target.value })}
                className="min-h-[44px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3: MESURES CORPORELLES */}
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base md:text-lg">
                  {t("measurements")}
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  {t("measurementsDescription")}
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="text-xs md:text-sm text-accent hover:underline self-start sm:self-auto"
                  >
                    {t("howToMeasure")}
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t("measurementGuide")}</DialogTitle>
                    <DialogDescription>
                      {t("measurementGuideDesc")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-medium">{t("chestCircumference")}</p>
                      <p className="text-muted-foreground">
                        {t("chestMeasureDesc")}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">{t("bodyLength")}</p>
                      <p className="text-muted-foreground">
                        {t("bodyLengthMeasureDesc")}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">{t("shoulderWidth")}</p>
                      <p className="text-muted-foreground">
                        {t("shoulderWidthMeasureDesc")}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">{t("armLength")}</p>
                      <p className="text-muted-foreground">
                        {t("armLengthMeasureDesc")}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">{t("wristCircumference")}</p>
                      <p className="text-muted-foreground">
                        {t("wristMeasureDesc")}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">{t("bicepCircumference")}</p>
                      <p className="text-muted-foreground">
                        {t("bicepMeasureDesc")}
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="chestCircumference"
                  className="text-xs md:text-sm font-medium"
                >
                  {t("chestCircumference")} (cm) *
                </Label>
                <Input
                  id="chestCircumference"
                  type="number"
                  inputMode="numeric"
                  value={measurements.chestCircumference}
                  onChange={(e) =>
                    setMeasurements({
                      ...measurements,
                      chestCircumference: Number(e.target.value),
                    })
                  }
                  onBlur={() => handleBlur("chestCircumference")}
                  className={`min-h-[44px] ${
                    touched.has("chestCircumference") && errors.chestCircumference
                      ? "border-destructive"
                      : ""
                  }`}
                  aria-invalid={
                    touched.has("chestCircumference") && !!errors.chestCircumference
                  }
                  aria-describedby={
                    errors.chestCircumference
                      ? "chestCircumference-error"
                      : undefined
                  }
                />
                {touched.has("chestCircumference") && errors.chestCircumference && (
                  <p
                    id="chestCircumference-error"
                    className="text-xs text-destructive"
                    role="alert"
                  >
                    {errors.chestCircumference}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="bodyLength"
                  className="text-xs md:text-sm font-medium"
                >
                  {t("bodyLength")} (cm) *
                </Label>
                <Input
                  id="bodyLength"
                  type="number"
                  inputMode="numeric"
                  value={measurements.bodyLength}
                  onChange={(e) =>
                    setMeasurements({
                      ...measurements,
                      bodyLength: Number(e.target.value),
                    })
                  }
                  onBlur={() => handleBlur("bodyLength")}
                  className={`min-h-[44px] ${
                    touched.has("bodyLength") && errors.bodyLength
                      ? "border-destructive"
                      : ""
                  }`}
                  aria-invalid={touched.has("bodyLength") && !!errors.bodyLength}
                  aria-describedby={
                    errors.bodyLength ? "bodyLength-error" : undefined
                  }
                />
                {touched.has("bodyLength") && errors.bodyLength && (
                  <p
                    id="bodyLength-error"
                    className="text-xs text-destructive"
                    role="alert"
                  >
                    {errors.bodyLength}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="shoulderWidth"
                  className="text-xs md:text-sm font-medium"
                >
                  {t("shoulderWidth")} (cm) *
                </Label>
                <Input
                  id="shoulderWidth"
                  type="number"
                  inputMode="numeric"
                  value={measurements.shoulderWidth}
                  onChange={(e) =>
                    setMeasurements({
                      ...measurements,
                      shoulderWidth: Number(e.target.value),
                    })
                  }
                  onBlur={() => handleBlur("shoulderWidth")}
                  className={`min-h-[44px] ${
                    touched.has("shoulderWidth") && errors.shoulderWidth
                      ? "border-destructive"
                      : ""
                  }`}
                  aria-invalid={
                    touched.has("shoulderWidth") && !!errors.shoulderWidth
                  }
                  aria-describedby={
                    errors.shoulderWidth ? "shoulderWidth-error" : undefined
                  }
                />
                {touched.has("shoulderWidth") && errors.shoulderWidth && (
                  <p
                    id="shoulderWidth-error"
                    className="text-xs text-destructive"
                    role="alert"
                  >
                    {errors.shoulderWidth}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="armLength"
                  className="text-xs md:text-sm font-medium"
                >
                  {t("armLength")} (cm) *
                </Label>
                <Input
                  id="armLength"
                  type="number"
                  inputMode="numeric"
                  value={measurements.armLength}
                  onChange={(e) =>
                    setMeasurements({
                      ...measurements,
                      armLength: Number(e.target.value),
                    })
                  }
                  onBlur={() => handleBlur("armLength")}
                  className={`min-h-[44px] ${
                    touched.has("armLength") && errors.armLength
                      ? "border-destructive"
                      : ""
                  }`}
                  aria-invalid={touched.has("armLength") && !!errors.armLength}
                  aria-describedby={errors.armLength ? "armLength-error" : undefined}
                />
                {touched.has("armLength") && errors.armLength && (
                  <p
                    id="armLength-error"
                    className="text-xs text-destructive"
                    role="alert"
                  >
                    {errors.armLength}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="wristCircumference"
                  className="text-xs md:text-sm font-medium"
                >
                  {t("wristCircumference")} (cm) *
                </Label>
                <Input
                  id="wristCircumference"
                  type="number"
                  inputMode="numeric"
                  value={measurements.wristCircumference}
                  onChange={(e) =>
                    setMeasurements({
                      ...measurements,
                      wristCircumference: Number(e.target.value),
                    })
                  }
                  onBlur={() => handleBlur("wristCircumference")}
                  className={`min-h-[44px] ${
                    touched.has("wristCircumference") && errors.wristCircumference
                      ? "border-destructive"
                      : ""
                  }`}
                  aria-invalid={
                    touched.has("wristCircumference") && !!errors.wristCircumference
                  }
                  aria-describedby={
                    errors.wristCircumference
                      ? "wristCircumference-error"
                      : undefined
                  }
                />
                {touched.has("wristCircumference") && errors.wristCircumference && (
                  <p
                    id="wristCircumference-error"
                    className="text-xs text-destructive"
                    role="alert"
                  >
                    {errors.wristCircumference}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="bicepCircumference"
                  className="text-xs md:text-sm font-medium"
                >
                  {t("bicepCircumference")} (cm) *
                </Label>
                <Input
                  id="bicepCircumference"
                  type="number"
                  inputMode="numeric"
                  value={measurements.bicepCircumference}
                  onChange={(e) =>
                    setMeasurements({
                      ...measurements,
                      bicepCircumference: Number(e.target.value),
                    })
                  }
                  onBlur={() => handleBlur("bicepCircumference")}
                  className={`min-h-[44px] ${
                    touched.has("bicepCircumference") && errors.bicepCircumference
                      ? "border-destructive"
                      : ""
                  }`}
                  aria-invalid={
                    touched.has("bicepCircumference") && !!errors.bicepCircumference
                  }
                  aria-describedby={
                    errors.bicepCircumference
                      ? "bicepCircumference-error"
                      : undefined
                  }
                />
                {touched.has("bicepCircumference") && errors.bicepCircumference && (
                  <p
                    id="bicepCircumference-error"
                    className="text-xs text-destructive"
                    role="alert"
                  >
                    {errors.bicepCircumference}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4: AISANCE */}
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-base md:text-lg">{t("ease")}</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t("easeDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="ease" className="text-sm font-medium">
                  {t("ease")} : {measurements.ease} cm
                </Label>
                <span className="text-sm text-muted-foreground">
                  {getEaseLabel(measurements.ease)}
                </span>
              </div>
              <Slider
                id="ease"
                value={[measurements.ease]}
                onValueChange={([value]) =>
                  setMeasurements({ ...measurements, ease: value })
                }
                min={0}
                max={20}
                step={1}
                className="touch-manipulation"
                aria-label={t("easeAriaLabel")}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("fittedRange")}</span>
                <span>{t("regularRange")}</span>
                <span>{t("oversizedRange")}</span>
              </div>
            </div>
            <div
              className="p-3 bg-muted rounded-lg text-sm"
              aria-live="polite"
            >
              <p className="text-muted-foreground">
                <strong>{t("finishedChest")} :</strong>{" "}
                {measurements.chestCircumference + measurements.ease} cm
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SUBMIT BUTTON */}
        <Button
          type="submit"
          disabled={!isFormValid() || isLoading}
          className="w-full bg-accent hover:bg-accent/90 min-h-[48px] text-base"
          size="lg"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <span
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
                aria-hidden="true"
              />
              {t("generating")}
            </>
          ) : (
            t("generatePattern")
          )}
        </Button>
      </form>
    </TooltipProvider>
  );
}
```

## 6. Pattern Section (components/PatternSection.tsx)

```tsx
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
}

export function PatternSection({
  title,
  piece,
  defaultOpen = false,
  gauge,
  measurements,
}: PatternSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showCalculations, setShowCalculations] = useState(false);
  const [showSchematic, setShowSchematic] = useState(true);

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
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          )}
          <span className="font-semibold text-lg">{title}</span>
        </div>
        <Badge variant="outline" className="font-mono">
          {piece.castOn} m.
        </Badge>
      </button>

      {/* Corps */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-6">
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
              >
                {showCalculations ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                Voir les calculs ({piece.calculations.length})
              </Button>

              {showCalculations && (
                <div className="ml-4 space-y-3 p-3 bg-muted/20 rounded-lg border">
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
```
