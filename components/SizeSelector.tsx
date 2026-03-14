"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeasurementsForm } from "@/components/MeasurementsForm";
import { useTranslation } from "@/lib/i18n";
import { SIZE_PRESETS, SIZE_ORDER, type SizeKey } from "@/lib/size-presets";
import { generateFullPattern } from "@/lib/pattern-calculator";
import { useLaMailleStore } from "@/lib/store";
import { trackEvent, getStoredUTMs } from "@/lib/analytics";
import { SUCCESS_MESSAGES } from "@/lib/messages";
import type { GarmentAnalysis, Gauge, Measurements, YarnInfo } from "@/lib/types";

interface SizeSelectorProps {
  analysis: GarmentAnalysis;
}

// Default DK gauge
const DEFAULT_GAUGE: Gauge = {
  stitchesPer10cm: 22,
  rowsPer10cm: 30,
  needleSize: 4,
};

const DEFAULT_YARN: YarnInfo = {
  weight: "dk",
  composition: "",
};

function getEaseForFit(fitStyle: string): number {
  switch (fitStyle) {
    case "ajuste":
      return 4;
    case "oversized":
      return 14;
    default:
      return 8;
  }
}

export function SizeSelector({ analysis }: SizeSelectorProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { setFormData, setPattern, setPatternLoading, setAnalysisError, patternLoading } =
    useLaMailleStore();
  const [showCustomForm, setShowCustomForm] = useState(false);

  const handleSizeClick = (size: SizeKey) => {
    const preset = SIZE_PRESETS[size];
    const ease = getEaseForFit(analysis.fit.style);
    const measurements: Measurements = {
      ...preset.measurements,
      ease,
    };

    // Track
    const utms = getStoredUTMs();
    trackEvent("select_size", {
      size,
      garment_type: analysis.garment.type,
      ...utms,
    });

    // Generate pattern
    setPatternLoading(true);
    setFormData(DEFAULT_GAUGE, measurements, DEFAULT_YARN);

    try {
      const pattern = generateFullPattern(
        analysis,
        DEFAULT_GAUGE,
        measurements,
        DEFAULT_YARN,
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
      toast.error("Erreur de génération", { description: errorMessage });
    }
  };

  const handleFormSubmit = (data: {
    gauge: Gauge;
    measurements: Measurements;
    yarn: YarnInfo;
  }) => {
    setPatternLoading(true);
    setFormData(data.gauge, data.measurements, data.yarn);

    try {
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
      toast.error("Erreur de génération", { description: errorMessage });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("pickYourSize")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("oneClickPattern")}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SIZE_ORDER.map((size) => {
              const preset = SIZE_PRESETS[size];
              const chest = preset.measurements.chestCircumference;
              return (
                <Button
                  key={size}
                  variant="outline"
                  onClick={() => handleSizeClick(size)}
                  disabled={patternLoading}
                  className="flex flex-col items-center gap-0.5 h-auto py-3 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <span className="text-lg font-bold">{size}</span>
                  <span className="text-xs text-muted-foreground">
                    {chest} cm
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Customize link / collapsible full form */}
      <div>
        <Button
          variant="ghost"
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="w-full text-sm text-muted-foreground hover:text-foreground"
        >
          {showCustomForm ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
          {t("customizeMeasurements")}
        </Button>

        {showCustomForm && (
          <div className="mt-4 animate-fade-in">
            <MeasurementsForm
              analysis={analysis}
              onSubmit={handleFormSubmit}
              isLoading={patternLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
