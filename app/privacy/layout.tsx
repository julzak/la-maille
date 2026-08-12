import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How La Maille handles your data. Learn about our privacy practices, data collection, and your GDPR rights.",
  alternates: {
    canonical: "https://la-maille.com/privacy",
    languages: {
      en: "https://la-maille.com/privacy",
      fr: "https://la-maille.com/fr/privacy",
      "x-default": "https://la-maille.com/privacy",
    },
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
