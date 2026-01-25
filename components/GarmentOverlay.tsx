"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { GarmentSchematic } from "@/components/GarmentSchematic";
import type { GarmentAnalysis } from "@/lib/types";

interface GarmentOverlayProps {
  imageUrl: string;
  analysis: GarmentAnalysis;
  onConfirm: () => void;
  onReject: () => void;
}

type RejectionReason = "neckline" | "sleeves" | "shape" | "type";

/**
 * Get confidence display based on overall confidence level
 */
function getConfidenceDisplay(
  overallConfidence: string,
  t: ReturnType<typeof useTranslation>["t"]
) {
  switch (overallConfidence) {
    case "high":
      return {
        label: t("confidenceHigh"),
        variant: "default" as const,
        className: "bg-green-600 hover:bg-green-600",
      };
    case "medium":
      return {
        label: t("confidenceMedium"),
        variant: "secondary" as const,
        className: "bg-orange-500 text-white hover:bg-orange-500",
      };
    case "low":
    case "insufficient":
      return {
        label: t("confidenceLow"),
        variant: "destructive" as const,
        className: "",
      };
    default:
      return {
        label: t("confidenceMedium"),
        variant: "secondary" as const,
        className: "",
      };
  }
}

/**
 * Get confidence indicator for individual analysis items
 */
function getItemConfidenceIndicator(confidence: number) {
  if (confidence >= 0.8) {
    return { color: "bg-green-500", textColor: "text-green-700" };
  } else if (confidence >= 0.6) {
    return { color: "bg-orange-400", textColor: "text-orange-700" };
  } else {
    return { color: "bg-red-400", textColor: "text-red-700" };
  }
}

export function GarmentOverlay({
  imageUrl,
  analysis,
  onConfirm,
  onReject,
}: GarmentOverlayProps) {
  const { t } = useTranslation();
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState<RejectionReason[]>([]);

  const handleReject = () => {
    setShowRejectionForm(true);
  };

  const handleRejectConfirm = () => {
    onReject();
  };

  const toggleReason = (reason: RejectionReason) => {
    setRejectionReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const confidenceDisplay = getConfidenceDisplay(analysis.overallConfidence, t);

  // Analysis items for the legend
  const analysisItems = [
    {
      label: t("neckline"),
      value: t(`neckline.${analysis.neckline.type}` as const),
      confidence: analysis.neckline.confidence,
    },
    {
      label: t("sleeves"),
      value: `${t(`sleeve.${analysis.sleeves.type}` as const)} - ${t(`sleeve-length.${analysis.sleeves.length}` as const)}`,
      confidence: analysis.sleeves.confidence,
    },
    {
      label: t("construction"),
      value: t(`construction.${analysis.construction.method}` as const),
      confidence: analysis.construction.confidence,
    },
    {
      label: t("fit"),
      value: t(`fit.${analysis.fit.style}` as const),
      confidence: analysis.fit.confidence,
    },
  ];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 md:p-6">
        {/* Confidence badge */}
        <div className="flex justify-end mb-4">
          <Badge className={cn("text-xs", confidenceDisplay.className)}>
            {confidenceDisplay.label}
          </Badge>
        </div>

        {/* Side-by-side layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column: Photo */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">{t("yourPhoto")}</p>
            <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
              <Image
                src={imageUrl}
                alt="Uploaded garment"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Right column: Schematic */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">{t("whatIUnderstood")}</p>
            <div className="bg-white border rounded-lg p-4 aspect-[3/4] flex items-center justify-center">
              <GarmentSchematic
                analysis={analysis}
                showUncertainty={true}
              />
            </div>

            {/* Legend under schematic */}
            <div className="mt-4 space-y-2">
              {analysisItems.map((item, index) => {
                const indicator = getItemConfidenceIndicator(item.confidence);
                return (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span
                      className={cn("w-2.5 h-2.5 rounded-full shrink-0", indicator.color)}
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground">{item.label} :</span>
                    <span className={cn("font-medium", item.confidence < 0.6 && indicator.textColor)}>
                      {item.value}
                      {item.confidence < 0.6 && (
                        <span className="ml-1 text-orange-500">?</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Confirmation UI */}
        <div className="mt-6 pt-4 border-t">
          {!showRejectionForm ? (
            <>
              <p className="text-center font-medium mb-4">
                {t("doesThisMatchYourGarment")}
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={onConfirm}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {t("yesConfirm")}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  {t("noTryAgain")}
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-center font-medium mb-4">
                {t("whatDoesNotMatch")}
              </p>
              <div className="space-y-3 max-w-sm mx-auto">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={rejectionReasons.includes("neckline")}
                    onCheckedChange={() => toggleReason("neckline")}
                  />
                  <span className="text-sm">{t("necklineIssue")}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={rejectionReasons.includes("sleeves")}
                    onCheckedChange={() => toggleReason("sleeves")}
                  />
                  <span className="text-sm">{t("sleevesIssue")}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={rejectionReasons.includes("shape")}
                    onCheckedChange={() => toggleReason("shape")}
                  />
                  <span className="text-sm">{t("shapeIssue")}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={rejectionReasons.includes("type")}
                    onCheckedChange={() => toggleReason("type")}
                  />
                  <span className="text-sm">
                    {analysis.garment.type === "cardigan"
                      ? t("isNotCardigan")
                      : t("isCardigan")}
                  </span>
                </label>
              </div>
              <div className="flex gap-3 justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectionForm(false)}
                >
                  {t("back")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRejectConfirm}
                >
                  {t("tryWithAnotherPhoto")}
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default GarmentOverlay;
