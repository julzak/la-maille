"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
import { SaveIndicator } from "@/components/SaveIndicator";
import { KnitMode } from "@/components/KnitMode";
import { useLaMailleStore } from "@/lib/store";
import { getStitchWarning } from "@/lib/messages";
import { useTranslation, translateLimitation } from "@/lib/i18n";
import { generateFullPattern } from "@/lib/pattern-calculator";
import {
  generatePatternPDF,
  getPatternFilename,
  shareOrDownloadPDF,
  canShareFiles,
} from "@/lib/pdf-utils";
import { YarnCalculator } from "@/components/YarnCalculator";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SavePatternButton } from "@/components/SavePatternButton";
import { useAutoSave } from "@/hooks/useAutoSave";
import type { StoredProject } from "@/lib/storage";
import type { YarnStock } from "@/lib/yarn-calculator";

function PatronPageContent() {
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
  } = useLaMailleStore();

  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [assemblyOpen, setAssemblyOpen] = useState(false);
  const [finishingOpen, setFinishingOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [yarnStock, setYarnStock] = useState<YarnStock | null>(null);
  const [mode, setMode] = useState<"document" | "knit">("document");

  // Prepare project data for auto-save
  const projectData = useMemo<StoredProject | null>(() => {
    if (!pattern || !imagePreview) return null;
    return {
      id: pattern.id,
      createdAt: pattern.createdAt instanceof Date
        ? pattern.createdAt.toISOString()
        : (pattern.createdAt as unknown as string) || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      step: "pattern" as const,
      imagePreview: imagePreview,
      analysis: pattern.analysis,
      measurements: pattern.measurements,
      gauge: pattern.gauge,
      yarn: pattern.yarn,
      pattern: pattern,
    };
  }, [pattern, imagePreview]);

  // Auto-save project data
  const { status: saveStatus } = useAutoSave(
    "lamaille_current_project",
    projectData,
    { enabled: !!projectData, delay: 2000 }
  );

  // Hydratation & scroll to top
  useEffect(() => {
    setIsHydrated(true);
    // Check if device supports file sharing (mobile)
    setCanShare(canShareFiles());
    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: "instant" });
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

  // Afficher un toast d'avertissement pour les points complexes (une seule fois)
  const [toastShown, setToastShown] = useState(false);
  useEffect(() => {
    if (pattern?.analysis.stitch.mainPattern && !toastShown) {
      const warning = getStitchWarning(pattern.analysis.stitch.mainPattern);
      if (warning) {
        toast.warning(t("complexStitchDetected"), {
          description: warning,
          duration: 8000,
        });
        setToastShown(true);
      }
    }
  }, [pattern?.analysis.stitch.mainPattern, t, toastShown]);

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
      const blob = await generatePatternPDF({
        pattern,
        analysis: pattern.analysis,
        imageUrl: imagePreview || undefined,
        language,
      });
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
  }, [pattern, isGeneratingPDF, t, imagePreview, language]);

  // Share PDF (mobile)
  const handleSharePDF = useCallback(async () => {
    if (!pattern || isGeneratingPDF) return;

    setIsGeneratingPDF(true);
    toast.info(t("preparingShare"), {
      duration: 2000,
    });

    try {
      const blob = await generatePatternPDF({
        pattern,
        analysis: pattern.analysis,
        imageUrl: imagePreview || undefined,
        language,
      });
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
  }, [pattern, isGeneratingPDF, t, imagePreview, language]);

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
          className="sticky top-14 z-40 bg-warning/20 border-b border-warning"
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
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">{t("yourPattern")}</h1>
              <SaveIndicator status={saveStatus} />
            </div>
            <p className="text-sm text-muted-foreground">{t("generatedOn")} {createdDate}</p>
          </div>

          {/* MODE TOGGLE */}
          <div className="flex justify-center gap-2">
            <Button
              variant={mode === "document" ? "default" : "outline"}
              onClick={() => setMode("document")}
              className="rounded-full"
            >
              <span className="mr-2">📄</span>
              {t("documentModeTitle")}
            </Button>
            <Button
              variant={mode === "knit" ? "default" : "outline"}
              onClick={() => setMode("knit")}
              className="rounded-full"
            >
              <span className="mr-2">🧶</span>
              {t("knitModeTitle")}
            </Button>
          </div>

          {/* 1. RÉSUMÉ DU PROJET */}
          <Card className="animate-fade-in-up">
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
          <Card className="animate-fade-in-up animate-delay-100">
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

              {/* Yarn calculator summary */}
              <div className="border-t pt-4 mt-4">
                <YarnCalculator
                  measurements={pattern.measurements}
                  gauge={pattern.gauge}
                  garmentType={pattern.analysis.garment.type}
                  hasLongSleeves={pattern.analysis.sleeves.length !== "sans"}
                  compact={true}
                  initialStock={yarnStock}
                  onStockChange={setYarnStock}
                />
              </div>
            </CardContent>
          </Card>

          {/* 3. PATRON */}
          <Card className="animate-fade-in-up animate-delay-200">
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
            <Alert className="border-warning bg-warning/10 animate-fade-in-up animate-delay-300" role="alert">
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
          <Card className="bg-muted/50 animate-fade-in-up animate-delay-400">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground whitespace-pre-line">
                {pattern.disclaimer}
              </p>
            </CardContent>
          </Card>

          {/* 6. ACTIONS */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 animate-fade-in-up animate-delay-500">
            {/* Save pattern button */}
            <SavePatternButton
              pattern={pattern}
              imagePreview={imagePreview}
              className="min-h-[44px] w-full sm:w-auto"
            />

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

            <Button
              onClick={() => setMode("knit")}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 min-h-[44px] w-full sm:w-auto"
              aria-label={t("launchKnitting")}
            >
              <span aria-hidden="true">🧶</span>
              {t("launchKnitting")}
            </Button>

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

{/* Bouton masqué temporairement - réactiver quand email contact configuré
            <Button
              variant="ghost"
              onClick={() => {
                window.location.href =
                  "mailto:contact@lamaille.fr?subject=Probleme avec un patron genere&body=ID du patron:" +
                  pattern.id;
              }}
              className="text-muted-foreground min-h-[44px] w-full sm:w-auto"
              aria-label={t("reportProblem")}
            >
              {t("reportProblem")}
            </Button>
            */}
          </div>

        </div>
      </div>

      {/* KNIT MODE OVERLAY */}
      {mode === "knit" && (
        <KnitMode
          pattern={pattern}
          onExit={() => setMode("document")}
        />
      )}
    </div>
  );
}

export default function PatronPage() {
  return (
    <ProtectedRoute>
      <PatronPageContent />
    </ProtectedRoute>
  );
}
