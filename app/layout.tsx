import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import { UTMCapture } from "@/components/UTMCapture";
import { LocaleSync } from "@/components/LocaleSync";
import { useI18n } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { seoMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const lang = getRequestLocale();
  const m = seoMetadata[lang];
  const homeUrl =
    lang === "fr" ? "https://la-maille.com/fr" : "https://la-maille.com/";

  return {
    metadataBase: new URL("https://la-maille.com"),
    title: {
      default: m.title,
      template: m.titleTemplate,
    },
    description: m.description,
    keywords: m.keywords,
    alternates: {
      canonical: homeUrl,
      languages: {
        en: "https://la-maille.com/",
        fr: "https://la-maille.com/fr",
        "x-default": "https://la-maille.com/",
      },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      type: "website",
      url: homeUrl,
      siteName: m.siteName,
      locale: m.ogLocale,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: m.ogAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.twitterDescription,
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = getRequestLocale();
  const m = seoMetadata[lang];

  // SSR: hydrate the singleton store so Client Components rendered on the
  // server use the correct language. The browser resolves the same locale
  // (URL first, then cookie), so SSR HTML matches the first client render.
  if (typeof window === "undefined") {
    useI18n.setState({ language: lang });
  }

  return (
    <html lang={lang}>
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
                description: m.applicationDescription,
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
        <LocaleSync />
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
