"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUploader } from "@/components/ImageUploader";
import { ResumeProjectDialog } from "@/components/ResumeProjectDialog";
import { useLaMailleStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { clearProject } from "@/lib/storage";

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setImages, setAnalysisLoading, analysisLoading } = useLaMailleStore();

  // Reset loading state when returning to home page (prevents stuck disabled button)
  useEffect(() => {
    if (analysisLoading) {
      setAnalysisLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImagesSelected = async (files: File[], previews: string[]) => {
    try {
      // Clear any previous project when starting new
      clearProject();
      setImages(files, previews);
      setAnalysisLoading(true);

      // Wait for Zustand persist to flush to sessionStorage before navigation
      await new Promise(resolve => setTimeout(resolve, 100));

      router.push("/analyse");
    } catch (err) {
      console.error("[Home] Error in handleImagesSelected:", err);
      // Even if persist fails, force navigation with in-memory state
      setAnalysisLoading(true);
      router.push("/analyse");
    }
  };

  return (
    <div>
      {/* Resume Project Dialog */}
      <ResumeProjectDialog />

      {/* HERO SECTION */}
      <section className="text-center py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 text-balance">
            {t("homeTitle")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("homeSubtitle")}
          </p>
        </div>
      </section>

      {/* ZONE UPLOAD */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-2xl">
          <ImageUploader
            onImagesSelected={handleImagesSelected}
            isLoading={analysisLoading}
          />
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-3xl text-center mb-12">
            {t("homeHowItWorks")}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <StepCard
              emoji="📸"
              step={1}
              stepLabel={t("step")}
              title={t("step1Title")}
              description={t("step1Desc")}
            />
            <StepCard
              emoji="🔍"
              step={2}
              stepLabel={t("step")}
              title={t("step2Title")}
              description={t("step2Desc")}
            />
            <StepCard
              emoji="📏"
              step={3}
              stepLabel={t("step")}
              title={t("step3Title")}
              description={t("step3Desc")}
            />
            <StepCard
              emoji="🧶"
              step={4}
              stepLabel={t("step")}
              title={t("step4Title")}
              description={t("step4Desc")}
            />
          </div>
        </div>
      </section>

      {/* SECTION HONNETETE */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-12">
                {/* Ce que je sais faire */}
                <div>
                  <h3 className="font-serif text-xl mb-6">{t("whatICanDo")}</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-success mt-0.5" aria-hidden="true">✓</span>
                      <span>{t("basicSweaters")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-success mt-0.5" aria-hidden="true">✓</span>
                      <span>{t("basicStitches")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-success mt-0.5" aria-hidden="true">✓</span>
                      <span>{t("adaptedCalcs")}</span>
                    </li>
                  </ul>
                </div>

                {/* Mes limites */}
                <div>
                  <h3 className="font-serif text-xl mb-6">{t("myLimits")}</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-warning mt-0.5" aria-hidden="true">!</span>
                      <span>{t("cablesLimit")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-warning mt-0.5" aria-hidden="true">!</span>
                      <span>{t("colorworkLimit")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-destructive mt-0.5" aria-hidden="true">✗</span>
                      <span>{t("laceLimit")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-destructive mt-0.5" aria-hidden="true">✗</span>
                      <span>{t("experimentalLimit")}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function StepCard({
  emoji,
  step,
  stepLabel,
  title,
  description,
}: {
  emoji: string;
  step: number;
  stepLabel: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="flex items-start gap-4">
        <span className="text-3xl" aria-hidden="true">{emoji}</span>
        <div>
          <div className="text-sm text-muted-foreground mb-1">
            {stepLabel} {step}
          </div>
          <h3 className="font-serif font-medium mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
