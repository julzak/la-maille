"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import {
  calculateYarnStatus,
  applyAdjustments,
  type YarnStock,
  type YarnAdjustment,
} from "@/lib/yarn-calculator";
import type { Measurements, Gauge } from "@/lib/types";

interface YarnCalculatorProps {
  measurements: Measurements;
  gauge: Gauge;
  garmentType: string;
  hasLongSleeves?: boolean;
  onMeasurementsChange?: (measurements: Measurements) => void;
  compact?: boolean; // For pattern page display
  initialStock?: YarnStock | null;
  onStockChange?: (stock: YarnStock | null) => void;
}

export function YarnCalculator({
  measurements,
  gauge,
  garmentType,
  hasLongSleeves = true,
  onMeasurementsChange,
  compact = false,
  initialStock = null,
  onStockChange,
}: YarnCalculatorProps) {
  const { t } = useTranslation();

  // State
  const [hasYarn, setHasYarn] = useState(initialStock !== null);
  const [skeinCount, setSkeinCount] = useState(initialStock?.skeinCount || 5);
  const [metersPerSkein, setMetersPerSkein] = useState(initialStock?.metersPerSkein || 100);
  const [selectedAdjustments, setSelectedAdjustments] = useState<string[]>([]);
  const [appliedAdjustments, setAppliedAdjustments] = useState<YarnAdjustment[]>([]);

  // Memoize yarnStock to prevent infinite loops
  const yarnStock = useMemo<YarnStock | null>(
    () => (hasYarn ? { skeinCount, metersPerSkein } : null),
    [hasYarn, skeinCount, metersPerSkein]
  );

  // Calculate yarn status
  const result = useMemo(
    () => calculateYarnStatus(measurements, gauge, garmentType, yarnStock, hasLongSleeves),
    [measurements, gauge, garmentType, yarnStock, hasLongSleeves]
  );

  const totalMeters = hasYarn ? skeinCount * metersPerSkein : 0;

  // Notify parent of stock changes - use ref to avoid dependency on callback
  const onStockChangeRef = useRef(onStockChange);
  onStockChangeRef.current = onStockChange;

  useEffect(() => {
    onStockChangeRef.current?.(yarnStock);
  }, [yarnStock]);

  // Toggle adjustment selection
  const toggleAdjustment = (id: string) => {
    setSelectedAdjustments((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Apply selected adjustments
  const handleApplyAdjustments = () => {
    const adjustmentsToApply = result.adjustments.filter((a) =>
      selectedAdjustments.includes(a.id)
    );

    if (adjustmentsToApply.length > 0 && onMeasurementsChange) {
      const newMeasurements = applyAdjustments(measurements, adjustmentsToApply);
      onMeasurementsChange(newMeasurements);
      setAppliedAdjustments(adjustmentsToApply);
      setSelectedAdjustments([]);
    }
  };

  // Get adjustment label
  const getAdjustmentLabel = (adj: YarnAdjustment): string => {
    switch (adj.type) {
      case "body_length":
        return t("adjustBodyLength").replace("{0}", String(adj.reduction)).replace("{1}", String(adj.metersSaved));
      case "sleeve_length":
        return t("adjustSleeveLength").replace("{0}", String(adj.reduction)).replace("{1}", String(adj.metersSaved));
      case "ease":
        return t("adjustEase").replace("{0}", String(adj.reduction)).replace("{1}", String(adj.metersSaved));
      default:
        return "";
    }
  };

  // Status icon and color
  const getStatusDisplay = () => {
    switch (result.status) {
      case "sufficient":
        return { icon: "✅", color: "text-green-600", bgColor: "bg-green-50 border-green-200" };
      case "tight":
        return { icon: "⚠️", color: "text-yellow-600", bgColor: "bg-yellow-50 border-yellow-200" };
      case "insufficient":
        return { icon: "❌", color: "text-red-600", bgColor: "bg-red-50 border-red-200" };
    }
  };

  const statusDisplay = getStatusDisplay();

  // Compact display for pattern page
  if (compact) {
    return (
      <div className="space-y-3">
        {/* Yarn estimate */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("yarnNeeded")}</span>
          <span className="font-mono font-medium">
            {result.needed.min}-{result.needed.max}m
          </span>
        </div>

        {/* User stock if provided */}
        {hasYarn && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("yourYarnStock")}</span>
              <span className="font-mono font-medium">{totalMeters}m</span>
            </div>

            {/* Status */}
            <div className={cn("p-3 rounded-lg border", statusDisplay.bgColor)}>
              <p className={cn("font-medium flex items-center gap-2", statusDisplay.color)}>
                <span>{statusDisplay.icon}</span>
                {result.status === "sufficient" && t("yarnSufficient")}
                {result.status === "tight" && t("yarnTight")}
                {result.status === "insufficient" && t("yarnInsufficient").replace("{0}", String(result.shortage))}
              </p>
            </div>
          </>
        )}

        {/* Applied adjustments */}
        {appliedAdjustments.length > 0 && (
          <Alert className="border-accent bg-accent/10">
            <AlertDescription>
              <p className="font-medium text-sm mb-1">{t("patternAdjustedForYarn")}</p>
              <ul className="text-xs text-muted-foreground">
                {appliedAdjustments.map((adj) => (
                  <li key={adj.id}>• {getAdjustmentLabel(adj)}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Full calculator display for form
  return (
    <Card>
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="text-base md:text-lg">{t("yarnCalculator")}</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {t("yarnCalculatorDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Choice: know or don't know */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <input
              type="radio"
              name="hasYarn"
              checked={!hasYarn}
              onChange={() => setHasYarn(false)}
              className="w-4 h-4 accent-accent"
            />
            <div>
              <span className="font-medium text-sm">{t("dontKnowYetYarn")}</span>
              <p className="text-xs text-muted-foreground">{t("standardEstimate")}</p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <input
              type="radio"
              name="hasYarn"
              checked={hasYarn}
              onChange={() => setHasYarn(true)}
              className="w-4 h-4 accent-accent mt-1"
            />
            <div className="flex-1">
              <span className="font-medium text-sm">{t("haveMyYarn")}</span>

              {hasYarn && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="skeinCount" className="text-xs">
                        {t("numberOfSkeins")}
                      </Label>
                      <Input
                        id="skeinCount"
                        type="number"
                        min={1}
                        max={50}
                        value={skeinCount}
                        onChange={(e) => setSkeinCount(Math.max(1, Number(e.target.value)))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="metersPerSkein" className="text-xs">
                        {t("metersPerSkein")}
                      </Label>
                      <Input
                        id="metersPerSkein"
                        type="number"
                        min={10}
                        max={1000}
                        value={metersPerSkein}
                        onChange={(e) => setMetersPerSkein(Math.max(10, Number(e.target.value)))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="text-center p-2 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">= </span>
                    <span className="text-lg font-bold font-mono">{totalMeters}</span>
                    <span className="text-sm text-muted-foreground">m {t("total")}</span>
                  </div>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Estimate display */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">{t("estimatedYarnNeeded")}</p>
          <p className="text-xl font-bold font-mono">
            {result.needed.min}-{result.needed.max}
            <span className="text-sm font-normal text-muted-foreground ml-1">m</span>
          </p>
        </div>

        {/* Status result */}
        {hasYarn && (
          <div className={cn("p-4 rounded-lg border", statusDisplay.bgColor)}>
            <p className={cn("font-medium flex items-center gap-2", statusDisplay.color)}>
              <span className="text-xl">{statusDisplay.icon}</span>
              <span>
                {result.status === "sufficient" && t("yarnSufficientFull").replace("{0}", `${result.needed.min}-${result.needed.max}`)}
                {result.status === "tight" && t("yarnTightFull")}
                {result.status === "insufficient" && t("yarnInsufficientFull").replace("{0}", String(result.shortage))}
              </span>
            </p>

            {/* Suggestions for insufficient yarn */}
            {result.status === "insufficient" && result.adjustments.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium">{t("suggestionsToAdjust")}</p>
                <div className="space-y-2">
                  {result.adjustments.map((adj) => (
                    <label
                      key={adj.id}
                      className="flex items-start gap-3 cursor-pointer p-2 rounded bg-white/50 hover:bg-white/80 transition-colors"
                    >
                      <Checkbox
                        checked={selectedAdjustments.includes(adj.id)}
                        onCheckedChange={() => toggleAdjustment(adj.id)}
                        className="mt-0.5"
                      />
                      <span className="text-sm">{getAdjustmentLabel(adj)}</span>
                    </label>
                  ))}
                </div>

                {selectedAdjustments.length > 0 && (
                  <Button
                    onClick={handleApplyAdjustments}
                    className="w-full bg-accent hover:bg-accent/90"
                  >
                    {t("applyAdjustments")}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Applied adjustments notification */}
        {appliedAdjustments.length > 0 && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription>
              <p className="font-medium text-green-700 flex items-center gap-2">
                <span>✓</span> {t("adjustmentsApplied")}
              </p>
              <ul className="text-xs text-green-600 mt-1">
                {appliedAdjustments.map((adj) => (
                  <li key={adj.id}>• {getAdjustmentLabel(adj)}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Educational message */}
        <p className="text-xs text-muted-foreground italic border-t pt-3">
          {t("yarnEstimateDisclaimer")}
        </p>
      </CardContent>
    </Card>
  );
}
