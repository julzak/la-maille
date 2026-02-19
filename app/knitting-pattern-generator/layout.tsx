import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Knitting Pattern Generator | Photo to Pattern",
  description:
    "Turn any sweater or cardigan photo into a custom knitting pattern. Get row-by-row instructions adapted to your gauge. Free AI-powered pattern generator.",
  alternates: {
    canonical: "https://la-maille.com/knitting-pattern-generator",
  },
};

export default function KnittingPatternGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How does the AI knitting pattern generator work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Upload a photo of any knitted garment. Our AI analyzes the construction, stitch pattern, and proportions, then generates a complete knitting pattern with row-by-row instructions adapted to your gauge and measurements.",
                },
              },
              {
                "@type": "Question",
                name: "Is the knitting pattern generator free?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, La Maille is free to use. You can upload photos and generate custom knitting patterns at no cost.",
                },
              },
              {
                "@type": "Question",
                name: "What types of garments can I generate patterns for?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "La Maille works best with basic sweaters, pullovers, cardigans, and vests. It handles stockinette, ribbing, and garter stitch patterns. Complex lace and colorwork designs are not yet supported.",
                },
              },
              {
                "@type": "Question",
                name: "Do I need to know my gauge?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, you'll need your stitch gauge (stitches and rows per 10cm/4 inches) to get accurate patterns. Always knit a swatch first with your chosen yarn and needles.",
                },
              },
              {
                "@type": "Question",
                name: "Are the generated patterns tested?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The patterns are AI-generated estimates based on image analysis. They provide a solid working base but may need adjustments. We recommend verifying calculations and always knitting a gauge swatch.",
                },
              },
              {
                "@type": "Question",
                name: "What photo works best for pattern generation?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "A well-lit front view of the garment works best. Lay it flat or photograph it on a hanger. Avoid angles, folds, or busy backgrounds. The clearer the photo, the better the analysis.",
                },
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
