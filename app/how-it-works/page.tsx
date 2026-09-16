"use client";

import Link from "next/link";
import { ArrowRight, Camera, Lightbulb, CheckCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function HowItWorksPage() {
  const { t, language } = useTranslation();

  const homeHref = language === "fr" ? "/fr" : "/";
  const generatorHref =
    language === "fr" ? "/fr/knitting-pattern-generator" : "/knitting-pattern-generator";

  return (
    <div>
      {/* HERO */}
      <section className="text-center py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 text-balance">
            {t("howItWorks.heroTitle")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("howItWorks.heroSubtitle")}
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
                {t("howItWorks.step1Title")}
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {t("howItWorks.step1Desc")}
              </p>
              <div className="bg-muted/50 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">
                    {t("howItWorks.step1TipsTitle")}
                  </span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{t("howItWorks.step1Tip1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{t("howItWorks.step1Tip2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{t("howItWorks.step1Tip3")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{t("howItWorks.step1Tip4")}</span>
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
                {t("howItWorks.step2Title")}
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {t("howItWorks.step2Desc")}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  t("howItWorks.step2Item1"),
                  t("howItWorks.step2Item2"),
                  t("howItWorks.step2Item3"),
                  t("howItWorks.step2Item4"),
                  t("howItWorks.step2Item5"),
                  t("howItWorks.step2Item6"),
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
                {t("howItWorks.step2Note")}
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
                {t("howItWorks.step3Title")}
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {t("howItWorks.step3Desc")}
              </p>
              <div className="bg-muted/50 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">
                    {t("howItWorks.step3NeedTitle")}
                  </span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>
                    <strong>{t("howItWorks.step3GaugeLabel")}</strong>{" "}
                    {t("howItWorks.step3GaugeDesc")}
                  </li>
                  <li>
                    <strong>{t("howItWorks.step3ChestLabel")}</strong>{" "}
                    {t("howItWorks.step3ChestDesc")}
                  </li>
                  <li>
                    <strong>{t("howItWorks.step3LengthLabel")}</strong>{" "}
                    {t("howItWorks.step3LengthDesc")}
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
                {t("howItWorks.step4Title")}
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {t("howItWorks.step4Desc")}
              </p>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary" aria-hidden="true">
                    ✓
                  </span>
                  <span>{t("howItWorks.step4Item1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary" aria-hidden="true">
                    ✓
                  </span>
                  <span>{t("howItWorks.step4Item2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary" aria-hidden="true">
                    ✓
                  </span>
                  <span>{t("howItWorks.step4Item3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary" aria-hidden="true">
                    ✓
                  </span>
                  <span>{t("howItWorks.step4Item4")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary" aria-hidden="true">
                    ✓
                  </span>
                  <span>{t("howItWorks.step4Item5")}</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground">
                {t("howItWorks.step4Note")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TIPS */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl text-center mb-12">
            {t("howItWorks.tipsTitle")}
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-serif font-medium mb-2">
                {t("howItWorks.tip1Title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("howItWorks.tip1Desc")}
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-serif font-medium mb-2">
                {t("howItWorks.tip2Title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("howItWorks.tip2Desc")}
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-serif font-medium mb-2">
                {t("howItWorks.tip3Title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("howItWorks.tip3Desc")}
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-serif font-medium mb-2">
                {t("howItWorks.tip4Title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("howItWorks.tip4Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl mb-4">
            {t("howItWorks.ctaTitle")}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t("howItWorks.ctaSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={homeHref}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("seo.uploadPhoto")}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={generatorHref}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              {t("howItWorks.ctaLearnMore")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
