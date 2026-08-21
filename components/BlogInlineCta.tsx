"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import type { Language } from "@/lib/i18n/detect";

const copy: Record<
  Language,
  { kicker: string; title: string; text: string; button: string; href: string }
> = {
  en: {
    kicker: "Skip the math",
    title: "Turn a sweater photo into your own knitting pattern",
    text: "Upload a photo, enter your gauge and measurements, and get row-by-row instructions sized for you. Free, no account needed.",
    button: "Generate my pattern",
    href: "/knitting-pattern-generator",
  },
  fr: {
    kicker: "Sans calculs",
    title: "Transformez la photo d'un pull en votre propre patron",
    text: "Importez une photo, indiquez votre échantillon et vos mesures, et recevez les explications rang par rang à votre taille. Gratuit, sans compte.",
    button: "Générer mon patron",
    href: "/fr",
  },
};

/**
 * CTA produit insere au milieu des articles de blog (apres la 2e section H2).
 * Mesure GA4 aout 2026 : les 3 premiers articles EN (280 sessions / 30 j)
 * produisaient 0 a 4 generate_pattern, le CTA de fin d'article n'est jamais
 * atteint. Celui-ci est visible sans scroller jusqu'au bout.
 */
export function BlogInlineCta({ lang, slug }: { lang: Language; slug: string }) {
  const c = copy[lang];
  return (
    <aside
      className="my-10 rounded-xl border border-primary/20 bg-primary/5 p-5 md:p-6"
      aria-label={c.title}
    >
      <div className="flex flex-col md:flex-row gap-5 items-center">
        <div className="relative w-full md:w-44 aspect-[16/10] md:aspect-square shrink-0 overflow-hidden rounded-lg">
          <Image
            src="/images/blog/how-to-recreate-sweater-from-photo/photo-to-pattern-process-overview.webp"
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 176px"
            loading="lazy"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <p className="text-xs uppercase tracking-wide text-primary font-medium mb-1">
            {c.kicker}
          </p>
          <p className="font-serif text-xl md:text-2xl mb-2 text-foreground">{c.title}</p>
          <p className="text-sm text-muted-foreground mb-4">{c.text}</p>
          <Link
            href={c.href}
            onClick={() =>
              trackEvent("blog_cta_click", { position: "inline", slug, lang })
            }
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {c.button}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
