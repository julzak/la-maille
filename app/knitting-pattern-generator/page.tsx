"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles, Ruler, BookOpen } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { useLaMailleStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { clearProject } from "@/lib/storage";

export default function KnittingPatternGeneratorPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setImages, setAnalysisLoading, analysisLoading } = useLaMailleStore();

  const handleImagesSelected = async (files: File[], previews: string[]) => {
    clearProject();
    setImages(files, previews);
    setAnalysisLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 100));
    router.push("/analyse");
  };

  return (
    <div>
      {/* HERO */}
      <section className="text-center py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 text-balance">
            AI Knitting Pattern Generator
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Turn any photo into a custom knitting pattern with row-by-row
            instructions — adapted to your gauge and measurements.
          </p>
          <div className="max-w-2xl mx-auto">
            <ImageUploader
              onImagesSelected={handleImagesSelected}
              isLoading={analysisLoading}
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-3xl text-center mb-4">
            How It Works
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            From photo to pattern in 4 simple steps.{" "}
            <Link
              href="/how-it-works"
              className="text-primary hover:underline"
            >
              See the detailed guide
            </Link>
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                emoji: "📸",
                step: 1,
                title: t("step1Title"),
                desc: t("step1Desc"),
              },
              {
                emoji: "🔍",
                step: 2,
                title: t("step2Title"),
                desc: t("step2Desc"),
              },
              {
                emoji: "📏",
                step: 3,
                title: t("step3Title"),
                desc: t("step3Desc"),
              },
              {
                emoji: "🧶",
                step: 4,
                title: t("step4Title"),
                desc: t("step4Desc"),
              },
            ].map(({ emoji, step, title, desc }) => (
              <div
                key={step}
                className="bg-card rounded-lg p-6 border border-border"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl" aria-hidden="true">
                    {emoji}
                  </span>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {t("step")} {step}
                    </div>
                    <h3 className="font-serif font-medium mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT MAKES LA MAILLE DIFFERENT */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-3xl text-center mb-4">
            What Makes La Maille Different
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Most &quot;knitting pattern generators&quot; online are actually
            color chart tools — they turn a photo into a pixel grid for
            colorwork. La Maille does something completely different.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg mb-2">
                Complete Patterns, Not Charts
              </h3>
              <p className="text-sm text-muted-foreground">
                Get full row-by-row instructions — cast on, shaping, neckline,
                sleeves, bind off. Everything you need to knit the garment from
                start to finish.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Ruler className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg mb-2">
                Adapted to Your Gauge
              </h3>
              <p className="text-sm text-muted-foreground">
                Every pattern is calculated from your actual stitch gauge and
                body measurements. No more guessing or rescaling — the math is
                done for you.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg mb-2">
                Reads the Construction
              </h3>
              <p className="text-sm text-muted-foreground">
                The AI identifies construction method (top-down, bottom-up),
                neckline type, sleeve style, and stitch pattern — not just
                colors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU CAN CREATE */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-3xl text-center mb-12">
            What You Can Create
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Pullovers", icon: "🧶" },
              { label: "Cardigans", icon: "🧥" },
              { label: "Vests", icon: "🦺" },
              { label: "Sleeveless tops", icon: "👕" },
            ].map(({ label, icon }) => (
              <div
                key={label}
                className="bg-card rounded-lg p-5 border border-border text-center"
              >
                <span className="text-2xl mb-2 block" aria-hidden="true">
                  {icon}
                </span>
                <span className="font-medium text-sm">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Works with stockinette, ribbing, and garter stitch. Complex lace and
            colorwork designs are coming soon.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "How does the AI knitting pattern generator work?",
                a: "Upload a photo of any knitted garment. Our AI analyzes the construction, stitch pattern, and proportions, then generates a complete knitting pattern with row-by-row instructions adapted to your gauge and measurements.",
              },
              {
                q: "Is the knitting pattern generator free?",
                a: "Yes, La Maille is free to use. You can upload photos and generate custom knitting patterns at no cost.",
              },
              {
                q: "What types of garments can I generate patterns for?",
                a: "La Maille works best with basic sweaters, pullovers, cardigans, and vests. It handles stockinette, ribbing, and garter stitch patterns. Complex lace and colorwork designs are not yet supported.",
              },
              {
                q: "Do I need to know my gauge?",
                a: "Yes, you'll need your stitch gauge (stitches and rows per 10cm/4 inches) to get accurate patterns. Always knit a swatch first with your chosen yarn and needles.",
              },
              {
                q: "Are the generated patterns tested?",
                a: "The patterns are AI-generated estimates based on image analysis. They provide a solid working base but may need adjustments. We recommend verifying calculations and always knitting a gauge swatch.",
              },
              {
                q: "What photo works best for pattern generation?",
                a: "A well-lit front view of the garment works best. Lay it flat or photograph it on a hanger. Avoid angles, folds, or busy backgrounds. The clearer the photo, the better the analysis.",
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="group bg-card rounded-lg border border-border"
              >
                <summary className="cursor-pointer p-5 font-medium flex items-center justify-between">
                  {q}
                  <ArrowRight className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90 shrink-0 ml-4" />
                </summary>
                <p className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl mb-4">
            Ready to Create Your Pattern?
          </h2>
          <p className="text-muted-foreground mb-8">
            Upload a photo of any sweater or cardigan and get your custom pattern
            in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("seo.tryFree")}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              {t("seo.learnHow")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
