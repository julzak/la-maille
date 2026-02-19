import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://la-maille.com"),
  title: {
    default: "Photo to Knitting Pattern Generator | La Maille",
    template: "%s | La Maille",
  },
  description:
    "Upload any sweater or cardigan photo and get a custom knitting pattern with row-by-row instructions. Free AI-powered pattern generator.",
  keywords: [
    "knitting pattern generator",
    "photo to knitting pattern",
    "custom knitting pattern",
    "sweater pattern",
    "cardigan pattern",
    "AI knitting",
    "knit pattern from photo",
  ],
  alternates: {
    canonical: "https://la-maille.com",
  },
  openGraph: {
    title: "Photo to Knitting Pattern Generator | La Maille",
    description:
      "Upload any sweater or cardigan photo and get a custom knitting pattern with row-by-row instructions. Free AI-powered pattern generator.",
    type: "website",
    url: "https://la-maille.com",
    siteName: "La Maille",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "La Maille - Photo to Knitting Pattern Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Photo to Knitting Pattern Generator | La Maille",
    description:
      "Upload any sweater or cardigan photo and get a custom knitting pattern. Free AI-powered generator.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
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
        <link rel="apple-touch-icon" href="/logo-lamaille-120.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "La Maille",
                url: "https://la-maille.com",
                description:
                  "Upload any sweater or cardigan photo and get a custom knitting pattern with row-by-row instructions.",
                applicationCategory: "DesignApplication",
                operatingSystem: "Web",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "La Maille",
                url: "https://la-maille.com",
                logo: "https://la-maille.com/logo-lamaille-120.png",
                email: "hello@la-maille.com",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Paris",
                  addressCountry: "FR",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "HowTo",
                name: "How to generate a knitting pattern from a photo",
                description:
                  "Turn any knit photo into a custom knitting pattern in 4 simple steps.",
                step: [
                  {
                    "@type": "HowToStep",
                    position: 1,
                    name: "Upload your inspiration",
                    text: "Take or upload a front view photo of the garment, well-lit.",
                  },
                  {
                    "@type": "HowToStep",
                    position: 2,
                    name: "La Maille reads the knit",
                    text: "AI identifies the shape, proportions and stitches of the garment.",
                  },
                  {
                    "@type": "HowToStep",
                    position: 3,
                    name: "Enter your measurements",
                    text: "Provide your chest circumference, desired length, and your gauge.",
                  },
                  {
                    "@type": "HowToStep",
                    position: 4,
                    name: "Get your custom pattern",
                    text: "Receive row-by-row knitting instructions adapted to your measurements.",
                  },
                ],
              },
            ]),
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <AuthProvider>
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
        </AuthProvider>
      </body>
    </html>
  );
}
