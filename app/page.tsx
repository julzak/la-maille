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
      <section className="text-center py-8 md:py-16 lg:py-24 px-4">
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
      <section className="px-4 pb-8 md:pb-12">
        <div className="container mx-auto max-w-2xl">
          <ImageUploader
            onImagesSelected={handleImagesSelected}
            isLoading={analysisLoading}
          />
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-6 md:py-8 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <p className="text-sm text-muted-foreground">
            🧶 Join <span className="font-medium text-foreground">100+ knitters</span> who use La Maille — <span className="font-medium text-foreground">free while in beta</span>
          </p>
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section className="py-12 md:py-20 px-4 bg-muted/30">
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

      {/* SEE IT IN ACTION */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-3xl text-center mb-12">
            See it in action
          </h2>
          <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-start">
            {/* Your photo */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3 text-center">Your photo</p>
              <div className="aspect-[4/5] rounded-xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-4 p-8">
                <span className="text-6xl" aria-hidden="true">📸</span>
                <div className="text-center">
                  <p className="font-serif text-lg mb-1">Upload any sweater photo</p>
                  <p className="text-sm text-muted-foreground">Front view, well-lit</p>
                </div>
              </div>
            </div>

            {/* Your pattern */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3 text-center">Your pattern</p>
              <div className="aspect-[4/5] rounded-xl border border-border bg-card p-6 md:p-8 flex flex-col">
                <div className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">La Maille — Custom Pattern</div>
                <div className="font-mono text-xs md:text-sm text-muted-foreground space-y-3 flex-1">
                  <p><span className="text-foreground font-medium">Cast on</span> 84 stitches on circular needles.</p>
                  <p><span className="text-foreground font-medium">Rows 1-20:</span> *K2, P2* ribbing</p>
                  <p><span className="text-foreground font-medium">Row 21:</span> Knit all stitches (stockinette)</p>
                  <p><span className="text-foreground font-medium">Continue</span> in stockinette for 38 cm</p>
                  <p className="text-primary">↓ Armhole shaping</p>
                  <p><span className="text-foreground font-medium">Next row:</span> Bind off 4 sts, knit to end</p>
                  <p><span className="text-foreground font-medium">Dec row:</span> K1, SSK, knit to last 3 sts, K2tog, K1</p>
                  <p className="text-muted-foreground/50">...</p>
                </div>
                <div className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
                  Adapted to your gauge &amp; measurements
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6 md:hidden">
            📸 → 🧶 From photo to pattern
          </p>
        </div>
      </section>

      {/* SECTION HONNETETE - redesigned */}
      <section className="py-12 md:py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 md:p-10">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
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

                {/* Coming soon */}
                <div className="opacity-75">
                  <h3 className="font-serif text-lg mb-6">{t("myLimits")}</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5" aria-hidden="true">🔜</span>
                      <span>{t("cablesLimit")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5" aria-hidden="true">🔜</span>
                      <span>{t("colorworkLimit")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5" aria-hidden="true">🔜</span>
                      <span>{t("laceLimit")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5" aria-hidden="true">🔜</span>
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
