import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "LA MAILLE — Your French Knitting Studio",
  description: "Turn any knit photo into a custom pattern. Upload, measure, knit.",
  keywords: "knitting, pattern, sweater, cardigan, custom, French, tricot, patron",
  openGraph: {
    title: "LA MAILLE — Your French Knitting Studio",
    description: "Turn any knit photo into a custom pattern. Upload, measure, knit.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LA MAILLE — Your French Knitting Studio",
    description: "Turn any knit photo into a custom pattern.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "font-sans",
            duration: 4000,
          }}
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
