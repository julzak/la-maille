import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import { UTMCapture } from "@/components/UTMCapture";

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
    canonical: "https://la-maille.com/",
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
  verification: {
    google: "33-ejD9qCp7816s-1iwJe1xZsATCkLv9lZn_qmyN5hE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-3BHGQYMQVD"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3BHGQYMQVD');
        `}
      </Script>
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
                email: "contact@la-maille.com",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Paris",
                  addressCountry: "FR",
                },
              },
            ]),
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <UTMCapture />
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
