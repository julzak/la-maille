"use client";

import { Svg, Path, Rect, Line, Text, G } from "@react-pdf/renderer";
import type { Gauge } from "@/lib/types";

interface Dimensions {
  width: number;
  length: number;
  armholeDepth?: number;
  shoulderWidth?: number;
  necklineWidth?: number;
  necklineDepth?: number;
  sleeveTopWidth?: number;
  sleeveCuffWidth?: number;
}

interface SchematicPDFProps {
  piece: "back" | "front" | "sleeve" | "cardigan-front";
  dimensions: Dimensions;
  showMeasurements?: boolean;
}

// Constants for drawing
const SCALE = 3;
const MARGIN = 30;
const STROKE_WIDTH = 1;
const FONT_SIZE = 8;

export function SchematicPDF({
  piece,
  dimensions,
  showMeasurements = true,
}: SchematicPDFProps) {
  const width = dimensions.width * SCALE;
  const length = dimensions.length * SCALE;
  const viewBoxWidth = width + MARGIN * 2;
  const viewBoxHeight = length + MARGIN * 2;
  const startX = MARGIN;
  const startY = MARGIN;

  return (
    <Svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} style={{ width: 150, height: 180 }}>
      <Rect x="0" y="0" width={viewBoxWidth} height={viewBoxHeight} fill="#fafafa" />

      {piece === "sleeve" ? (
        <SleeveShapePDF startX={startX} startY={startY} dimensions={dimensions} showMeasurements={showMeasurements} />
      ) : piece === "cardigan-front" ? (
        <CardiganFrontShapePDF startX={startX} startY={startY} dimensions={dimensions} showMeasurements={showMeasurements} />
      ) : (
        <PanelShapePDF startX={startX} startY={startY} dimensions={dimensions} showMeasurements={showMeasurements} isFront={piece === "front"} />
      )}
    </Svg>
  );
}

function PanelShapePDF({
  startX,
  startY,
  dimensions,
  showMeasurements,
  isFront,
}: {
  startX: number;
  startY: number;
  dimensions: Dimensions;
  showMeasurements: boolean;
  isFront: boolean;
}) {
  const width = dimensions.width * SCALE;
  const length = dimensions.length * SCALE;
  const armholeDepth = (dimensions.armholeDepth || 20) * SCALE;
  const necklineWidth = (dimensions.necklineWidth || dimensions.width * 0.3) * SCALE;
  const necklineDepth = (dimensions.necklineDepth || (isFront ? 8 : 3)) * SCALE;
  const armholeNotch = width * 0.08;
  const armholeCurve = armholeDepth * 0.3;

  const path = `
    M ${startX} ${startY + length}
    L ${startX} ${startY + armholeDepth}
    Q ${startX} ${startY + armholeDepth - armholeCurve} ${startX + armholeNotch} ${startY + armholeDepth - armholeCurve}
    L ${startX + armholeNotch} ${startY + necklineDepth}
    L ${startX + (width - necklineWidth) / 2} ${startY + necklineDepth}
    Q ${startX + (width - necklineWidth) / 2 + necklineWidth * 0.1} ${startY} ${startX + width / 2} ${startY}
    Q ${startX + (width + necklineWidth) / 2 - necklineWidth * 0.1} ${startY} ${startX + (width + necklineWidth) / 2} ${startY + necklineDepth}
    L ${startX + width - armholeNotch} ${startY + necklineDepth}
    L ${startX + width - armholeNotch} ${startY + armholeDepth - armholeCurve}
    Q ${startX + width} ${startY + armholeDepth - armholeCurve} ${startX + width} ${startY + armholeDepth}
    L ${startX + width} ${startY + length}
    Z
  `;

  return (
    <G>
      <Path d={path} fill="none" stroke="#333" strokeWidth={STROKE_WIDTH} />
      <Line x1={startX} y1={startY + length - 4} x2={startX + width} y2={startY + length - 4} stroke="#666" strokeWidth={0.5} strokeDasharray="2,2" />

      {showMeasurements && (
        <>
          <Text x={startX + width / 2} y={startY + length + 15} style={{ fontSize: FONT_SIZE, fontFamily: "Courier" }} fill="#666">
            {dimensions.width.toFixed(1)} cm
          </Text>
          <Text x={startX + width + 8} y={startY + length / 2} style={{ fontSize: FONT_SIZE, fontFamily: "Courier" }} fill="#666">
            {dimensions.length.toFixed(1)} cm
          </Text>
        </>
      )}
    </G>
  );
}

function SleeveShapePDF({
  startX,
  startY,
  dimensions,
  showMeasurements,
}: {
  startX: number;
  startY: number;
  dimensions: Dimensions;
  showMeasurements: boolean;
}) {
  const topWidth = (dimensions.sleeveTopWidth || dimensions.width) * SCALE;
  const cuffWidth = (dimensions.sleeveCuffWidth || dimensions.width * 0.5) * SCALE;
  const length = dimensions.length * SCALE;
  const maxWidth = Math.max(topWidth, cuffWidth);
  const offsetTop = (maxWidth - topWidth) / 2;
  const offsetCuff = (maxWidth - cuffWidth) / 2;
  const capHeight = topWidth * 0.25;

  const path = `
    M ${startX + offsetCuff} ${startY + length}
    L ${startX + offsetTop} ${startY + capHeight}
    Q ${startX + offsetTop + topWidth * 0.15} ${startY} ${startX + maxWidth / 2} ${startY}
    Q ${startX + offsetTop + topWidth * 0.85} ${startY} ${startX + offsetTop + topWidth} ${startY + capHeight}
    L ${startX + offsetCuff + cuffWidth} ${startY + length}
    Z
  `;

  return (
    <G>
      <Path d={path} fill="none" stroke="#333" strokeWidth={STROKE_WIDTH} />
      <Line x1={startX + offsetCuff} y1={startY + length - 4} x2={startX + offsetCuff + cuffWidth} y2={startY + length - 4} stroke="#666" strokeWidth={0.5} strokeDasharray="2,2" />

      {showMeasurements && (
        <>
          <Text x={startX + maxWidth / 2} y={startY - 5} style={{ fontSize: FONT_SIZE, fontFamily: "Courier" }} fill="#666">
            {(dimensions.sleeveTopWidth || dimensions.width).toFixed(1)} cm
          </Text>
          <Text x={startX + maxWidth / 2} y={startY + length + 15} style={{ fontSize: FONT_SIZE, fontFamily: "Courier" }} fill="#666">
            {(dimensions.sleeveCuffWidth || dimensions.width * 0.5).toFixed(1)} cm
          </Text>
          <Text x={startX + maxWidth + 8} y={startY + length / 2} style={{ fontSize: FONT_SIZE, fontFamily: "Courier" }} fill="#666">
            {dimensions.length.toFixed(1)} cm
          </Text>
        </>
      )}
    </G>
  );
}

function CardiganFrontShapePDF({
  startX,
  startY,
  dimensions,
  showMeasurements,
}: {
  startX: number;
  startY: number;
  dimensions: Dimensions;
  showMeasurements: boolean;
}) {
  const width = dimensions.width * SCALE;
  const length = dimensions.length * SCALE;
  const armholeDepth = (dimensions.armholeDepth || 20) * SCALE;
  const necklineDepth = (dimensions.necklineDepth || 15) * SCALE;
  const armholeNotch = width * 0.12;
  const armholeCurve = armholeDepth * 0.3;
  const buttonBand = width * 0.15;

  const path = `
    M ${startX} ${startY + length}
    L ${startX} ${startY}
    L ${startX + buttonBand} ${startY}
    L ${startX + buttonBand} ${startY + length * 0.3}
    Q ${startX + buttonBand} ${startY + necklineDepth * 0.5} ${startX + width * 0.4} ${startY + necklineDepth * 0.3}
    L ${startX + width - armholeNotch} ${startY + necklineDepth * 0.3}
    L ${startX + width - armholeNotch} ${startY + armholeDepth - armholeCurve}
    Q ${startX + width} ${startY + armholeDepth - armholeCurve} ${startX + width} ${startY + armholeDepth}
    L ${startX + width} ${startY + length}
    Z
  `;

  return (
    <G>
      <Path d={path} fill="none" stroke="#333" strokeWidth={STROKE_WIDTH} />
      <Line x1={startX} y1={startY + length - 4} x2={startX + width} y2={startY + length - 4} stroke="#666" strokeWidth={0.5} strokeDasharray="2,2" />

      {showMeasurements && (
        <>
          <Text x={startX + width / 2} y={startY + length + 15} style={{ fontSize: FONT_SIZE, fontFamily: "Courier" }} fill="#666">
            {dimensions.width.toFixed(1)} cm
          </Text>
          <Text x={startX + width + 8} y={startY + length / 2} style={{ fontSize: FONT_SIZE, fontFamily: "Courier" }} fill="#666">
            {dimensions.length.toFixed(1)} cm
          </Text>
        </>
      )}
    </G>
  );
}

// Utility function to get dimensions from pattern piece
export function getDimensionsForPDF(
  pieceName: string,
  castOn: number,
  totalRows: number,
  gauge: Gauge,
  measurements?: {
    armLength?: number;
    wristCircumference?: number;
    bicepCircumference?: number;
  }
): { piece: SchematicPDFProps["piece"]; dimensions: Dimensions } | null {
  const width = (castOn / gauge.stitchesPer10cm) * 10;
  const length = (totalRows / gauge.rowsPer10cm) * 10;
  const lowerName = pieceName.toLowerCase();

  if (lowerName.includes("manche") || lowerName.includes("sleeve")) {
    return {
      piece: "sleeve",
      dimensions: {
        width: (measurements?.bicepCircumference || width) + 4,
        length: measurements?.armLength || length,
        sleeveTopWidth: (measurements?.bicepCircumference || width) + 4,
        sleeveCuffWidth: (measurements?.wristCircumference || width * 0.5) + 2,
      },
    };
  }

  if (lowerName.includes("devant gauche") || lowerName.includes("devant droit") || lowerName.includes("left front") || lowerName.includes("right front")) {
    return {
      piece: "cardigan-front",
      dimensions: {
        width,
        length,
        armholeDepth: 20,
        necklineDepth: 15,
      },
    };
  }

  if (lowerName.includes("devant") || lowerName.includes("front")) {
    return {
      piece: "front",
      dimensions: {
        width,
        length,
        armholeDepth: 20,
        necklineWidth: width * 0.3,
        necklineDepth: 8,
      },
    };
  }

  if (lowerName.includes("dos") || lowerName.includes("back") || lowerName.includes("corps") || lowerName.includes("body")) {
    return {
      piece: "back",
      dimensions: {
        width,
        length,
        armholeDepth: 20,
        necklineWidth: width * 0.3,
        necklineDepth: 3,
      },
    };
  }

  return null;
}
