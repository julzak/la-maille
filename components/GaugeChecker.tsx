"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface GaugeCheckerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGaugeConfirmed?: () => void;
}

// Standard credit card dimensions in cm
const CREDIT_CARD_WIDTH_CM = 8.56;
const CREDIT_CARD_HEIGHT_CM = 5.398;

// Storage key for calibration
const CALIBRATION_KEY = "lamaille-screen-calibration";

/**
 * Calculate default pixels per cm based on device
 */
function getDefaultPixelsPerCm(): number {
  if (typeof window === "undefined") return 38; // ~96 DPI

  // Try to detect device type
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Base assumptions:
  // - Desktop: ~96 DPI (CSS pixels)
  // - Mobile: varies widely, but CSS pixels are normalized
  // 1 inch = 2.54 cm, so pixels per cm = DPI / 2.54

  if (isMobile) {
    // Mobile devices have varied physical DPIs but CSS normalizes
    // Typical range: 35-42 CSS pixels per cm
    return 38;
  } else {
    // Desktop: typically 96 DPI = ~37.8 px/cm
    return 37.8;
  }
}

/**
 * Load saved calibration from localStorage
 */
function loadCalibration(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(CALIBRATION_KEY);
    if (saved) {
      const value = parseFloat(saved);
      if (!isNaN(value) && value > 20 && value < 80) {
        return value;
      }
    }
  } catch {
    // Ignore errors
  }
  return null;
}

/**
 * Save calibration to localStorage
 */
function saveCalibration(pixelsPerCm: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CALIBRATION_KEY, String(pixelsPerCm));
  } catch {
    // Ignore errors
  }
}

export function GaugeChecker({ open, onOpenChange, onGaugeConfirmed }: GaugeCheckerProps) {
  const { t } = useTranslation();

  // State
  const [pixelsPerCm, setPixelsPerCm] = useState(getDefaultPixelsPerCm);
  const [showCalibration, setShowCalibration] = useState(false);
  const [calibrationValue, setCalibrationValue] = useState(getDefaultPixelsPerCm);
  const [result, setResult] = useState<"smaller" | "larger" | "correct" | null>(null);
  const [isCalibrated, setIsCalibrated] = useState(false);

  // Load saved calibration on mount
  useEffect(() => {
    const saved = loadCalibration();
    if (saved) {
      setPixelsPerCm(saved);
      setCalibrationValue(saved);
      setIsCalibrated(true);
    }
  }, []);

  // Calculate dimensions in pixels
  const squareSize = 10 * pixelsPerCm; // 10cm square
  const cardWidth = CREDIT_CARD_WIDTH_CM * calibrationValue;
  const cardHeight = CREDIT_CARD_HEIGHT_CM * calibrationValue;

  // Handle calibration save
  const handleSaveCalibration = () => {
    setPixelsPerCm(calibrationValue);
    saveCalibration(calibrationValue);
    setIsCalibrated(true);
    setShowCalibration(false);
  };

  // Handle result selection
  const handleResult = (res: "smaller" | "larger" | "correct") => {
    setResult(res);
    if (res === "correct" && onGaugeConfirmed) {
      onGaugeConfirmed();
    }
  };

  // Reset result when dialog opens
  useEffect(() => {
    if (open) {
      setResult(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("gaugeCheckerTitle")}</DialogTitle>
          <DialogDescription>
            {t("gaugeCheckerDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!showCalibration ? (
            <>
              {/* 10x10cm Square */}
              <div className="flex justify-center">
                <div
                  className="relative"
                  style={{
                    width: squareSize,
                    height: squareSize,
                  }}
                >
                  {/* Main square with dashed border */}
                  <svg
                    width={squareSize}
                    height={squareSize}
                    viewBox={`0 0 ${squareSize} ${squareSize}`}
                    className="border-0"
                  >
                    {/* Background */}
                    <rect
                      x="0"
                      y="0"
                      width={squareSize}
                      height={squareSize}
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="8 4"
                      className="text-accent"
                    />

                    {/* Internal grid (1cm squares) */}
                    {Array.from({ length: 9 }).map((_, i) => (
                      <g key={i}>
                        {/* Vertical lines */}
                        <line
                          x1={(i + 1) * pixelsPerCm}
                          y1="0"
                          x2={(i + 1) * pixelsPerCm}
                          y2={squareSize}
                          stroke="currentColor"
                          strokeWidth="0.5"
                          strokeOpacity="0.2"
                          className="text-muted-foreground"
                        />
                        {/* Horizontal lines */}
                        <line
                          x1="0"
                          y1={(i + 1) * pixelsPerCm}
                          x2={squareSize}
                          y2={(i + 1) * pixelsPerCm}
                          stroke="currentColor"
                          strokeWidth="0.5"
                          strokeOpacity="0.2"
                          className="text-muted-foreground"
                        />
                      </g>
                    ))}

                    {/* 5cm mark lines (more visible) */}
                    <line
                      x1={5 * pixelsPerCm}
                      y1="0"
                      x2={5 * pixelsPerCm}
                      y2={squareSize}
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeOpacity="0.4"
                      className="text-muted-foreground"
                    />
                    <line
                      x1="0"
                      y1={5 * pixelsPerCm}
                      x2={squareSize}
                      y2={5 * pixelsPerCm}
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeOpacity="0.4"
                      className="text-muted-foreground"
                    />

                    {/* "10 cm" labels */}
                    <text
                      x={squareSize / 2}
                      y="-8"
                      textAnchor="middle"
                      className="fill-current text-muted-foreground"
                      fontSize="12"
                    >
                      10 cm
                    </text>
                    <text
                      x="-8"
                      y={squareSize / 2}
                      textAnchor="middle"
                      className="fill-current text-muted-foreground"
                      fontSize="12"
                      transform={`rotate(-90, -8, ${squareSize / 2})`}
                    >
                      10 cm
                    </text>
                  </svg>

                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-accent" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-accent" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-accent" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-accent" />
                </div>
              </div>

              {/* Instructions */}
              <p className="text-center text-sm text-muted-foreground">
                {t("gaugeCheckerInstructions")}
              </p>

              {/* Result buttons */}
              {!result && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => handleResult("smaller")}
                  >
                    <span className="text-lg mr-3">📏</span>
                    <span>{t("swatchSmaller")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => handleResult("larger")}
                  >
                    <span className="text-lg mr-3">📐</span>
                    <span>{t("swatchLarger")}</span>
                  </Button>
                  <Button
                    variant="default"
                    className="w-full justify-start text-left h-auto py-3 bg-green-600 hover:bg-green-700"
                    onClick={() => handleResult("correct")}
                  >
                    <span className="text-lg mr-3">✓</span>
                    <span>{t("swatchCorrect")}</span>
                  </Button>
                </div>
              )}

              {/* Result feedback */}
              {result && (
                <Alert
                  className={cn(
                    result === "correct" && "border-green-500 bg-green-50",
                    result === "smaller" && "border-orange-500 bg-orange-50",
                    result === "larger" && "border-blue-500 bg-blue-50"
                  )}
                >
                  <AlertDescription>
                    {result === "correct" && (
                      <div className="text-green-700">
                        <p className="font-medium flex items-center gap-2">
                          <span>✅</span> {t("gaugeCorrectTitle")}
                        </p>
                        <p className="text-sm mt-1">{t("gaugeCorrectDesc")}</p>
                      </div>
                    )}
                    {result === "smaller" && (
                      <div className="text-orange-700">
                        <p className="font-medium flex items-center gap-2">
                          <span>⚠️</span> {t("gaugeTighterTitle")}
                        </p>
                        <p className="text-sm mt-1">{t("gaugeTighterDesc")}</p>
                      </div>
                    )}
                    {result === "larger" && (
                      <div className="text-blue-700">
                        <p className="font-medium flex items-center gap-2">
                          <span>💡</span> {t("gaugeLooserTitle")}
                        </p>
                        <p className="text-sm mt-1">{t("gaugeLooserDesc")}</p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {result && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setResult(null)}
                  >
                    {t("checkAgain")}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => onOpenChange(false)}
                  >
                    {t("close")}
                  </Button>
                </div>
              )}

              {/* Calibration link */}
              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowCalibration(true)}
                  className="text-sm text-muted-foreground hover:text-foreground underline decoration-dotted"
                >
                  {isCalibrated ? t("recalibrateScreen") : t("calibrateScreen")}
                </button>
                {isCalibrated && (
                  <span className="text-xs text-green-600 ml-2">✓ {t("calibrated")}</span>
                )}
              </div>

              {/* Educational note */}
              <p className="text-xs text-muted-foreground italic border-t pt-3">
                {t("swatchNote")}
              </p>
            </>
          ) : (
            <>
              {/* Calibration mode */}
              <div className="space-y-4">
                <p className="text-sm">{t("calibrationInstructions")}</p>

                {/* Credit card outline */}
                <div className="flex justify-center">
                  <div
                    className="relative border-2 border-dashed border-accent rounded-lg flex items-center justify-center"
                    style={{
                      width: cardWidth,
                      height: cardHeight,
                    }}
                  >
                    <span className="text-xs text-muted-foreground">
                      {t("creditCard")}
                    </span>

                    {/* Corner markers */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-accent rounded-tl" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-accent rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-accent rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-accent rounded-br" />
                  </div>
                </div>

                <p className="text-sm text-center text-muted-foreground">
                  {t("calibrationAdjust")}
                </p>

                {/* Adjustment slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t("smaller")}</span>
                    <span>{t("larger")}</span>
                  </div>
                  <Slider
                    value={[calibrationValue]}
                    onValueChange={([value]) => setCalibrationValue(value)}
                    min={25}
                    max={55}
                    step={0.5}
                    className="touch-manipulation"
                  />
                  <p className="text-center text-xs text-muted-foreground">
                    {calibrationValue.toFixed(1)} px/cm
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setCalibrationValue(pixelsPerCm);
                      setShowCalibration(false);
                    }}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    className="flex-1 bg-accent hover:bg-accent/90"
                    onClick={handleSaveCalibration}
                  >
                    {t("saveCalibration")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
