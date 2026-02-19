"use client";

import Link from "next/link";
import { ArrowRight, Camera, Lightbulb, CheckCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function HowItWorksPage() {
  const { t } = useTranslation();

  return (
    <div>
      {/* HERO */}
      <section className="text-center py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 text-balance">
            How to Create a Knitting Pattern from Any Photo
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            See something you love? Upload a photo and get a complete knitting
            pattern in minutes — here&apos;s how.
          </p>
        </div>
      </section>

      {/* STEPS */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl space-y-16">
          {/* Step 1 */}
          <div className="flex gap-6 md:gap-10">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold">
                1
              </div>
              <div className="w-px flex-1 bg-border mt-2" />
            </div>
            <div className="pb-8">
              <h2 className="font-serif text-2xl mb-3">
                Upload Your Photo
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Take a photo of any knitted garment you want to recreate — a
                sweater, cardigan, vest, or pullover. You can upload up to 5
                images to give the AI more angles to work with.
              </p>
              <div className="bg-muted/50 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">
                    Tips for the best results
                  </span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      Front view, well-lit — natural light works best
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      Lay flat on a plain surface or photograph on a hanger
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      Avoid busy backgrounds, wrinkles, or heavy folds
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      Close enough to see the stitch texture if possible
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6 md:gap-10">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold">
                2
              </div>
              <div className="w-px flex-1 bg-border mt-2" />
            </div>
            <div className="pb-8">
              <h2 className="font-serif text-2xl mb-3">
                AI Reads Your Knit
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                La Maille&apos;s AI analyzes your photo and identifies
                everything it can about the garment:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Garment type (pullover, cardigan, vest...)",
                  "Construction method (top-down, bottom-up, in-the-round)",
                  "Neckline style (crew, V-neck, mock neck...)",
                  "Sleeve type (set-in, raglan, drop shoulder...)",
                  "Stitch pattern (stockinette, ribbing, garter...)",
                  "Overall proportions and fit",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="text-primary mt-0.5" aria-hidden="true">
                      ✓
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                You can review and adjust the analysis before generating the
                pattern.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6 md:gap-10">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold">
                3
              </div>
              <div className="w-px flex-1 bg-border mt-2" />
            </div>
            <div className="pb-8">
              <h2 className="font-serif text-2xl mb-3">
                Enter Your Measurements &amp; Gauge
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                This is what makes your pattern truly custom. Enter your body
                measurements and knitting gauge so every stitch count is
                calculated for you.
              </p>
              <div className="bg-muted/50 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">
                    What you&apos;ll need
                  </span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>
                    <strong>Gauge:</strong> Stitches and rows per 10cm (4&quot;)
                    with your chosen yarn and needles
                  </li>
                  <li>
                    <strong>Chest circumference:</strong> Measured around the
                    fullest part
                  </li>
                  <li>
                    <strong>Desired length:</strong> How long you want the
                    finished garment
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-6 md:gap-10">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold">
                4
              </div>
            </div>
            <div>
              <h2 className="font-serif text-2xl mb-3">
                Get Your Custom Pattern
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                La Maille generates a complete knitting pattern with:
              </p>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary" aria-hidden="true">
                    ✓
                  </span>
                  <span>Row-by-row instructions for each piece</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary" aria-hidden="true">
                    ✓
                  </span>
                  <span>Shaping details (increases, decreases, bind-offs)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary" aria-hidden="true">
                    ✓
                  </span>
                  <span>Neckline and sleeve instructions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary" aria-hidden="true">
                    ✓
                  </span>
                  <span>Assembly instructions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary" aria-hidden="true">
                    ✓
                  </span>
                  <span>Print-friendly view</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Save your pattern to your account and access it anytime, or
                print it right away.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TIPS */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl text-center mb-12">
            Tips for Best Results
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-serif font-medium mb-2">
                Always knit a gauge swatch
              </h3>
              <p className="text-sm text-muted-foreground">
                Your gauge is the foundation of the entire pattern. A 10x10cm
                swatch with your actual yarn and needles makes all the
                difference.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-serif font-medium mb-2">
                Review the AI analysis
              </h3>
              <p className="text-sm text-muted-foreground">
                Before generating, check that the AI correctly identified the
                construction, neckline, and sleeves. You can adjust anything
                that looks off.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-serif font-medium mb-2">
                Use clear photos
              </h3>
              <p className="text-sm text-muted-foreground">
                The better the photo, the more accurate the analysis. Front
                view, good lighting, and minimal background noise go a long way.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-serif font-medium mb-2">
                Treat it as a starting point
              </h3>
              <p className="text-sm text-muted-foreground">
                The pattern is an AI-generated estimate. Experienced knitters
                will want to double-check the math and adapt to their style.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl mb-4">
            Ready to Try It?
          </h2>
          <p className="text-muted-foreground mb-8">
            Pick a sweater photo from your camera roll and see what La Maille
            can do.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("seo.uploadPhoto")}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/knitting-pattern-generator"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              Learn more about the generator
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
