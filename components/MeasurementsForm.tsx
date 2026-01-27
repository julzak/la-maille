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
import { TooltipProvider } from "@/components/ui/tooltip";
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
import {
  SIZE_PRESETS,
  SIZE_ORDER,
  hasSignificantChange,
  type SizeKey,
} from "@/lib/size-presets";
import { YarnCalculator } from "@/components/YarnCalculator";
import { GaugeChecker } from "@/components/GaugeChecker";
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

  // Gauge checker dialog state
  const [gaugeCheckerOpen, setGaugeCheckerOpen] = useState(false);

  // Check if a measurement has been modified from preset
  const isModifiedFromPreset = (field: keyof typeof SIZE_PRESETS.M.measurements): boolean => {
    if (!selectedSize || selectedSize === "custom") return false;
    const preset = SIZE_PRESETS[selectedSize];
    if (!preset) return false;
    const currentValue = measurements[field];
    if (currentValue === undefined) return false;
    return hasSignificantChange(
      currentValue,
      preset.measurements[field],
      5
    );
  };

  // Check if any measurement has significant changes
  const hasAnyModification = (): boolean => {
    if (!selectedSize || selectedSize === "custom") return false;
    const preset = SIZE_PRESETS[selectedSize];
    if (!preset) return false;
    const fields = Object.keys(preset.measurements) as (keyof typeof preset.measurements)[];
    return fields.some((field) => {
      const currentValue = measurements[field];
      if (currentValue === undefined) return false;
      return hasSignificantChange(currentValue, preset.measurements[field], 5);
    });
  };

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
    if (
      !measurements.hipCircumference ||
      measurements.hipCircumference < 60 ||
      measurements.hipCircumference > 170
    ) {
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
              <button
                type="button"
                onClick={() => setGaugeCheckerOpen(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="text-xs md:text-sm underline decoration-dotted">
                  {t("whyEssential")}
                </span>
              </button>
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

            {/* Gauge checker button */}
            <div className="pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGaugeCheckerOpen(true)}
                className="w-full text-sm"
              >
                {t("checkSwatchVisually")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gauge Checker Modal */}
        <GaugeChecker
          open={gaugeCheckerOpen}
          onOpenChange={setGaugeCheckerOpen}
        />

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

        {/* SECTION 3: SIZE PRESETS */}
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-base md:text-lg">{t("chooseABase")}</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t("startFromStandardSize")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Size buttons */}
            <div className="flex flex-wrap gap-2">
              {SIZE_ORDER.map((size) => (
                <Button
                  key={size}
                  type="button"
                  variant={selectedSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSizeSelect(size)}
                  className={`min-w-[48px] ${
                    selectedSize === size ? "bg-accent hover:bg-accent/90" : ""
                  }`}
                >
                  {size}
                </Button>
              ))}
              <Button
                type="button"
                variant={selectedSize === "custom" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSizeSelect("custom")}
                className={`${
                  selectedSize === "custom" ? "bg-accent hover:bg-accent/90" : ""
                }`}
              >
                {t("customMeasurements")}
              </Button>
            </div>

            {/* Selected size badge */}
            {selectedSize && selectedSize !== "custom" && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                  {t("basedOnSize")} {selectedSize}
                  {hasAnyModification() && (
                    <span className="ml-1 text-muted-foreground">{t("modified")}</span>
                  )}
                </span>
              </div>
            )}

            {/* Encouragement message */}
            <p className="text-xs text-muted-foreground italic">
              {t("noNeedForPrecision")}
            </p>
          </CardContent>
        </Card>

        {/* SECTION 4: MESURES CORPORELLES */}
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
              {/* Chest Circumference */}
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
                      : selectedSize && selectedSize !== "custom" && !isModifiedFromPreset("chestCircumference")
                      ? "bg-accent/5 border-accent/30"
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

              {/* Body Length */}
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
                      : selectedSize && selectedSize !== "custom" && !isModifiedFromPreset("bodyLength")
                      ? "bg-accent/5 border-accent/30"
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

              {/* Shoulder Width */}
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
                      : selectedSize && selectedSize !== "custom" && !isModifiedFromPreset("shoulderWidth")
                      ? "bg-accent/5 border-accent/30"
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

              {/* Arm Length */}
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
                      : selectedSize && selectedSize !== "custom" && !isModifiedFromPreset("armLength")
                      ? "bg-accent/5 border-accent/30"
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

              {/* Wrist Circumference */}
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
                      : selectedSize && selectedSize !== "custom" && !isModifiedFromPreset("wristCircumference")
                      ? "bg-accent/5 border-accent/30"
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

              {/* Bicep Circumference */}
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
                      : selectedSize && selectedSize !== "custom" && !isModifiedFromPreset("bicepCircumference")
                      ? "bg-accent/5 border-accent/30"
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

              {/* Hip Circumference */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="hipCircumference"
                  className="text-xs md:text-sm font-medium"
                >
                  {t("hipCircumference")} (cm) *
                </Label>
                <Input
                  id="hipCircumference"
                  type="number"
                  inputMode="numeric"
                  value={measurements.hipCircumference}
                  onChange={(e) =>
                    setMeasurements({
                      ...measurements,
                      hipCircumference: Number(e.target.value),
                    })
                  }
                  onBlur={() => handleBlur("hipCircumference")}
                  className={`min-h-[44px] ${
                    touched.has("hipCircumference") && errors.hipCircumference
                      ? "border-destructive"
                      : selectedSize && selectedSize !== "custom" && !isModifiedFromPreset("hipCircumference")
                      ? "bg-accent/5 border-accent/30"
                      : ""
                  }`}
                  aria-invalid={
                    touched.has("hipCircumference") && !!errors.hipCircumference
                  }
                  aria-describedby={
                    errors.hipCircumference
                      ? "hipCircumference-error"
                      : undefined
                  }
                />
                {touched.has("hipCircumference") && errors.hipCircumference && (
                  <p
                    id="hipCircumference-error"
                    className="text-xs text-destructive"
                    role="alert"
                  >
                    {errors.hipCircumference}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 5: AISANCE */}
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
