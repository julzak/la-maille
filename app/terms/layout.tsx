import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of service for La Maille, the AI-powered knitting pattern generator. Read about usage rights and limitations.",
  alternates: {
    canonical: "https://la-maille.com/terms",
    languages: {
      en: "https://la-maille.com/terms",
      fr: "https://la-maille.com/fr/terms",
      "x-default": "https://la-maille.com/terms",
    },
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
