"use client";

import { cn } from "@/lib/utils";

interface Dimensions {
  width: number; // cm
  length: number; // cm
  armholeDepth?: number;
  shoulderWidth?: number;
  necklineWidth?: number;
  necklineDepth?: number;
  sleeveTopWidth?: number;
  sleeveCuffWidth?: number;
}

interface SchematicSVGProps {
  piece: "back" | "front" | "sleeve" | "cardigan-front";
  dimensions: Dimensions;
  showMeasurements?: boolean;
  className?: string;
}

// Constantes pour le dessin
const SCALE = 4; // pixels par cm
const MARGIN = 40; // marge pour les cotes
const STROKE_WIDTH = 1.5;
const DIMENSION_LINE_OFFSET = 15;
const FONT_SIZE = 10;

export function SchematicSVG({
  piece,
  dimensions,
  showMeasurements = true,
  className,
}: SchematicSVGProps) {
  // Calculer les dimensions SVG
  const width = dimensions.width * SCALE;
  const length = dimensions.length * SCALE;

  // Dimensions du viewBox avec marges
  const viewBoxWidth = width + MARGIN * 2;
  const viewBoxHeight = length + MARGIN * 2;

  // Point de départ (avec marge)
  const startX = MARGIN;
  const startY = MARGIN;

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      className={cn("w-full max-w-xs", className)}
      style={{ maxHeight: "300px" }}
    >
      {/* Fond */}
      <rect
        x="0"
        y="0"
        width={viewBoxWidth}
        height={viewBoxHeight}
        fill="#fafafa"
        rx="4"
      />

      {/* Dessiner la pièce selon le type */}
      {piece === "sleeve" ? (
        <SleeveShape
          startX={startX}
          startY={startY}
          dimensions={dimensions}
          showMeasurements={showMeasurements}
        />
      ) : piece === "cardigan-front" ? (
        <CardiganFrontShape
          startX={startX}
          startY={startY}
          dimensions={dimensions}
          showMeasurements={showMeasurements}
        />
      ) : (
        <PanelShape
          startX={startX}
          startY={startY}
          dimensions={dimensions}
          showMeasurements={showMeasurements}
          isFront={piece === "front"}
        />
      )}
    </svg>
  );
}

// Composant pour panneau dos/devant
function PanelShape({
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

  // Points du contour
  const armholeNotch = width * 0.08;
  const armholeCurve = armholeDepth * 0.3;

  // Construire le path
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
    <g>
      {/* Forme principale */}
      <path
        d={path}
        fill="none"
        stroke="#333"
        strokeWidth={STROKE_WIDTH}
      />

      {/* Ligne de côtes (bord inférieur) */}
      <line
        x1={startX}
        y1={startY + length - 5}
        x2={startX + width}
        y2={startY + length - 5}
        stroke="#666"
        strokeWidth={0.5}
        strokeDasharray="2,2"
      />

      {showMeasurements && (
        <>
          {/* Cote largeur (bas) */}
          <DimensionLine
            x1={startX}
            y1={startY + length + DIMENSION_LINE_OFFSET}
            x2={startX + width}
            y2={startY + length + DIMENSION_LINE_OFFSET}
            value={dimensions.width}
            unit="cm"
            position="below"
          />

          {/* Cote longueur (droite) */}
          <DimensionLine
            x1={startX + width + DIMENSION_LINE_OFFSET}
            y1={startY}
            x2={startX + width + DIMENSION_LINE_OFFSET}
            y2={startY + length}
            value={dimensions.length}
            unit="cm"
            position="right"
            vertical
          />

          {/* Cote emmanchure (gauche) */}
          {dimensions.armholeDepth && (
            <DimensionLine
              x1={startX - DIMENSION_LINE_OFFSET}
              y1={startY}
              x2={startX - DIMENSION_LINE_OFFSET}
              y2={startY + armholeDepth}
              value={dimensions.armholeDepth}
              unit="cm"
              position="left"
              vertical
            />
          )}

          {/* Cote encolure (haut) */}
          {dimensions.necklineWidth && (
            <DimensionLine
              x1={startX + (width - necklineWidth) / 2}
              y1={startY - DIMENSION_LINE_OFFSET + 5}
              x2={startX + (width + necklineWidth) / 2}
              y2={startY - DIMENSION_LINE_OFFSET + 5}
              value={dimensions.necklineWidth}
              unit="cm"
              position="above"
            />
          )}
        </>
      )}
    </g>
  );
}

// Composant pour devant de cardigan
function CardiganFrontShape({
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

  // Points du contour (demi-panneau avec ouverture)
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

  // Boutonnières
  const buttonCount = 5;
  const buttonSpacing = (length - 40) / (buttonCount + 1);

  return (
    <g>
      {/* Forme principale */}
      <path
        d={path}
        fill="none"
        stroke="#333"
        strokeWidth={STROKE_WIDTH}
      />

      {/* Boutonnières */}
      {Array.from({ length: buttonCount }).map((_, i) => (
        <ellipse
          key={i}
          cx={startX + buttonBand / 2}
          cy={startY + 30 + buttonSpacing * (i + 1)}
          rx={3}
          ry={6}
          fill="none"
          stroke="#666"
          strokeWidth={0.75}
        />
      ))}

      {/* Ligne de côtes */}
      <line
        x1={startX}
        y1={startY + length - 5}
        x2={startX + width}
        y2={startY + length - 5}
        stroke="#666"
        strokeWidth={0.5}
        strokeDasharray="2,2"
      />

      {showMeasurements && (
        <>
          {/* Cote largeur */}
          <DimensionLine
            x1={startX}
            y1={startY + length + DIMENSION_LINE_OFFSET}
            x2={startX + width}
            y2={startY + length + DIMENSION_LINE_OFFSET}
            value={dimensions.width}
            unit="cm"
            position="below"
          />

          {/* Cote longueur */}
          <DimensionLine
            x1={startX + width + DIMENSION_LINE_OFFSET}
            y1={startY}
            x2={startX + width + DIMENSION_LINE_OFFSET}
            y2={startY + length}
            value={dimensions.length}
            unit="cm"
            position="right"
            vertical
          />
        </>
      )}
    </g>
  );
}

// Composant pour manche (trapèze)
function SleeveShape({
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

  // Centrer le trapèze
  const maxWidth = Math.max(topWidth, cuffWidth);
  const offsetTop = (maxWidth - topWidth) / 2;
  const offsetCuff = (maxWidth - cuffWidth) / 2;

  // Tête de manche arrondie
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
    <g>
      {/* Forme principale */}
      <path
        d={path}
        fill="none"
        stroke="#333"
        strokeWidth={STROKE_WIDTH}
      />

      {/* Ligne de côtes (poignet) */}
      <line
        x1={startX + offsetCuff}
        y1={startY + length - 5}
        x2={startX + offsetCuff + cuffWidth}
        y2={startY + length - 5}
        stroke="#666"
        strokeWidth={0.5}
        strokeDasharray="2,2"
      />

      {showMeasurements && (
        <>
          {/* Cote largeur haut */}
          <DimensionLine
            x1={startX + offsetTop}
            y1={startY - DIMENSION_LINE_OFFSET + capHeight}
            x2={startX + offsetTop + topWidth}
            y2={startY - DIMENSION_LINE_OFFSET + capHeight}
            value={dimensions.sleeveTopWidth || dimensions.width}
            unit="cm"
            position="above"
          />

          {/* Cote largeur bas (poignet) */}
          <DimensionLine
            x1={startX + offsetCuff}
            y1={startY + length + DIMENSION_LINE_OFFSET}
            x2={startX + offsetCuff + cuffWidth}
            y2={startY + length + DIMENSION_LINE_OFFSET}
            value={dimensions.sleeveCuffWidth || dimensions.width * 0.5}
            unit="cm"
            position="below"
          />

          {/* Cote longueur */}
          <DimensionLine
            x1={startX + maxWidth + DIMENSION_LINE_OFFSET}
            y1={startY}
            x2={startX + maxWidth + DIMENSION_LINE_OFFSET}
            y2={startY + length}
            value={dimensions.length}
            unit="cm"
            position="right"
            vertical
          />
        </>
      )}
    </g>
  );
}

// Composant pour ligne de cote
function DimensionLine({
  x1,
  y1,
  x2,
  y2,
  value,
  unit,
  position,
  vertical = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  value: number;
  unit: string;
  position: "above" | "below" | "left" | "right";
  vertical?: boolean;
}) {
  const arrowSize = 4;
  const textOffset = 3;

  // Position du texte
  const textX = vertical ? x1 : (x1 + x2) / 2;
  const textY = vertical ? (y1 + y2) / 2 : y1;

  // Rotation pour texte vertical
  const textRotation = vertical ? -90 : 0;
  const textAnchor = "middle";

  // Ajustement de position du texte
  let textDx = 0;
  let textDy = 0;

  if (position === "above") textDy = -textOffset;
  if (position === "below") textDy = textOffset + FONT_SIZE;
  if (position === "left") textDx = -textOffset - FONT_SIZE;
  if (position === "right") textDx = textOffset + FONT_SIZE;

  return (
    <g className="dimension-line">
      {/* Ligne principale */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#999"
        strokeWidth={0.75}
      />

      {/* Flèches */}
      {vertical ? (
        <>
          {/* Flèche haut */}
          <polygon
            points={`${x1},${y1} ${x1 - arrowSize / 2},${y1 + arrowSize} ${x1 + arrowSize / 2},${y1 + arrowSize}`}
            fill="#999"
          />
          {/* Flèche bas */}
          <polygon
            points={`${x2},${y2} ${x2 - arrowSize / 2},${y2 - arrowSize} ${x2 + arrowSize / 2},${y2 - arrowSize}`}
            fill="#999"
          />
          {/* Lignes d'extension */}
          <line x1={x1 - 5} y1={y1} x2={x1 + 5} y2={y1} stroke="#999" strokeWidth={0.5} />
          <line x1={x2 - 5} y1={y2} x2={x2 + 5} y2={y2} stroke="#999" strokeWidth={0.5} />
        </>
      ) : (
        <>
          {/* Flèche gauche */}
          <polygon
            points={`${x1},${y1} ${x1 + arrowSize},${y1 - arrowSize / 2} ${x1 + arrowSize},${y1 + arrowSize / 2}`}
            fill="#999"
          />
          {/* Flèche droite */}
          <polygon
            points={`${x2},${y2} ${x2 - arrowSize},${y2 - arrowSize / 2} ${x2 - arrowSize},${y2 + arrowSize / 2}`}
            fill="#999"
          />
          {/* Lignes d'extension */}
          <line x1={x1} y1={y1 - 5} x2={x1} y2={y1 + 5} stroke="#999" strokeWidth={0.5} />
          <line x1={x2} y1={y2 - 5} x2={x2} y2={y2 + 5} stroke="#999" strokeWidth={0.5} />
        </>
      )}

      {/* Texte de la dimension */}
      <text
        x={textX + textDx}
        y={textY + textDy}
        fontSize={FONT_SIZE}
        fontFamily="monospace"
        fill="#666"
        textAnchor={textAnchor}
        transform={vertical ? `rotate(${textRotation}, ${textX + textDx}, ${textY + textDy})` : undefined}
      >
        {value.toFixed(1)} {unit}
      </text>
    </g>
  );
}

// Fonction utilitaire pour calculer les dimensions depuis un PatternPiece
export function getDimensionsFromPiece(
  pieceName: string,
  castOn: number,
  totalRows: number,
  gauge: { stitchesPer10cm: number; rowsPer10cm: number },
  measurements?: {
    armLength?: number;
    wristCircumference?: number;
    bicepCircumference?: number;
  }
): { piece: SchematicSVGProps["piece"]; dimensions: Dimensions } {
  const width = (castOn / gauge.stitchesPer10cm) * 10;
  const length = (totalRows / gauge.rowsPer10cm) * 10;

  const lowerName = pieceName.toLowerCase();

  if (lowerName.includes("manche")) {
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

  if (lowerName.includes("devant gauche") || lowerName.includes("devant droit")) {
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

  if (lowerName.includes("devant")) {
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

  // Par défaut : dos
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
