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
import { HAT_SIZE_PRESETS, HAT_SIZE_ORDER, hatMeasurementsForSize, type HatSizeKey } from "@/lib/garments/hat-sizes";
import { GaugeSection } from "@/components/measurements/GaugeSection";
import { YarnSection } from "@/components/measurements/YarnSection";
import { HatMeasurementsSection, isHatMeasurementsValid } from "@/components/measurements/HatMeasurementsSection";
import { generateFullPattern } from "@/lib/pattern-calculator";
import { useLaMailleStore } from "@/lib/store";
import { trackEvent, getStoredUTMs } from "@/lib/analytics";
import { garmentCategory } from "@/lib/types";
import type { AnyMeasurements, GarmentAnalysis, Gauge, HatMeasurements, Measurements, YarnInfo } from "@/lib/types";

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
      toast.success(t("toastPatternGenerated"));
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
    measurements: AnyMeasurements;
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
      toast.success(t("toastPatternGenerated"));
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

  if (garmentCategory(analysis.garment.type) === "hat") {
    return <HatSizeSelector analysis={analysis} loading={patternLoading} onGenerate={handleFormSubmit} />;
  }

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

function HatSizeSelector({
  analysis,
  loading,
  onGenerate,
}: {
  analysis: GarmentAnalysis;
  loading: boolean;
  onGenerate: (data: { gauge: Gauge; measurements: HatMeasurements; yarn: YarnInfo }) => void;
}) {
  const { t, language } = useTranslation();
  const shape = analysis.hat?.shape ?? "unknown";
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [gauge, setGauge] = useState<Gauge>(DEFAULT_GAUGE);
  const [yarn, setYarn] = useState<YarnInfo>(DEFAULT_YARN);
  const [measurements, setMeasurements] = useState<HatMeasurements>(hatMeasurementsForSize("adulte", shape));
  const [touched] = useState<Set<string>>(new Set());

  const handleSizeClick = (size: HatSizeKey) => {
    trackEvent("select_size", { size, garment_type: analysis.garment.type, ...getStoredUTMs() });
    onGenerate({ gauge: DEFAULT_GAUGE, measurements: hatMeasurementsForSize(size, shape), yarn: DEFAULT_YARN });
  };

  const gaugeValid = gauge.stitchesPer10cm >= 10 && gauge.stitchesPer10cm <= 40 && gauge.rowsPer10cm >= 15 && gauge.rowsPer10cm <= 60;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("hatPickSize")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("oneClickPattern")}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {HAT_SIZE_ORDER.map((size) => {
              const preset = HAT_SIZE_PRESETS[size];
              return (
                <Button
                  key={size}
                  variant="outline"
                  onClick={() => handleSizeClick(size)}
                  disabled={loading}
                  className="flex flex-col items-center gap-0.5 h-auto py-3 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <span className="text-sm font-bold">{language === "fr" ? preset.label : preset.labelEn}</span>
                  <span className="text-xs text-muted-foreground">
                    {preset.head} {t("hatHeadLabel")}
                  </span>
                </Button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">{t("hatSizeSource")}</p>
        </CardContent>
      </Card>

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
          <form
            className="mt-4 space-y-4 animate-fade-in"
            onSubmit={(e) => {
              e.preventDefault();
              if (gaugeValid && isHatMeasurementsValid(measurements)) onGenerate({ gauge, measurements, yarn });
            }}
          >
            <GaugeSection gauge={gauge} onChange={setGauge} errors={{}} touched={touched} onBlur={() => {}} />
            <YarnSection yarn={yarn} onChange={setYarn} />
            <HatMeasurementsSection measurements={measurements} onChange={setMeasurements} />
            <Button
              type="submit"
              disabled={!gaugeValid || !isHatMeasurementsValid(measurements) || loading}
              className="w-full bg-accent hover:bg-accent/90 min-h-[48px] text-base"
              size="lg"
            >
              {loading ? t("generating") : t("generatePattern")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
