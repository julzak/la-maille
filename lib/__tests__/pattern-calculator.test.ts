import {
  stitchesForCm,
  rowsForCm,
  roundToMultiple,
  calculateDecreases,
  calculateIncreases,
  generateBackPanel,
  generateSleeves,
  estimateYardage,
  generateFullPattern,
} from "../pattern-calculator";
import type { Gauge, Measurements, GarmentAnalysis, YarnInfo } from "../types";

// ===========================================
// FIXTURES
// ===========================================

const standardGauge: Gauge = {
  stitchesPer10cm: 22,
  rowsPer10cm: 30,
  needleSize: 4,
};

const fineGauge: Gauge = {
  stitchesPer10cm: 30,
  rowsPer10cm: 40,
  needleSize: 2.5,
};

const bulkyGauge: Gauge = {
  stitchesPer10cm: 12,
  rowsPer10cm: 16,
  needleSize: 8,
};

const standardMeasurements: Measurements = {
  chestCircumference: 96,
  bodyLength: 60,
  shoulderWidth: 42,
  armLength: 58,
  wristCircumference: 16,
  bicepCircumference: 30,
  ease: 8,
};

const smallMeasurements: Measurements = {
  chestCircumference: 80,
  bodyLength: 50,
  shoulderWidth: 36,
  armLength: 50,
  wristCircumference: 14,
  bicepCircumference: 25,
  ease: 4,
};

const largeMeasurements: Measurements = {
  chestCircumference: 130,
  bodyLength: 75,
  shoulderWidth: 52,
  armLength: 65,
  wristCircumference: 20,
  bicepCircumference: 40,
  ease: 12,
};

const pullAnalysis: GarmentAnalysis = {
  analysable: true,
  rejectionReason: null,
  overallConfidence: "high",
  garment: { type: "pull", confidence: 0.95 },
  construction: { method: "pieces-assemblees", confidence: 0.9, reasoning: "Coutures visibles aux épaules" },
  neckline: { type: "ras-du-cou", confidence: 0.85 },
  sleeves: { type: "montees", length: "longues", confidence: 0.9 },
  stitch: { mainPattern: "jersey", confidence: 0.95, notes: null },
  fit: { style: "regular", confidence: 0.85 },
  closure: { type: "aucune", buttonCountEstimate: null, confidence: 0.95 },
  limitations: [],
  warnings: [],
};

const cardiganAnalysis: GarmentAnalysis = {
  analysable: true,
  rejectionReason: null,
  overallConfidence: "medium",
  garment: { type: "cardigan", confidence: 0.9 },
  construction: { method: "pieces-assemblees", confidence: 0.85, reasoning: "Ouverture devant avec boutons" },
  neckline: { type: "col-v", confidence: 0.8 },
  sleeves: { type: "montees", length: "longues", confidence: 0.85 },
  stitch: { mainPattern: "jersey", confidence: 0.9, notes: null },
  fit: { style: "regular", confidence: 0.8 },
  closure: { type: "boutons", buttonCountEstimate: 6, confidence: 0.85 },
  limitations: ["Le motif exact des boutons n'a pas pu être déterminé"],
  warnings: [],
};

const raglanAnalysis: GarmentAnalysis = {
  analysable: true,
  rejectionReason: null,
  overallConfidence: "high",
  garment: { type: "pull", confidence: 0.95 },
  construction: { method: "pieces-assemblees", confidence: 0.9, reasoning: "Lignes raglan visibles" },
  neckline: { type: "ras-du-cou", confidence: 0.85 },
  sleeves: { type: "raglan", length: "longues", confidence: 0.85 },
  stitch: { mainPattern: "jersey", confidence: 0.95, notes: null },
  fit: { style: "regular", confidence: 0.85 },
  closure: { type: "aucune", buttonCountEstimate: null, confidence: 0.95 },
  limitations: [],
  warnings: [],
};

const sleevelessAnalysis: GarmentAnalysis = {
  analysable: true,
  rejectionReason: null,
  overallConfidence: "high",
  garment: { type: "pull", confidence: 0.95 },
  construction: { method: "pieces-assemblees", confidence: 0.9, reasoning: "Sans manches" },
  neckline: { type: "ras-du-cou", confidence: 0.85 },
  sleeves: { type: "sans-manches", length: "sans", confidence: 0.95 },
  stitch: { mainPattern: "jersey", confidence: 0.95, notes: null },
  fit: { style: "regular", confidence: 0.85 },
  closure: { type: "aucune", buttonCountEstimate: null, confidence: 0.95 },
  limitations: [],
  warnings: [],
};

const standardYarn: YarnInfo = {
  weight: "dk",
  composition: "100% merinos",
};

// ===========================================
// TESTS: stitchesForCm
// ===========================================

describe("stitchesForCm", () => {
  it("calculates stitches correctly for standard gauge", () => {
    const result = stitchesForCm(10, standardGauge);
    expect(result.rounded).toBe(22);
    expect(result.result).toBe(22);
    expect(result.description).toContain("10 cm");
  });

  it("calculates stitches correctly for 50cm width", () => {
    const result = stitchesForCm(50, standardGauge);
    expect(result.rounded).toBe(110);
    expect(result.result).toBeCloseTo(110, 5);
  });

  it("rounds to nearest integer", () => {
    // 15cm with 22 stitches/10cm = 33 stitches exactly
    const result = stitchesForCm(15, standardGauge);
    expect(result.rounded).toBe(33);
  });

  it("handles fine gauge (more stitches per cm)", () => {
    const result = stitchesForCm(10, fineGauge);
    expect(result.rounded).toBe(30);
  });

  it("handles bulky gauge (fewer stitches per cm)", () => {
    const result = stitchesForCm(10, bulkyGauge);
    expect(result.rounded).toBe(12);
  });

  it("adds rounding note when applicable", () => {
    // 7cm × 2.2 = 15.4 → rounds to 15
    const result = stitchesForCm(7, standardGauge);
    expect(result.rounded).toBe(15);
    expect(result.roundingNote).toContain("15");
  });

  it("handles zero cm", () => {
    const result = stitchesForCm(0, standardGauge);
    expect(result.rounded).toBe(0);
    expect(result.result).toBe(0);
  });

  it("handles decimal cm values", () => {
    const result = stitchesForCm(5.5, standardGauge);
    expect(result.rounded).toBe(12); // 5.5 × 2.2 = 12.1 → 12
  });
});

// ===========================================
// TESTS: rowsForCm
// ===========================================

describe("rowsForCm", () => {
  it("calculates rows correctly for standard gauge", () => {
    const result = rowsForCm(10, standardGauge);
    expect(result.rounded).toBe(30);
  });

  it("calculates rows correctly for 60cm length", () => {
    const result = rowsForCm(60, standardGauge);
    expect(result.rounded).toBe(180);
  });

  it("handles fine gauge", () => {
    const result = rowsForCm(10, fineGauge);
    expect(result.rounded).toBe(40);
  });

  it("handles bulky gauge", () => {
    const result = rowsForCm(10, bulkyGauge);
    expect(result.rounded).toBe(16);
  });
});

// ===========================================
// TESTS: roundToMultiple
// ===========================================

describe("roundToMultiple", () => {
  describe("nearest rounding", () => {
    it("rounds to nearest multiple of 2", () => {
      expect(roundToMultiple(5, 2, "nearest")).toBe(6);
      expect(roundToMultiple(4, 2, "nearest")).toBe(4);
      expect(roundToMultiple(3, 2, "nearest")).toBe(4);
    });

    it("rounds to nearest multiple of 4", () => {
      expect(roundToMultiple(5, 4, "nearest")).toBe(4);
      expect(roundToMultiple(6, 4, "nearest")).toBe(8);
      expect(roundToMultiple(10, 4, "nearest")).toBe(12);
    });

    it("rounds to nearest multiple of 10", () => {
      expect(roundToMultiple(23, 10, "nearest")).toBe(20);
      expect(roundToMultiple(27, 10, "nearest")).toBe(30);
    });
  });

  describe("up rounding", () => {
    it("always rounds up to next multiple", () => {
      expect(roundToMultiple(5, 4, "up")).toBe(8);
      expect(roundToMultiple(4, 4, "up")).toBe(4);
      expect(roundToMultiple(1, 4, "up")).toBe(4);
    });
  });

  describe("down rounding", () => {
    it("always rounds down to previous multiple", () => {
      expect(roundToMultiple(5, 4, "down")).toBe(4);
      expect(roundToMultiple(7, 4, "down")).toBe(4);
      expect(roundToMultiple(8, 4, "down")).toBe(8);
    });
  });

  describe("edge cases", () => {
    it("handles multiple of 0", () => {
      expect(roundToMultiple(5, 0, "nearest")).toBe(5);
    });

    it("handles negative numbers", () => {
      expect(roundToMultiple(-5, 2, "nearest")).toBe(-4);
    });

    it("handles zero", () => {
      expect(roundToMultiple(0, 4, "nearest")).toBe(0);
    });
  });
});

// ===========================================
// TESTS: calculateDecreases
// ===========================================

describe("calculateDecreases", () => {
  it("calculates simple decreases", () => {
    const result = calculateDecreases(100, 80, 60);
    expect(result.totalDecreases).toBe(20);
    expect(result.decreaseEveryNRows).toBe(6);
    expect(result.instructions).toContain("10 fois");
  });

  it("handles no decreases needed", () => {
    const result = calculateDecreases(100, 100, 60);
    expect(result.totalDecreases).toBe(0);
    expect(result.decreaseEveryNRows).toBe(0);
    expect(result.instructions).toContain("sans diminutions");
  });

  it("handles rapid decreases", () => {
    const result = calculateDecreases(100, 60, 10);
    expect(result.totalDecreases).toBe(40);
    // 20 decreases per side in 10 rows = every 0.5 rows, so every row
    expect(result.instructions).toContain("chaque rang");
  });

  it("handles remainder rows", () => {
    const result = calculateDecreases(100, 90, 25);
    expect(result.totalDecreases).toBe(10);
    // 5 decreases per side over 25 rows = every 5 rows
    expect(result.decreaseEveryNRows).toBe(5);
    expect(result.remainder).toBe(0);
  });

  it("calculates decreases symmetrically (both sides)", () => {
    const result = calculateDecreases(100, 80, 60);
    // 20 total decreases means 10 on each side
    expect(result.instructions).toContain("chaque cote");
    expect(result.instructions).toContain("10 fois");
  });
});

// ===========================================
// TESTS: calculateIncreases
// ===========================================

describe("calculateIncreases", () => {
  it("calculates simple increases", () => {
    const result = calculateIncreases(40, 60, 80);
    expect(result.totalIncreases).toBe(20);
    expect(result.increaseEveryNRows).toBe(8);
    expect(result.instructions).toContain("10 fois");
  });

  it("handles no increases needed", () => {
    const result = calculateIncreases(50, 50, 40);
    expect(result.totalIncreases).toBe(0);
    expect(result.instructions).toContain("sans augmentations");
  });

  it("calculates increases symmetrically", () => {
    const result = calculateIncreases(40, 60, 40);
    expect(result.instructions).toContain("chaque cote");
  });
});

// ===========================================
// TESTS: generateBackPanel
// ===========================================

describe("generateBackPanel", () => {
  it("generates back panel with correct cast-on count", () => {
    const back = generateBackPanel(standardMeasurements, standardGauge, pullAnalysis);

    // (96 + 8) / 2 = 52cm width
    // 52 × 2.2 = 114.4 → rounded to even = 114
    expect(back.castOn).toBeGreaterThan(100);
    expect(back.castOn).toBeLessThan(130);
    expect(back.castOn % 2).toBe(0); // Should be even for ribs
  });

  it("generates correct total rows based on body length", () => {
    const back = generateBackPanel(standardMeasurements, standardGauge, pullAnalysis);

    // 60cm × 3 rows/cm = 180 rows
    expect(back.totalRows).toBe(180);
  });

  it("includes rib section in instructions", () => {
    const back = generateBackPanel(standardMeasurements, standardGauge, pullAnalysis);

    const ribInstruction = back.instructions.find((i) =>
      i.text.toLowerCase().includes("cotes") || i.text.toLowerCase().includes("rib")
    );
    expect(ribInstruction).toBeDefined();
  });

  it("includes armhole instructions for set-in sleeves", () => {
    const back = generateBackPanel(standardMeasurements, standardGauge, pullAnalysis);

    const armholeInstruction = back.instructions.find((i) =>
      i.text.toLowerCase().includes("emmanchure")
    );
    expect(armholeInstruction).toBeDefined();
  });

  it("handles raglan construction", () => {
    const back = generateBackPanel(standardMeasurements, standardGauge, raglanAnalysis);

    const raglanInstruction = back.instructions.find((i) =>
      i.text.toLowerCase().includes("raglan")
    );
    expect(raglanInstruction).toBeDefined();
  });

  it("scales correctly for small measurements", () => {
    const back = generateBackPanel(smallMeasurements, standardGauge, pullAnalysis);

    // (80 + 4) / 2 = 42cm width
    expect(back.castOn).toBeLessThan(100);
    expect(back.castOn).toBeGreaterThan(80);
  });

  it("scales correctly for large measurements", () => {
    const back = generateBackPanel(largeMeasurements, standardGauge, pullAnalysis);

    // (130 + 12) / 2 = 71cm width
    expect(back.castOn).toBeGreaterThan(140);
  });

  it("adjusts for different gauges", () => {
    const standardBack = generateBackPanel(standardMeasurements, standardGauge, pullAnalysis);
    const fineBack = generateBackPanel(standardMeasurements, fineGauge, pullAnalysis);
    const bulkyBack = generateBackPanel(standardMeasurements, bulkyGauge, pullAnalysis);

    // More stitches with finer gauge
    expect(fineBack.castOn).toBeGreaterThan(standardBack.castOn);
    // Fewer stitches with bulky gauge
    expect(bulkyBack.castOn).toBeLessThan(standardBack.castOn);
  });
});

// ===========================================
// TESTS: generateSleeves
// ===========================================

describe("generateSleeves", () => {
  it("generates sleeves with correct wrist cast-on", () => {
    const sleeves = generateSleeves(standardMeasurements, standardGauge, pullAnalysis);

    // (16 + 2) × 2.2 = 39.6 → rounded to multiple of 4 = 40
    expect(sleeves.castOn).toBeGreaterThan(35);
    expect(sleeves.castOn).toBeLessThan(50);
    expect(sleeves.castOn % 4).toBe(0); // Multiple of 4 for ribs
  });

  it("returns empty piece for sleeveless", () => {
    const sleeves = generateSleeves(standardMeasurements, standardGauge, sleevelessAnalysis);

    expect(sleeves.castOn).toBe(0);
    expect(sleeves.totalRows).toBe(0);
  });

  it("includes increase instructions", () => {
    const sleeves = generateSleeves(standardMeasurements, standardGauge, pullAnalysis);

    const increaseInstruction = sleeves.instructions.find((i) =>
      i.text.toLowerCase().includes("augment")
    );
    expect(increaseInstruction).toBeDefined();
  });

  it("includes sleeve cap for set-in sleeves", () => {
    const sleeves = generateSleeves(standardMeasurements, standardGauge, pullAnalysis);

    const capInstruction = sleeves.instructions.find((i) =>
      i.text.toLowerCase().includes("tete de manche") || i.text.toLowerCase().includes("sleeve cap")
    );
    expect(capInstruction).toBeDefined();
  });

  it("warns to make 2 identical sleeves", () => {
    const sleeves = generateSleeves(standardMeasurements, standardGauge, pullAnalysis);

    const hasWarning = sleeves.warnings.some(w =>
      w.includes("Tricoter 2 manches identiques") || w.includes("Knit 2 identical sleeves")
    );
    expect(hasWarning).toBe(true);
  });
});

// ===========================================
// TESTS: estimateYardage
// ===========================================

describe("estimateYardage", () => {
  it("estimates yardage for standard garment", () => {
    const yardage = estimateYardage(standardMeasurements, standardGauge, standardYarn);

    // Should be reasonable for a sweater (300-600g typically)
    expect(yardage.grams).toBeGreaterThan(200);
    expect(yardage.grams).toBeLessThan(800);
  });

  it("estimates more yarn for larger sizes", () => {
    const standard = estimateYardage(standardMeasurements, standardGauge, standardYarn);
    const large = estimateYardage(largeMeasurements, standardGauge, standardYarn);

    expect(large.grams).toBeGreaterThan(standard.grams);
  });

  it("estimates less yarn for smaller sizes", () => {
    const standard = estimateYardage(standardMeasurements, standardGauge, standardYarn);
    const small = estimateYardage(smallMeasurements, standardGauge, standardYarn);

    expect(small.grams).toBeLessThan(standard.grams);
  });

  it("adjusts for yarn weight", () => {
    // Same gauge, different yarn weights should produce different estimates
    const dk = estimateYardage(standardMeasurements, standardGauge, { weight: "dk" });
    const worsted = estimateYardage(standardMeasurements, standardGauge, { weight: "worsted" });
    const lace = estimateYardage(standardMeasurements, standardGauge, { weight: "lace" });

    // Heavier yarn weight = more grams
    expect(worsted.grams).toBeGreaterThan(dk.grams);
    // Lighter yarn weight = less grams
    expect(lace.grams).toBeLessThan(dk.grams);
  });

  it("provides a range estimate", () => {
    const yardage = estimateYardage(standardMeasurements, standardGauge, standardYarn);

    expect(yardage.skeinsEstimate).toMatch(/\d+-\d+g/);
  });
});

// ===========================================
// TESTS: generateFullPattern
// ===========================================

describe("generateFullPattern", () => {
  it("generates a complete pattern with all pieces", () => {
    const pattern = generateFullPattern(
      pullAnalysis,
      standardGauge,
      standardMeasurements,
      standardYarn
    );

    expect(pattern.pieces.length).toBeGreaterThanOrEqual(2); // At least back and front
    expect(pattern.assembly.length).toBeGreaterThan(0);
    expect(pattern.finishing.length).toBeGreaterThan(0);
  });

  it("includes an ID and creation date", () => {
    const pattern = generateFullPattern(
      pullAnalysis,
      standardGauge,
      standardMeasurements,
      standardYarn
    );

    expect(pattern.id).toBeDefined();
    expect(pattern.id.length).toBeGreaterThan(10);
    expect(pattern.createdAt).toBeInstanceOf(Date);
  });

  it("generates 2 front pieces for cardigan", () => {
    const pattern = generateFullPattern(
      cardiganAnalysis,
      standardGauge,
      standardMeasurements,
      standardYarn
    );

    const frontPieces = pattern.pieces.filter((p) =>
      p.name.toLowerCase().includes("devant")
    );
    expect(frontPieces.length).toBe(2);
  });

  it("includes sleeves for sleeved garments", () => {
    const pattern = generateFullPattern(
      pullAnalysis,
      standardGauge,
      standardMeasurements,
      standardYarn
    );

    const sleeves = pattern.pieces.find((p) =>
      p.name.toLowerCase().includes("manche")
    );
    expect(sleeves).toBeDefined();
  });

  it("excludes sleeves for sleeveless garments", () => {
    const pattern = generateFullPattern(
      sleevelessAnalysis,
      standardGauge,
      standardMeasurements,
      standardYarn
    );

    const sleeves = pattern.pieces.find((p) =>
      p.name.toLowerCase().includes("manche")
    );
    // Sleeves should not be in the pattern OR have 0 cast-on
    expect(sleeves).toBeUndefined();
  });

  it("includes button sewing instructions for cardigan", () => {
    const pattern = generateFullPattern(
      cardiganAnalysis,
      standardGauge,
      standardMeasurements,
      standardYarn
    );

    const buttonInstruction = pattern.finishing.find((f) =>
      f.toLowerCase().includes("bouton")
    );
    expect(buttonInstruction).toBeDefined();
  });

  it("includes disclaimer", () => {
    const pattern = generateFullPattern(
      pullAnalysis,
      standardGauge,
      standardMeasurements,
      standardYarn
    );

    expect(pattern.disclaimer).toBeDefined();
    expect(pattern.disclaimer.length).toBeGreaterThan(50);
    expect(pattern.disclaimer.toLowerCase()).toContain("echantillon");
  });

  it("includes estimated yardage", () => {
    const pattern = generateFullPattern(
      pullAnalysis,
      standardGauge,
      standardMeasurements,
      standardYarn
    );

    expect(pattern.estimatedYardage).toBeGreaterThan(0);
  });

  it("preserves analysis, gauge, measurements, and yarn in pattern", () => {
    const pattern = generateFullPattern(
      pullAnalysis,
      standardGauge,
      standardMeasurements,
      standardYarn
    );

    expect(pattern.analysis).toEqual(pullAnalysis);
    expect(pattern.gauge).toEqual(standardGauge);
    expect(pattern.measurements).toEqual(standardMeasurements);
    expect(pattern.yarn).toEqual(standardYarn);
  });
});

// ===========================================
// TESTS: Edge Cases
// ===========================================

describe("Edge Cases", () => {
  describe("Extreme gauges", () => {
    it("handles very fine gauge (30+ stitches)", () => {
      const veryFineGauge: Gauge = {
        stitchesPer10cm: 35,
        rowsPer10cm: 50,
        needleSize: 2,
      };

      const pattern = generateFullPattern(
        pullAnalysis,
        veryFineGauge,
        standardMeasurements,
        { weight: "lace" }
      );

      expect(pattern.pieces[0].castOn).toBeGreaterThan(150);
    });

    it("handles very bulky gauge (10- stitches)", () => {
      const veryBulkyGauge: Gauge = {
        stitchesPer10cm: 8,
        rowsPer10cm: 12,
        needleSize: 12,
      };

      const pattern = generateFullPattern(
        pullAnalysis,
        veryBulkyGauge,
        standardMeasurements,
        { weight: "bulky" }
      );

      expect(pattern.pieces[0].castOn).toBeLessThan(60);
    });
  });

  describe("Extreme measurements", () => {
    it("handles very small measurements (child size)", () => {
      const childMeasurements: Measurements = {
        chestCircumference: 60,
        bodyLength: 35,
        shoulderWidth: 28,
        armLength: 35,
        wristCircumference: 12,
        bicepCircumference: 20,
        ease: 4,
      };

      const pattern = generateFullPattern(
        pullAnalysis,
        standardGauge,
        childMeasurements,
        standardYarn
      );

      expect(pattern.pieces[0].castOn).toBeGreaterThan(0);
      expect(pattern.estimatedYardage).toBeLessThan(300);
    });

    it("handles very large measurements", () => {
      const xlMeasurements: Measurements = {
        chestCircumference: 150,
        bodyLength: 80,
        shoulderWidth: 56,
        armLength: 70,
        wristCircumference: 22,
        bicepCircumference: 45,
        ease: 15,
      };

      const pattern = generateFullPattern(
        pullAnalysis,
        standardGauge,
        xlMeasurements,
        standardYarn
      );

      expect(pattern.pieces[0].castOn).toBeGreaterThan(150);
    });
  });

  describe("Zero ease", () => {
    it("handles zero ease correctly", () => {
      const zeroEaseMeasurements = { ...standardMeasurements, ease: 0 };

      const pattern = generateFullPattern(
        pullAnalysis,
        standardGauge,
        zeroEaseMeasurements,
        standardYarn
      );

      expect(pattern.pieces[0].castOn).toBeGreaterThan(0);
    });
  });
});
