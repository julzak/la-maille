"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useLaMailleStore } from "@/lib/store";
import { clearProject } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import { getTranslation, type TranslationKey } from "@/lib/i18n";
import type { GarmentAnalysis } from "@/lib/types";
import type { Language } from "@/lib/i18n/detect";

/**
 * Encart « Tricotez ce modele a votre taille » des articles de BLOG_PRESETS
 * (lib/blog-presets.ts) : charge l'analyse fixe du modele de l'article puis
 * enchaine sur /analyse (choix de taille) et /patron, sans photo. Ce chemin
 * ne passe pas par /api/analyze, donc pas par la table generations :
 * mesure via l'event GA4 preset_start.
 */
export function BlogPresetCta({
  lang,
  slug,
  analysis,
}: {
  lang: Language;
  slug: string;
  analysis: GarmentAnalysis;
}) {
  const router = useRouter();
  const t = (key: TranslationKey) => getTranslation(lang, key);

  const handleClick = async () => {
    trackEvent("preset_start", { slug, lang, garment_type: analysis.garment.type });
    clearProject();
    const store = useLaMailleStore.getState();
    store.resetAll();
    store.setAnalysis(analysis);
    // Laisse le persist middleware ecrire dans sessionStorage avant la navigation
    await new Promise((resolve) => setTimeout(resolve, 100));
    router.push("/analyse");
  };

  return (
    <aside
      className="my-10 rounded-xl border border-primary/20 bg-primary/5 p-5 md:p-6"
      aria-label={t("blogPresetTitle")}
    >
      <p className="text-xs uppercase tracking-wide text-primary font-medium mb-1">
        {t("blogPresetKicker")}
      </p>
      <p className="font-serif text-xl md:text-2xl mb-2 text-foreground">
        {t("blogPresetTitle")}
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        {t(analysis.garment.type === "cardigan" ? "blogPresetTextCardigan" : "blogPresetTextPull")}
      </p>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        {t("blogPresetButton")}
        <ArrowRight className="w-4 h-4" />
      </button>
    </aside>
  );
}
