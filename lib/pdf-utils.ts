import type { GeneratedPattern, GarmentAnalysis } from "@/lib/types";
import { GARMENT_TYPE_LABELS } from "@/lib/types";

interface GeneratePDFOptions {
  pattern: GeneratedPattern;
  analysis?: GarmentAnalysis;
  imageUrl?: string;
  language?: "fr" | "en";
}

/**
 * Generate a PDF blob from a pattern
 * Uses dynamic import to avoid SSR issues with @react-pdf/renderer
 */
export async function generatePatternPDF(
  patternOrOptions: GeneratedPattern | GeneratePDFOptions
): Promise<Blob> {
  // Support both old signature (just pattern) and new signature (options object)
  const options: GeneratePDFOptions =
    'pattern' in patternOrOptions
      ? patternOrOptions
      : { pattern: patternOrOptions };

  const { pattern, analysis, imageUrl, language = "fr" } = options;

  // Dynamic imports to avoid SSR issues
  const [{ pdf }, { createElement }, { PatternDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("react"),
    import("@/lib/pdf/PatternDocument"),
  ]);

  // Use analysis from options or from pattern
  const analysisData = analysis || pattern.analysis;

  // Create the PDF document element
  const doc = createElement(PatternDocument, {
    pattern,
    analysis: analysisData,
    imageUrl,
    language,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = await pdf(doc as any).toBlob();
  return blob;
}

/**
 * Generate the filename for a pattern PDF
 */
export function getPatternFilename(pattern: GeneratedPattern): string {
  const garmentType =
    GARMENT_TYPE_LABELS[pattern.analysis.garment.type].toLowerCase();
  const date = new Date(pattern.createdAt).toISOString().split("T")[0];
  return `la-maille-${garmentType}-${date}.pdf`;
}

/**
 * Download a PDF blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Share a PDF using the Web Share API (mobile)
 * Falls back to download if sharing is not available
 */
export async function shareOrDownloadPDF(
  blob: Blob,
  filename: string,
  title: string
): Promise<{ shared: boolean }> {
  // Check if Web Share API is available and supports sharing files
  if (
    typeof navigator !== "undefined" &&
    navigator.share &&
    navigator.canShare
  ) {
    const file = new File([blob], filename, { type: "application/pdf" });

    // Check if we can share this file
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: title,
          text: `Patron de tricot genere avec La Maille`,
          files: [file],
        });
        return { shared: true };
      } catch (error) {
        // User cancelled or share failed, fall back to download
        if ((error as Error).name !== "AbortError") {
          console.error("Share failed:", error);
        }
      }
    }
  }

  // Fall back to download
  downloadBlob(blob, filename);
  return { shared: false };
}

/**
 * Check if the Web Share API with file sharing is available
 */
export function canShareFiles(): boolean {
  if (typeof navigator === "undefined") return false;
  if (!navigator.share || !navigator.canShare) return false;

  // Create a test file to check if file sharing is supported
  try {
    const testFile = new File(["test"], "test.pdf", { type: "application/pdf" });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}
