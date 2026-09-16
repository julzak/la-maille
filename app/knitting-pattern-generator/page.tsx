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
  const { t, language } = useTranslation();
  const { setImages, setAnalysisLoading, analysisLoading } = useLaMailleStore();

  const homeHref = language === "fr" ? "/fr" : "/";
  const howItWorksHref = language === "fr" ? "/fr/how-it-works" : "/how-it-works";
  const blogHref = language === "fr" ? "/fr/blog" : "/blog";
  const articleHref = (slug: string) =>
    language === "fr" ? `/fr/blog/${slug}` : `/blog/${slug}`;

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
            {t("generator.heroTitle")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {t("generator.heroSubtitle")}
          </p>
          <div className="max-w-2xl mx-auto">
            <ImageUploader
              onImagesSelected={handleImagesSelected}
              isLoading={analysisLoading}
            />
          </div>
          {/* Reponse directe (GEO) : une definition citable par Google et les assistants IA */}
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mt-10 text-left md:text-center">
            <strong className="text-foreground">
              {t("generator.geoLeadStrong")}
            </strong>{" "}
            {t("generator.geoLeadRest")}
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-3xl text-center mb-4">
            {t("generator.howItWorksTitle")}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t("generator.stepsIntro")}{" "}
            <Link
              href={howItWorksHref}
              className="text-primary hover:underline"
            >
              {t("generator.seeDetailedGuide")}
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
            {t("generator.differentTitle")}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t("generator.differentSubtitle")}
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg mb-2">
                {t("generator.card1Title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("generator.card1Desc")}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Ruler className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg mb-2">
                {t("generator.card2Title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("generator.card2Desc")}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg mb-2">
                {t("generator.card3Title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("generator.card3Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU CAN CREATE */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-3xl text-center mb-12">
            {t("generator.createTitle")}
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t("generator.garmentPullovers"), icon: "🧶" },
              { label: t("generator.garmentCardigans"), icon: "🧥" },
              { label: t("generator.garmentVests"), icon: "🦺" },
              { label: t("generator.garmentTops"), icon: "👕" },
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
            {t("generator.createNote")}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl text-center mb-12">
            {t("generator.faqTitle")}
          </h2>
          <div className="space-y-6">
            {[
              { q: t("generator.faq1Q"), a: t("generator.faq1A") },
              { q: t("generator.faq2Q"), a: t("generator.faq2A") },
              { q: t("generator.faq3Q"), a: t("generator.faq3A") },
              { q: t("generator.faq4Q"), a: t("generator.faq4A") },
              { q: t("generator.faq5Q"), a: t("generator.faq5A") },
              { q: t("generator.faq6Q"), a: t("generator.faq6A") },
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

      {/* RELATED ARTICLES */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl text-center mb-3">
            {t("generator.learnMoreTitle")}
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            {t("generator.learnMoreSubtitle")}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { slug: "how-to-recreate-sweater-from-photo", title: t("generator.article1") },
              { slug: "best-yarn-for-first-sweater", title: t("generator.article2") },
              { slug: "raglan-vs-set-in-sleeves-which-to-choose", title: t("generator.article3") },
              { slug: "blocking-knitted-sweater", title: t("generator.article4") },
              { slug: "knitting-in-the-round-vs-flat", title: t("generator.article5") },
              { slug: "cable-knit-sweater-pattern", title: t("generator.article6") },
            ].map(({ slug, title }) => (
              <Link
                key={slug}
                href={articleHref(slug)}
                className="group block bg-card rounded-lg border border-border p-5 hover:border-primary/40 transition-colors"
              >
                <h3 className="font-serif text-sm font-medium group-hover:text-primary transition-colors">
                  {title}
                </h3>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href={blogHref}
              className="text-sm text-primary hover:underline"
            >
              {t("generator.viewAllArticles")}
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl mb-4">
            {t("generator.finalCtaTitle")}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t("generator.finalCtaSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={homeHref}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("seo.tryFree")}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={howItWorksHref}
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
