"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { useLaMailleStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { clearProject } from "@/lib/storage";

export default function PhotoToKnittingPatternPage() {
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
      {/* HERO + UPLOAD */}
      <section className="text-center py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 text-balance">
            Photo to Knitting Pattern in Minutes
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Upload a photo of any knitted garment and get a complete custom
            pattern — row-by-row instructions adapted to your gauge and
            measurements.
          </p>
          <div className="max-w-2xl mx-auto">
            <ImageUploader
              onImagesSelected={handleImagesSelected}
              isLoading={analysisLoading}
            />
          </div>
        </div>
      </section>

      {/* PERFECT FOR */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-3xl text-center mb-12">
            Perfect For
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                title: "Recreating a favorite sweater",
                desc: "Got a beloved sweater that's wearing out? Upload a photo and get the pattern to knit a new one.",
              },
              {
                title: "Pinterest inspiration",
                desc: "Found a gorgeous knit on Pinterest or Instagram? Turn that photo into actual knitting instructions.",
              },
              {
                title: "Vintage or thrift store finds",
                desc: "Spotted a unique knit at a thrift shop? Snap a photo and recreate it in your preferred yarn.",
              },
              {
                title: "Magazine lookbooks",
                desc: "See a knit in a catalog or magazine? Upload the image and get a pattern to match.",
              },
              {
                title: "Gift knitting",
                desc: 'Someone points at a sweater and says "I want that" — now you can actually make it happen.',
              },
              {
                title: "Learning new constructions",
                desc: "Curious how a garment is built? The AI breaks down the construction so you can learn from it.",
              },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="bg-card rounded-lg p-6 border border-border"
              >
                <h3 className="font-serif font-medium mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - BRIEF */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl mb-8">
            3 Steps. That&apos;s It.
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 mb-8">
            <div className="text-center">
              <span className="text-3xl block mb-2" aria-hidden="true">
                📸
              </span>
              <span className="font-medium text-sm">Upload a photo</span>
            </div>
            <ArrowRight
              className="w-5 h-5 text-muted-foreground hidden md:block"
              aria-hidden="true"
            />
            <span
              className="text-muted-foreground md:hidden"
              aria-hidden="true"
            >
              ↓
            </span>
            <div className="text-center">
              <span className="text-3xl block mb-2" aria-hidden="true">
                📏
              </span>
              <span className="font-medium text-sm">
                Add your measurements
              </span>
            </div>
            <ArrowRight
              className="w-5 h-5 text-muted-foreground hidden md:block"
              aria-hidden="true"
            />
            <span
              className="text-muted-foreground md:hidden"
              aria-hidden="true"
            >
              ↓
            </span>
            <div className="text-center">
              <span className="text-3xl block mb-2" aria-hidden="true">
                🧶
              </span>
              <span className="font-medium text-sm">Get your pattern</span>
            </div>
          </div>
          <Link
            href="/how-it-works"
            className="text-primary hover:underline text-sm"
          >
            See the detailed step-by-step guide →
          </Link>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl mb-4">
            Your Next Project Starts with a Photo
          </h2>
          <p className="text-muted-foreground mb-8">
            No design skills needed. No complicated software. Just a photo and
            your knitting gauge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("seo.getStarted")}
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
