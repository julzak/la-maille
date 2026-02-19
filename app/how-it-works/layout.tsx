import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Create a Knitting Pattern from a Photo",
  description:
    "Learn how to turn any sweater photo into a custom knitting pattern in 4 simple steps. Upload, measure, and get row-by-row instructions.",
  alternates: {
    canonical: "https://la-maille.com/how-it-works",
  },
};

export default function HowItWorksLayout({
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
            "@type": "HowTo",
            name: "How to Create a Knitting Pattern from Any Photo",
            description:
              "Turn any knitted garment photo into a custom pattern with row-by-row instructions using La Maille's AI pattern generator.",
            totalTime: "PT5M",
            tool: [
              { "@type": "HowToTool", name: "A photo of a knitted garment" },
              { "@type": "HowToTool", name: "Your body measurements" },
              { "@type": "HowToTool", name: "Your knitting gauge" },
            ],
            step: [
              {
                "@type": "HowToStep",
                position: 1,
                name: "Upload your photo",
                text: "Take or upload a clear, well-lit front view of the knitted garment you want to recreate. Lay it flat or photograph it on a hanger for best results.",
              },
              {
                "@type": "HowToStep",
                position: 2,
                name: "AI analyzes the garment",
                text: "La Maille's AI reads your photo and identifies the garment type, construction method, stitch pattern, neckline, sleeve style, and proportions.",
              },
              {
                "@type": "HowToStep",
                position: 3,
                name: "Enter your measurements and gauge",
                text: "Provide your chest circumference, desired length, and knitting gauge (stitches and rows per 10cm). This ensures the pattern fits you perfectly.",
              },
              {
                "@type": "HowToStep",
                position: 4,
                name: "Get your custom pattern",
                text: "Receive a complete knitting pattern with row-by-row instructions, adapted to your measurements and gauge. Print it or save it to your account.",
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
