"use client";

import { ImageUploader } from "@/components/ImageUploader";
import { useStartAnalysis } from "@/hooks/useStartAnalysis";
import { trackEvent } from "@/lib/analytics";
import type { Language } from "@/lib/i18n/detect";

/**
 * Encart d'upload inline pour les articles de blog EN a plus fort trafic :
 * meme cadre visuel que BlogInlineCta, mais avec le vrai dropzone de la home
 * au lieu d'un simple lien vers la page produit. Mesure GA4 sept. 2026 : le
 * CTA texte (10 clics / 578 sessions sur 30 j) ne convertit quasiment pas ;
 * la visiteuse doit pouvoir envoyer sa photo directement depuis l'article.
 * Copy EN uniquement pour ce lot (voir INLINE_UPLOADER_SLUGS dans
 * BlogArticleView.tsx).
 */
export function BlogInlineUploader({ lang, slug }: { lang: Language; slug: string }) {
  const { startAnalysis, analysisLoading } = useStartAnalysis();

  const handleImagesSelected = (files: File[], previews: string[]) => {
    trackEvent("blog_upload_start", { slug, lang });
    startAnalysis(files, previews);
  };

  return (
    <aside
      className="my-10 rounded-xl border border-primary/20 bg-primary/5 p-5 md:p-6"
      aria-label="Try it with your own sweater photo"
    >
      <p className="font-serif text-xl md:text-2xl mb-2 text-foreground">
        Try it with your own sweater photo
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        Upload a photo, enter your gauge and measurements, and get row-by-row
        instructions sized for you. Free, no account needed.
      </p>
      <ImageUploader onImagesSelected={handleImagesSelected} isLoading={analysisLoading} />
    </aside>
  );
}
