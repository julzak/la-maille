"use client";

import { cn } from "@/lib/utils";
import type { GarmentAnalysis } from "@/lib/types";

interface GarmentSchematicProps {
  analysis: GarmentAnalysis;
  className?: string;
  showUncertainty?: boolean;
}

/**
 * Get stroke color based on confidence level
 */
function getStrokeProps(confidence: number, showUncertainty: boolean) {
  if (!showUncertainty) {
    return { stroke: "#1a1a1a", strokeDasharray: undefined };
  }

  if (confidence >= 0.8) {
    return { stroke: "#1a1a1a", strokeDasharray: undefined };
  } else if (confidence >= 0.6) {
    return { stroke: "#666666", strokeDasharray: undefined };
  } else {
    return { stroke: "#f97316", strokeDasharray: "4 2" };
  }
}

/**
 * Generate neckline path based on type
 */
function getNecklinePath(
  type: string,
  confidence: number,
  showUncertainty: boolean
): { path: string; strokeProps: ReturnType<typeof getStrokeProps> } {
  const strokeProps = getStrokeProps(confidence, showUncertainty);

  switch (type) {
    case "col-v":
      // V-neck
      return {
        path: "M 70 50 L 100 75 L 130 50",
        strokeProps,
      };
    case "bateau":
      // Boat neck - wide horizontal
      return {
        path: "M 60 48 Q 100 52 140 48",
        strokeProps,
      };
    case "ouvert-cardigan":
      // Open cardigan neckline
      return {
        path: "M 70 50 Q 85 45 100 70 Q 115 45 130 50",
        strokeProps,
      };
    case "capuche":
      // Hood indication
      return {
        path: "M 70 50 Q 70 30 100 25 Q 130 30 130 50",
        strokeProps,
      };
    case "ras-du-cou":
    default:
      // Crew neck - small ellipse
      return {
        path: "M 70 50 Q 70 40 100 38 Q 130 40 130 50",
        strokeProps,
      };
  }
}

/**
 * Generate body path based on garment type
 */
function getBodyPath(type: string, fitStyle: string): string {
  // Adjust width based on fit
  const widthAdjust = fitStyle === "oversized" ? 10 : fitStyle === "ajuste" ? -5 : 0;
  const leftX = 40 - widthAdjust;
  const rightX = 160 + widthAdjust;

  // Cardigan has center split
  if (type === "cardigan") {
    return `
      M ${leftX} 60
      L ${leftX} 220
      Q ${leftX} 235 ${leftX + 15} 235
      L 95 235
      L 95 70
      M 105 70
      L 105 235
      L ${rightX - 15} 235
      Q ${rightX} 235 ${rightX} 220
      L ${rightX} 60
    `;
  }

  // Gilet (vest) - same as pull but sleeveless shape handled in sleeves
  // Pull / regular sweater
  return `
    M ${leftX} 60
    L ${leftX} 220
    Q ${leftX} 235 ${leftX + 15} 235
    L ${rightX - 15} 235
    Q ${rightX} 235 ${rightX} 220
    L ${rightX} 60
  `;
}

/**
 * Generate shoulder path
 */
function getShoulderPath(sleeveType: string, fitStyle: string): string {
  const widthAdjust = fitStyle === "oversized" ? 10 : fitStyle === "ajuste" ? -5 : 0;
  const leftX = 40 - widthAdjust;
  const rightX = 160 + widthAdjust;

  if (sleeveType === "raglan") {
    // Raglan - diagonal lines from neckline
    return `M ${leftX} 60 L 70 50 M 130 50 L ${rightX} 60`;
  }

  // Regular shoulders
  return `M ${leftX} 60 L 70 50 L 130 50 L ${rightX} 60`;
}

/**
 * Generate sleeve paths based on type and length
 */
function getSleevePaths(
  sleeveType: string,
  sleeveLength: string,
  fitStyle: string,
  confidence: number,
  showUncertainty: boolean
): { left: string; right: string; strokeProps: ReturnType<typeof getStrokeProps> } {
  const strokeProps = getStrokeProps(confidence, showUncertainty);
  const widthAdjust = fitStyle === "oversized" ? 10 : fitStyle === "ajuste" ? -5 : 0;
  const leftX = 40 - widthAdjust;
  const rightX = 160 + widthAdjust;

  // Determine sleeve end Y based on length
  let sleeveEndY = 180; // longues (full length)
  if (sleeveLength === "courtes") sleeveEndY = 100;
  else if (sleeveLength === "3-4") sleeveEndY = 140;
  else if (sleeveLength === "sans") {
    // Sleeveless - just show armhole curves
    return {
      left: `M ${leftX} 60 Q ${leftX - 5} 80 ${leftX} 100`,
      right: `M ${rightX} 60 Q ${rightX + 5} 80 ${rightX} 100`,
      strokeProps,
    };
  }

  if (sleeveType === "raglan") {
    // Raglan sleeves - attached at diagonal
    return {
      left: `M ${leftX} 60 L ${leftX - 25} 70 L ${leftX - 30} ${sleeveEndY} L ${leftX - 5} ${sleeveEndY + 5} L ${leftX} 100`,
      right: `M ${rightX} 60 L ${rightX + 25} 70 L ${rightX + 30} ${sleeveEndY} L ${rightX + 5} ${sleeveEndY + 5} L ${rightX} 100`,
      strokeProps,
    };
  }

  if (sleeveType === "marteau") {
    // Drop shoulder / hammer sleeves - wider at top
    return {
      left: `M ${leftX} 60 L ${leftX - 30} 65 L ${leftX - 35} ${sleeveEndY} L ${leftX - 10} ${sleeveEndY + 5} L ${leftX} 100`,
      right: `M ${rightX} 60 L ${rightX + 30} 65 L ${rightX + 35} ${sleeveEndY} L ${rightX + 10} ${sleeveEndY + 5} L ${rightX} 100`,
      strokeProps,
    };
  }

  // Set-in sleeves (montees) - default
  return {
    left: `M ${leftX} 60 L ${leftX - 20} 70 L ${leftX - 25} ${sleeveEndY} L ${leftX - 5} ${sleeveEndY + 5} L ${leftX} 100`,
    right: `M ${rightX} 60 L ${rightX + 20} 70 L ${rightX + 25} ${sleeveEndY} L ${rightX + 5} ${sleeveEndY + 5} L ${rightX} 100`,
    strokeProps,
  };
}

/**
 * Generate button indicators for cardigan
 */
function getButtonIndicators(
  closureType: string,
  buttonCount: number | null
): JSX.Element[] {
  if (closureType !== "boutons") return [];

  const count = buttonCount || 5;
  const buttons: JSX.Element[] = [];
  const startY = 85;
  const endY = 215;
  const spacing = (endY - startY) / (count + 1);

  for (let i = 1; i <= count; i++) {
    const y = startY + spacing * i;
    buttons.push(
      <circle
        key={`button-${i}`}
        cx="100"
        cy={y}
        r="4"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="1.5"
      />
    );
  }

  return buttons;
}

export function GarmentSchematic({
  analysis,
  className,
  showUncertainty = true,
}: GarmentSchematicProps) {
  const { garment, neckline, sleeves, fit, closure } = analysis;

  // Get all path data
  const necklineData = getNecklinePath(neckline.type, neckline.confidence, showUncertainty);
  const bodyPath = getBodyPath(garment.type, fit.style);
  const shoulderPath = getShoulderPath(sleeves.type, fit.style);
  const sleeveData = getSleevePaths(
    sleeves.type,
    sleeves.length,
    fit.style,
    sleeves.confidence,
    showUncertainty
  );
  const buttons = getButtonIndicators(closure.type, closure.buttonCountEstimate);

  // Body stroke props based on garment type confidence
  const bodyStrokeProps = getStrokeProps(garment.confidence, showUncertainty);

  return (
    <svg
      viewBox="0 0 200 250"
      className={cn("w-full h-full max-w-[200px]", className)}
      aria-label={`Schematic of ${garment.type}`}
    >
      {/* Background */}
      <rect x="0" y="0" width="200" height="250" fill="transparent" />

      {/* Body */}
      <path
        d={bodyPath}
        fill="none"
        stroke={bodyStrokeProps.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={bodyStrokeProps.strokeDasharray}
      />

      {/* Shoulders */}
      <path
        d={shoulderPath}
        fill="none"
        stroke={bodyStrokeProps.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={bodyStrokeProps.strokeDasharray}
      />

      {/* Neckline */}
      <path
        d={necklineData.path}
        fill="none"
        stroke={necklineData.strokeProps.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={necklineData.strokeProps.strokeDasharray}
      />

      {/* Sleeves */}
      {sleeves.type !== "sans-manches" && (
        <>
          <path
            d={sleeveData.left}
            fill="none"
            stroke={sleeveData.strokeProps.stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={sleeveData.strokeProps.strokeDasharray}
          />
          <path
            d={sleeveData.right}
            fill="none"
            stroke={sleeveData.strokeProps.stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={sleeveData.strokeProps.strokeDasharray}
          />
        </>
      )}

      {/* Buttons for cardigan */}
      {garment.type === "cardigan" && buttons}

      {/* Center line for cardigan */}
      {garment.type === "cardigan" && (
        <line
          x1="100"
          y1="70"
          x2="100"
          y2="235"
          stroke="#1a1a1a"
          strokeWidth="1"
          strokeDasharray="4 3"
          opacity="0.5"
        />
      )}

      {/* Uncertainty indicators */}
      {showUncertainty && neckline.confidence < 0.6 && (
        <text x="175" y="55" fontSize="14" fill="#f97316" fontWeight="bold">
          ?
        </text>
      )}
      {showUncertainty && sleeves.confidence < 0.6 && (
        <>
          <text x="5" y="120" fontSize="14" fill="#f97316" fontWeight="bold">
            ?
          </text>
          <text x="185" y="120" fontSize="14" fill="#f97316" fontWeight="bold">
            ?
          </text>
        </>
      )}
    </svg>
  );
}

export default GarmentSchematic;
