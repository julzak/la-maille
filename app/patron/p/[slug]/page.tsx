import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PUBLIC_PATTERN_BASE_URL,
  buildPublicDescription,
  buildPublicTitle,
  detectPatternLanguage,
  fetchPublicPattern,
} from "@/lib/public-patterns";
import {
  publicConstructionLabels,
  publicFitLabels,
  publicGarmentLabels,
  publicNecklineLabels,
  publicPatternStrings,
  publicSleeveLabels,
  publicStitchLabels,
  publicYarnLabels,
} from "@/lib/i18n/public-pattern";

// Rendu dynamique a chaque requete : une depublication (is_public = false)
// rend la page 404 immediatement, sans attendre une revalidation ISR.
// C'est un critere du brief, ne pas remplacer par du cache.
export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

// Deduplique la requete entre generateMetadata et le rendu de la page.
const getPattern = cache(fetchPublicPattern);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const row = await getPattern(params.slug);
  if (!row) {
    // Page 404 : pas d'indexation.
    return { robots: { index: false, follow: false } };
  }

  const language = detectPatternLanguage(row.pattern_data);
  const title = buildPublicTitle(row.pattern_data, language);
  const description = buildPublicDescription(row.pattern_data, language);
  const canonical = `${PUBLIC_PATTERN_BASE_URL}/patron/p/${row.public_slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    // Le layout parent app/patron/layout.tsx pose noindex (routes privees) :
    // on l'ecrase explicitement, cette page est indexable.
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      siteName: "La Maille",
      locale: language === "fr" ? "fr_FR" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublicPatternPage({ params }: PageProps) {
  const row = await getPattern(params.slug);
  if (!row) {
    notFound();
  }

  const pattern = row.pattern_data;
  const language = detectPatternLanguage(pattern);
  const s = publicPatternStrings[language];
  const analysis = pattern.analysis;

  const title = buildPublicTitle(pattern, language);
  const description = buildPublicDescription(pattern, language);
  const canonical = `${PUBLIC_PATTERN_BASE_URL}/patron/p/${row.public_slug}`;
  const homeHref = language === "fr" ? "/fr" : "/";

  const label = (
    map: Record<"fr" | "en", Record<string, string>>,
    key: string
  ) => map[language][key] || map[language].unknown || key;

  const characteristics: Array<[string, string]> = [
    [s.type, label(publicGarmentLabels, analysis.garment.type)],
    [s.construction, label(publicConstructionLabels, analysis.construction.method)],
    [s.neckline, label(publicNecklineLabels, analysis.neckline.type)],
    [s.sleeves, label(publicSleeveLabels, analysis.sleeves.type)],
    [s.stitch, label(publicStitchLabels, analysis.stitch.mainPattern)],
    [s.fit, label(publicFitLabels, analysis.fit.style)],
    [
      s.gauge,
      `${pattern.gauge.stitchesPer10cm} ${s.gaugeUnit.replace(
        "{rows}",
        String(pattern.gauge.rowsPer10cm)
      )}`,
    ],
    [s.needles, `${pattern.gauge.needleSize} mm`],
    [s.yarn, label(publicYarnLabels, pattern.yarn.weight)],
    [s.estimatedYardage, `~${pattern.estimatedYardage} g`],
  ];

  // JSON-LD HowTo : etapes = pieces + assemblage + finitions.
  // Textes tronques pour garder un schema raisonnable.
  const truncate = (text: string, max = 500) =>
    text.length > max ? `${text.slice(0, max - 1)}…` : text;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: title,
    description: `${description} ${s.jsonLdDescription}`,
    inLanguage: language,
    supply: [
      {
        "@type": "HowToSupply",
        name: `${s.yarn} ${label(publicYarnLabels, pattern.yarn.weight)}`,
      },
    ],
    tool: [
      {
        "@type": "HowToTool",
        name: `${s.needles} ${pattern.gauge.needleSize} mm`,
      },
    ],
    step: [
      ...pattern.pieces.map((piece) => ({
        "@type": "HowToStep",
        name: piece.name,
        text: truncate(
          piece.instructions.map((instruction) => instruction.text).join(" ")
        ),
      })),
      {
        "@type": "HowToStep",
        name: s.assembly,
        text: truncate(pattern.assembly.join(" ")),
      },
      {
        "@type": "HowToStep",
        name: s.finishing,
        text: truncate(pattern.finishing.join(" ")),
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "La Maille",
      url: PUBLIC_PATTERN_BASE_URL,
    },
  };

  const cta = (
    <div className="rounded-lg border bg-muted/50 p-6 text-center space-y-3">
      <h2 className="font-serif text-xl md:text-2xl">{s.ctaTitle}</h2>
      <p className="text-sm text-muted-foreground max-w-xl mx-auto">
        {s.ctaSubtitle}
      </p>
      <Button asChild className="mt-1">
        <Link href={homeHref}>
          {s.ctaButton}
          <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl md:text-4xl font-bold text-balance">{title}</h1>

        {/* CTA haut de page */}
        {cta}

        {/* Caracteristiques d'analyse */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{s.characteristics}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm">
              {characteristics.map(([term, value]) => (
                <div key={term}>
                  <dt className="text-xs text-muted-foreground">{term}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Instructions du patron */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{s.instructions}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {pattern.pieces.map((piece) => (
              <section key={piece.name}>
                <h2 className="font-semibold text-base md:text-lg mb-2">
                  {piece.name}
                </h2>
                <p className="text-xs text-muted-foreground mb-3">
                  {s.castOn} : {piece.castOn} {s.castOnUnit} - {s.totalRows} :{" "}
                  {piece.totalRows} {s.rows.toLowerCase()}
                </p>
                <ol className="space-y-2 text-sm" role="list">
                  {piece.instructions.map((instruction, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="shrink-0 font-mono text-xs text-muted-foreground pt-0.5 w-20">
                        {instruction.rowStart === instruction.rowEnd
                          ? `${s.rowSingle} ${instruction.rowStart}`
                          : `${s.rows} ${instruction.rowStart}-${instruction.rowEnd}`}
                      </span>
                      <span className="leading-relaxed">{instruction.text}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ))}

            {/* Assemblage */}
            {pattern.assembly.length > 0 && (
              <section>
                <h2 className="font-semibold text-base md:text-lg mb-3">
                  {s.assembly}
                </h2>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  {pattern.assembly.map((step, i) => (
                    <li key={i} className="leading-relaxed">
                      {step.replace(/^\d+\.\s*/, "")}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Finitions */}
            {pattern.finishing.length > 0 && (
              <section>
                <h2 className="font-semibold text-base md:text-lg mb-3">
                  {s.finishing}
                </h2>
                <ul className="space-y-2 text-sm" role="list">
                  {pattern.finishing.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-muted-foreground" aria-hidden="true">
                        -
                      </span>
                      <span>{step.replace(/^-\s*/, "")}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </CardContent>
        </Card>

        {/* A propos / disclaimer */}
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{s.aboutTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{s.aboutText}</p>
          </CardContent>
        </Card>

        {/* CTA bas de page */}
        {cta}

        <p className="text-center text-xs text-muted-foreground">
          <a href={canonical} className="hover:underline">
            {canonical.replace("https://", "")}
          </a>
        </p>
      </div>
    </div>
  );
}
