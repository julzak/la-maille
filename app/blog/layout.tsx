import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knitting Tips & Guides",
  description:
    "Learn how to turn your favorite sweaters into custom knitting patterns. Tips, guides, and tutorials from La Maille.",
  alternates: {
    canonical: "https://la-maille.com/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
