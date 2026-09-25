"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n";
import type { HatMeasurements } from "@/lib/types";

// Bornes de saisie : du tour de tête naissance au XL adulte de la table de tailles, avec marge.
export const HAT_LIMITS = {
  headCircumference: { min: 30, max: 70 },
  hatHeight: { min: 8, max: 40 },
  brimHeight: { min: 0, max: 12 },
  ease: { min: 0, max: 20 },
} as const;

export function isHatMeasurementsValid(m: HatMeasurements): boolean {
  return (Object.keys(HAT_LIMITS) as (keyof typeof HAT_LIMITS)[]).every(
    (k) => m[k] >= HAT_LIMITS[k].min && m[k] <= HAT_LIMITS[k].max
  ) && m.brimHeight < m.hatHeight;
}

interface HatMeasurementsSectionProps {
  measurements: HatMeasurements;
  onChange: (m: HatMeasurements) => void;
}

export function HatMeasurementsSection({ measurements, onChange }: HatMeasurementsSectionProps) {
  const { t } = useTranslation();
  const fields = [
    { key: "headCircumference", label: t("hatHeadCircumference"), help: t("hatHeadHelp"), step: 0.5 },
    { key: "hatHeight", label: t("hatHeight"), help: t("hatHeightHelp"), step: 0.5 },
    { key: "brimHeight", label: t("hatBrimHeight"), help: t("hatBrimHelp"), step: 0.5 },
    { key: "ease", label: t("hatEase"), help: t("hatEaseHelp"), step: 1 },
  ] as const;

  return (
    <Card>
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="text-base md:text-lg">{t("hatMeasurementsTitle")}</CardTitle>
        <CardDescription className="text-xs">{t("hatSizeSource")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {fields.map(({ key, label, help, step }) => {
            const value = measurements[key];
            const { min, max } = HAT_LIMITS[key];
            const invalid = value < min || value > max || (key === "brimHeight" && value >= measurements.hatHeight);
            return (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={`hat-${key}`} className="text-xs md:text-sm font-medium">
                  {label}
                </Label>
                <Input
                  id={`hat-${key}`}
                  type="number"
                  inputMode="decimal"
                  step={step}
                  min={min}
                  max={max}
                  value={value}
                  onChange={(e) => onChange({ ...measurements, [key]: Number(e.target.value) })}
                  aria-invalid={invalid}
                  aria-describedby={`hat-${key}-help`}
                  className={invalid ? "border-destructive" : undefined}
                />
                <p id={`hat-${key}-help`} className="text-xs text-muted-foreground">
                  {help}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
