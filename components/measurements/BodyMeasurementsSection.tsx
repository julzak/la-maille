"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n";
import { SIZE_PRESETS, SIZE_ORDER, hasSignificantChange, type SizeKey } from "@/lib/size-presets";
import type { Measurements } from "@/lib/types";

interface MeasurementErrors {
  chestCircumference?: string;
  bodyLength?: string;
  shoulderWidth?: string;
  armLength?: string;
  wristCircumference?: string;
  bicepCircumference?: string;
  hipCircumference?: string;
}

interface BodyMeasurementsSectionProps {
  measurements: Measurements;
  onChange: (measurements: Measurements) => void;
  selectedSize: SizeKey | "custom" | null;
  onSizeSelect: (size: SizeKey | "custom") => void;
  errors: MeasurementErrors;
  touched: Set<string>;
  onBlur: (field: string) => void;
}

export function BodyMeasurementsSection({
  measurements,
  onChange,
  selectedSize,
  onSizeSelect,
  errors,
  touched,
  onBlur,
}: BodyMeasurementsSectionProps) {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  // Check if a measurement has been modified from preset
  const isModifiedFromPreset = (field: keyof typeof SIZE_PRESETS.M.measurements): boolean => {
    if (!selectedSize || selectedSize === "custom") return false;
    const preset = SIZE_PRESETS[selectedSize];
    if (!preset) return false;
    const currentValue = measurements[field];
    if (currentValue === undefined) return false;
    return hasSignificantChange(currentValue, preset.measurements[field], 5);
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

  const getEaseLabel = (ease: number) => {
    if (ease <= 5) return t("fitted");
    if (ease <= 10) return t("regular");
    return t("oversized");
  };

  const getInputClassName = (field: keyof typeof SIZE_PRESETS.M.measurements, hasError: boolean) => {
    if (hasError) return "min-h-[44px] border-destructive";
    if (selectedSize && selectedSize !== "custom" && !isModifiedFromPreset(field)) {
      return "min-h-[44px] bg-accent/5 border-accent/30";
    }
    return "min-h-[44px]";
  };

  const finishedChest = measurements.chestCircumference + measurements.ease;

  return (
    <>
      {/* SIZE SELECTION - Always visible */}
      <Card>
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-base md:text-lg">{t("chooseYourSize")}</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {t("startFromStandardSize")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Size buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            {SIZE_ORDER.map((size) => (
              <Button
                key={size}
                type="button"
                variant={selectedSize === size ? "default" : "outline"}
                size="lg"
                onClick={() => onSizeSelect(size)}
                className={`min-w-[56px] text-lg font-medium ${
                  selectedSize === size ? "bg-accent hover:bg-accent/90" : ""
                }`}
              >
                {size}
              </Button>
            ))}
          </div>

          {/* Selected size summary */}
          {selectedSize && selectedSize !== "custom" && (
            <div className="text-center space-y-1 pt-2">
              <p className="text-sm text-muted-foreground">
                {t("basedOnSize")} <span className="font-semibold text-foreground">{selectedSize}</span>
                {hasAnyModification() && (
                  <span className="ml-2 text-accent">{t("modified")}</span>
                )}
              </p>
              <p className="text-lg font-medium">
                {t("finishedChest")} : <span className="text-accent">{finishedChest} cm</span>
              </p>
            </div>
          )}

          {/* EASE SLIDER - Always visible */}
          <div className="pt-4 border-t space-y-3">
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
              onValueChange={([value]) => onChange({ ...measurements, ease: value })}
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

          {/* TOGGLE FOR DETAILED MEASUREMENTS */}
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-center gap-2 text-muted-foreground hover:text-foreground"
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    {t("hideDetails")}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    {t("customizeMeasurements")}
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="pt-4 space-y-4">
              {/* Detailed measurements header */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("detailedMeasurements")}
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="text-xs md:text-sm text-accent hover:underline"
                    >
                      {t("howToMeasure")}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{t("measurementGuide")}</DialogTitle>
                      <DialogDescription>{t("measurementGuideDesc")}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="font-medium">{t("chestCircumference")}</p>
                        <p className="text-muted-foreground">{t("chestMeasureDesc")}</p>
                      </div>
                      <div>
                        <p className="font-medium">{t("bodyLength")}</p>
                        <p className="text-muted-foreground">{t("bodyLengthMeasureDesc")}</p>
                      </div>
                      <div>
                        <p className="font-medium">{t("shoulderWidth")}</p>
                        <p className="text-muted-foreground">{t("shoulderWidthMeasureDesc")}</p>
                      </div>
                      <div>
                        <p className="font-medium">{t("armLength")}</p>
                        <p className="text-muted-foreground">{t("armLengthMeasureDesc")}</p>
                      </div>
                      <div>
                        <p className="font-medium">{t("wristCircumference")}</p>
                        <p className="text-muted-foreground">{t("wristMeasureDesc")}</p>
                      </div>
                      <div>
                        <p className="font-medium">{t("bicepCircumference")}</p>
                        <p className="text-muted-foreground">{t("bicepMeasureDesc")}</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Measurement inputs grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {/* Chest Circumference */}
                <div className="space-y-1.5">
                  <Label htmlFor="chestCircumference" className="text-xs md:text-sm font-medium">
                    {t("chestCircumference")} (cm)
                  </Label>
                  <Input
                    id="chestCircumference"
                    type="number"
                    inputMode="numeric"
                    value={measurements.chestCircumference}
                    onChange={(e) => onChange({ ...measurements, chestCircumference: Number(e.target.value) })}
                    onBlur={() => onBlur("chestCircumference")}
                    className={getInputClassName("chestCircumference", touched.has("chestCircumference") && !!errors.chestCircumference)}
                    aria-invalid={touched.has("chestCircumference") && !!errors.chestCircumference}
                    aria-describedby={errors.chestCircumference ? "chestCircumference-error" : undefined}
                  />
                  {touched.has("chestCircumference") && errors.chestCircumference && (
                    <p id="chestCircumference-error" className="text-xs text-destructive" role="alert">
                      {errors.chestCircumference}
                    </p>
                  )}
                </div>

                {/* Body Length */}
                <div className="space-y-1.5">
                  <Label htmlFor="bodyLength" className="text-xs md:text-sm font-medium">
                    {t("bodyLength")} (cm)
                  </Label>
                  <Input
                    id="bodyLength"
                    type="number"
                    inputMode="numeric"
                    value={measurements.bodyLength}
                    onChange={(e) => onChange({ ...measurements, bodyLength: Number(e.target.value) })}
                    onBlur={() => onBlur("bodyLength")}
                    className={getInputClassName("bodyLength", touched.has("bodyLength") && !!errors.bodyLength)}
                    aria-invalid={touched.has("bodyLength") && !!errors.bodyLength}
                    aria-describedby={errors.bodyLength ? "bodyLength-error" : undefined}
                  />
                  {touched.has("bodyLength") && errors.bodyLength && (
                    <p id="bodyLength-error" className="text-xs text-destructive" role="alert">
                      {errors.bodyLength}
                    </p>
                  )}
                </div>

                {/* Shoulder Width */}
                <div className="space-y-1.5">
                  <Label htmlFor="shoulderWidth" className="text-xs md:text-sm font-medium">
                    {t("shoulderWidth")} (cm)
                  </Label>
                  <Input
                    id="shoulderWidth"
                    type="number"
                    inputMode="numeric"
                    value={measurements.shoulderWidth}
                    onChange={(e) => onChange({ ...measurements, shoulderWidth: Number(e.target.value) })}
                    onBlur={() => onBlur("shoulderWidth")}
                    className={getInputClassName("shoulderWidth", touched.has("shoulderWidth") && !!errors.shoulderWidth)}
                    aria-invalid={touched.has("shoulderWidth") && !!errors.shoulderWidth}
                    aria-describedby={errors.shoulderWidth ? "shoulderWidth-error" : undefined}
                  />
                  {touched.has("shoulderWidth") && errors.shoulderWidth && (
                    <p id="shoulderWidth-error" className="text-xs text-destructive" role="alert">
                      {errors.shoulderWidth}
                    </p>
                  )}
                </div>

                {/* Arm Length */}
                <div className="space-y-1.5">
                  <Label htmlFor="armLength" className="text-xs md:text-sm font-medium">
                    {t("armLength")} (cm)
                  </Label>
                  <Input
                    id="armLength"
                    type="number"
                    inputMode="numeric"
                    value={measurements.armLength}
                    onChange={(e) => onChange({ ...measurements, armLength: Number(e.target.value) })}
                    onBlur={() => onBlur("armLength")}
                    className={getInputClassName("armLength", touched.has("armLength") && !!errors.armLength)}
                    aria-invalid={touched.has("armLength") && !!errors.armLength}
                    aria-describedby={errors.armLength ? "armLength-error" : undefined}
                  />
                  {touched.has("armLength") && errors.armLength && (
                    <p id="armLength-error" className="text-xs text-destructive" role="alert">
                      {errors.armLength}
                    </p>
                  )}
                </div>

                {/* Wrist Circumference */}
                <div className="space-y-1.5">
                  <Label htmlFor="wristCircumference" className="text-xs md:text-sm font-medium">
                    {t("wristCircumference")} (cm)
                  </Label>
                  <Input
                    id="wristCircumference"
                    type="number"
                    inputMode="numeric"
                    value={measurements.wristCircumference}
                    onChange={(e) => onChange({ ...measurements, wristCircumference: Number(e.target.value) })}
                    onBlur={() => onBlur("wristCircumference")}
                    className={getInputClassName("wristCircumference", touched.has("wristCircumference") && !!errors.wristCircumference)}
                    aria-invalid={touched.has("wristCircumference") && !!errors.wristCircumference}
                    aria-describedby={errors.wristCircumference ? "wristCircumference-error" : undefined}
                  />
                  {touched.has("wristCircumference") && errors.wristCircumference && (
                    <p id="wristCircumference-error" className="text-xs text-destructive" role="alert">
                      {errors.wristCircumference}
                    </p>
                  )}
                </div>

                {/* Bicep Circumference */}
                <div className="space-y-1.5">
                  <Label htmlFor="bicepCircumference" className="text-xs md:text-sm font-medium">
                    {t("bicepCircumference")} (cm)
                  </Label>
                  <Input
                    id="bicepCircumference"
                    type="number"
                    inputMode="numeric"
                    value={measurements.bicepCircumference}
                    onChange={(e) => onChange({ ...measurements, bicepCircumference: Number(e.target.value) })}
                    onBlur={() => onBlur("bicepCircumference")}
                    className={getInputClassName("bicepCircumference", touched.has("bicepCircumference") && !!errors.bicepCircumference)}
                    aria-invalid={touched.has("bicepCircumference") && !!errors.bicepCircumference}
                    aria-describedby={errors.bicepCircumference ? "bicepCircumference-error" : undefined}
                  />
                  {touched.has("bicepCircumference") && errors.bicepCircumference && (
                    <p id="bicepCircumference-error" className="text-xs text-destructive" role="alert">
                      {errors.bicepCircumference}
                    </p>
                  )}
                </div>

                {/* Hip Circumference */}
                <div className="space-y-1.5">
                  <Label htmlFor="hipCircumference" className="text-xs md:text-sm font-medium">
                    {t("hipCircumference")} (cm)
                  </Label>
                  <Input
                    id="hipCircumference"
                    type="number"
                    inputMode="numeric"
                    value={measurements.hipCircumference}
                    onChange={(e) => onChange({ ...measurements, hipCircumference: Number(e.target.value) })}
                    onBlur={() => onBlur("hipCircumference")}
                    className={getInputClassName("hipCircumference", touched.has("hipCircumference") && !!errors.hipCircumference)}
                    aria-invalid={touched.has("hipCircumference") && !!errors.hipCircumference}
                    aria-describedby={errors.hipCircumference ? "hipCircumference-error" : undefined}
                  />
                  {touched.has("hipCircumference") && errors.hipCircumference && (
                    <p id="hipCircumference-error" className="text-xs text-destructive" role="alert">
                      {errors.hipCircumference}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground italic text-center">
                {t("noNeedForPrecision")}
              </p>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </>
  );
}
