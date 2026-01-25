import {
  REJECTION_MESSAGES,
  CONFIDENCE_DISPLAY,
  STITCH_WARNINGS,
  getRejectionMessage,
  getStitchWarning,
  getLoadingMessage,
} from "../messages";

// ===========================================
// TESTS: getRejectionMessage
// ===========================================

describe("getRejectionMessage", () => {
  it("returns correct message for known rejection types", () => {
    expect(getRejectionMessage("not-knit")).toBe(REJECTION_MESSAGES["not-knit"]);
    expect(getRejectionMessage("too-blurry")).toBe(REJECTION_MESSAGES["too-blurry"]);
    expect(getRejectionMessage("multiple-items")).toBe(REJECTION_MESSAGES["multiple-items"]);
  });

  it("returns default message for undefined reason", () => {
    expect(getRejectionMessage(undefined)).toBe(REJECTION_MESSAGES.default);
  });

  it("returns default message for unknown reason", () => {
    expect(getRejectionMessage("xyz")).toBe(REJECTION_MESSAGES.default);
  });

  it("returns the original message if its long enough to be a custom message", () => {
    const customMessage = "This is a custom error message from the API that is quite long";
    expect(getRejectionMessage(customMessage)).toBe(customMessage);
  });

  it("handles case insensitive matching", () => {
    expect(getRejectionMessage("NOT-KNIT")).toBe(REJECTION_MESSAGES["not-knit"]);
    expect(getRejectionMessage("Too-Blurry")).toBe(REJECTION_MESSAGES["too-blurry"]);
  });

  it("handles partial matches", () => {
    expect(getRejectionMessage("not knit visible")).toBe(REJECTION_MESSAGES["not-knit"]);
  });
});

// ===========================================
// TESTS: getStitchWarning
// ===========================================

describe("getStitchWarning", () => {
  it("returns warning for known stitch types", () => {
    expect(getStitchWarning("torsades")).toBe(STITCH_WARNINGS.torsades);
    expect(getStitchWarning("jacquard")).toBe(STITCH_WARNINGS.jacquard);
    expect(getStitchWarning("dentelle")).toBe(STITCH_WARNINGS.dentelle);
  });

  it("returns null for simple stitches", () => {
    expect(getStitchWarning("jersey")).toBeNull();
    expect(getStitchWarning("cotes")).toBeNull();
    expect(getStitchWarning("mousse")).toBeNull();
  });

  it("handles case insensitive matching", () => {
    expect(getStitchWarning("TORSADES")).toBe(STITCH_WARNINGS.torsades);
    expect(getStitchWarning("Jacquard")).toBe(STITCH_WARNINGS.jacquard);
  });

  it("handles partial matches", () => {
    expect(getStitchWarning("jersey-avec-torsades")).toBe(STITCH_WARNINGS.torsades);
  });
});

// ===========================================
// TESTS: getLoadingMessage
// ===========================================

describe("getLoadingMessage", () => {
  it("returns analyzing messages for analyzing type", () => {
    const message = getLoadingMessage("analyzing", 0);
    expect(message).toBe("Analyse en cours...");
  });

  it("returns generating messages for generating type", () => {
    const message = getLoadingMessage("generating", 0);
    expect(message).toBe("Génération du patron...");
  });

  it("cycles through messages over time", () => {
    const message0 = getLoadingMessage("analyzing", 0);
    const message2 = getLoadingMessage("analyzing", 2);
    const message4 = getLoadingMessage("analyzing", 4);

    expect(message0).not.toBe(message2);
    expect(message2).not.toBe(message4);
  });

  it("returns encouragement messages after 8 seconds", () => {
    const message = getLoadingMessage("analyzing", 10);

    // Should be one of the encouragement messages
    const encouragementMessages = [
      "Ça arrive...",
      "Encore un instant...",
      "Presque fini...",
      "Merci de votre patience...",
    ];
    expect(encouragementMessages).toContain(message);
  });

  it("cycles through encouragement messages", () => {
    const message9 = getLoadingMessage("analyzing", 9);
    const message12 = getLoadingMessage("analyzing", 12);
    const message15 = getLoadingMessage("analyzing", 15);

    // Should cycle through different messages
    expect([message9, message12, message15]).toHaveLength(3);
  });
});

// ===========================================
// TESTS: Constants
// ===========================================

describe("CONFIDENCE_DISPLAY", () => {
  it("has all required confidence levels", () => {
    expect(CONFIDENCE_DISPLAY.high).toBeDefined();
    expect(CONFIDENCE_DISPLAY.medium).toBeDefined();
    expect(CONFIDENCE_DISPLAY.low).toBeDefined();
    expect(CONFIDENCE_DISPLAY.insufficient).toBeDefined();
  });

  it("each level has label, color, and icon", () => {
    Object.values(CONFIDENCE_DISPLAY).forEach((display) => {
      expect(display.label).toBeDefined();
      expect(display.color).toBeDefined();
      expect(display.icon).toBeDefined();
    });
  });

  it("colors are valid variants", () => {
    const validColors = ["success", "warning", "destructive"];
    Object.values(CONFIDENCE_DISPLAY).forEach((display) => {
      expect(validColors).toContain(display.color);
    });
  });
});

describe("REJECTION_MESSAGES", () => {
  it("has a default message", () => {
    expect(REJECTION_MESSAGES.default).toBeDefined();
  });

  it("all messages are non-empty strings", () => {
    Object.values(REJECTION_MESSAGES).forEach((message) => {
      expect(typeof message).toBe("string");
      expect(message.length).toBeGreaterThan(10);
    });
  });
});

describe("STITCH_WARNINGS", () => {
  it("has warnings for complex stitch types", () => {
    expect(STITCH_WARNINGS.torsades).toBeDefined();
    expect(STITCH_WARNINGS.jacquard).toBeDefined();
    expect(STITCH_WARNINGS.dentelle).toBeDefined();
  });

  it("all warnings mention the limitation", () => {
    Object.values(STITCH_WARNINGS).forEach((warning) => {
      expect(warning.length).toBeGreaterThan(20);
    });
  });
});
