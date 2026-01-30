"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { GarmentAnalysis, Gauge, Measurements, YarnInfo } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import { SIZE_PRESETS, type SizeKey } from "@/lib/size-presets";
import { YarnCalculator } from "@/components/YarnCalculator";
import { GaugeSection } from "@/components/measurements/GaugeSection";
import { YarnSection } from "@/components/measurements/YarnSection";
import { BodyMeasurementsSection } from "@/components/measurements/BodyMeasurementsSection";
import type { YarnStock } from "@/lib/yarn-calculator";

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
  hipCircumference?: string;
}

export function MeasurementsForm({
  analysis,
  onSubmit,
  isLoading,
}: MeasurementsFormProps) {
  const { t } = useTranslation();

  // Size preset state
  const [selectedSize, setSelectedSize] = useState<SizeKey | "custom" | null>(null);

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
    hipCircumference: 102,
    ease: 8,
  });

  // Errors state
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Yarn stock state
  const [yarnStock, setYarnStock] = useState<YarnStock | null>(null);

  // Handle size preset selection
  const handleSizeSelect = (size: SizeKey | "custom") => {
    setSelectedSize(size);
    if (size !== "custom") {
      const preset = SIZE_PRESETS[size];
      setMeasurements((m) => ({
        ...m,
        ...preset.measurements,
      }));
    }
  };

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
    if (!gauge.stitchesPer10cm || gauge.stitchesPer10cm < 10 || gauge.stitchesPer10cm > 40) {
      newErrors.stitchesPer10cm = "Entre 10 et 40 mailles";
    }
    if (!gauge.rowsPer10cm || gauge.rowsPer10cm < 15 || gauge.rowsPer10cm > 60) {
      newErrors.rowsPer10cm = "Entre 15 et 60 rangs";
    }

    // Measurements validation
    if (!measurements.chestCircumference || measurements.chestCircumference < 60 || measurements.chestCircumference > 160) {
      newErrors.chestCircumference = "Entre 60 et 160 cm";
    }
    if (!measurements.bodyLength || measurements.bodyLength < 30 || measurements.bodyLength > 100) {
      newErrors.bodyLength = "Entre 30 et 100 cm";
    }
    if (!measurements.shoulderWidth || measurements.shoulderWidth < 30 || measurements.shoulderWidth > 60) {
      newErrors.shoulderWidth = "Entre 30 et 60 cm";
    }
    if (!measurements.armLength || measurements.armLength < 30 || measurements.armLength > 80) {
      newErrors.armLength = "Entre 30 et 80 cm";
    }
    if (!measurements.wristCircumference || measurements.wristCircumference < 12 || measurements.wristCircumference > 25) {
      newErrors.wristCircumference = "Entre 12 et 25 cm";
    }
    if (!measurements.bicepCircumference || measurements.bicepCircumference < 20 || measurements.bicepCircumference > 50) {
      newErrors.bicepCircumference = "Entre 20 et 50 cm";
    }
    if (!measurements.hipCircumference || measurements.hipCircumference < 60 || measurements.hipCircumference > 170) {
      newErrors.hipCircumference = "Entre 60 et 170 cm";
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
        "hipCircumference",
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
      (measurements.hipCircumference ?? 0) >= 60 &&
      measurements.wristCircumference < measurements.bicepCircumference &&
      measurements.bicepCircumference < measurements.chestCircumference
    );
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* SECTION 1: GAUGE */}
        <GaugeSection
          gauge={gauge}
          onChange={setGauge}
          errors={{ stitchesPer10cm: errors.stitchesPer10cm, rowsPer10cm: errors.rowsPer10cm }}
          touched={touched}
          onBlur={handleBlur}
        />

        {/* SECTION 2: YARN */}
        <YarnSection yarn={yarn} onChange={setYarn} />

        {/* SECTIONS 3-5: SIZE PRESETS + MEASUREMENTS + EASE */}
        <BodyMeasurementsSection
          measurements={measurements}
          onChange={setMeasurements}
          selectedSize={selectedSize}
          onSizeSelect={handleSizeSelect}
          errors={{
            chestCircumference: errors.chestCircumference,
            bodyLength: errors.bodyLength,
            shoulderWidth: errors.shoulderWidth,
            armLength: errors.armLength,
            wristCircumference: errors.wristCircumference,
            bicepCircumference: errors.bicepCircumference,
            hipCircumference: errors.hipCircumference,
          }}
          touched={touched}
          onBlur={handleBlur}
        />

        {/* SECTION 6: YARN CALCULATOR */}
        <YarnCalculator
          measurements={measurements}
          gauge={gauge}
          garmentType={analysis.garment.type}
          hasLongSleeves={analysis.sleeves.length !== "sans"}
          onMeasurementsChange={setMeasurements}
          initialStock={yarnStock}
          onStockChange={setYarnStock}
        />

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
