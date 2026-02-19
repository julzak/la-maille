import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo to Knitting Pattern | Turn Any Sweater into Instructions",
  description:
    "Upload a photo of any knitted garment and get a complete custom pattern. Row-by-row instructions adapted to your gauge and measurements.",
  alternates: {
    canonical: "https://la-maille.com/photo-to-knitting-pattern",
  },
};

export default function PhotoToKnittingPatternLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
