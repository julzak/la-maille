"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  const { t, language } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">{t("terms.title")}</h1>
        <p className="text-muted-foreground mb-8">
          {t("terms.lastUpdated")}: 2 février 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {language === "fr" ? (
            <>
              <section>
                <h2 className="text-xl font-semibold mb-4">1. Acceptation des conditions</h2>
                <p className="text-muted-foreground leading-relaxed">
                  En utilisant La Maille, vous acceptez les présentes conditions générales d&apos;utilisation.
                  Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">2. Description du service</h2>
                <p className="text-muted-foreground leading-relaxed">
                  La Maille est un service qui génère des patrons de tricot à partir de photos.
                  Le service analyse vos images et crée des instructions personnalisées basées sur vos mesures.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">3. Limitations importantes</h2>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    Les patrons générés par La Maille sont des ESTIMATIONS automatiques. Ils n&apos;ont pas été testés
                    et peuvent contenir des erreurs. Vous devez :
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                    <li>Toujours tricoter un échantillon avant de commencer</li>
                    <li>Vérifier les calculs vous-même</li>
                    <li>Adapter les instructions selon votre expérience</li>
                  </ul>
                </div>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  La Maille ne garantit pas que les patrons produiront le résultat exact de l&apos;image source.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">4. Propriété intellectuelle</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Les patrons que vous générez sont pour votre usage personnel. Vous pouvez :
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                  <li>Tricoter des vêtements pour vous-même ou comme cadeaux</li>
                  <li>Modifier et adapter les patrons selon vos besoins</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Vous ne pouvez pas revendre les patrons générés par La Maille.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">5. Contenu uploadé</h2>
                <p className="text-muted-foreground leading-relaxed">
                  En uploadant des images sur La Maille, vous garantissez que :
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                  <li>Vous avez le droit d&apos;utiliser ces images</li>
                  <li>Les images ne violent pas les droits d&apos;auteur d&apos;autrui</li>
                  <li>Les images sont appropriées (pas de contenu offensant)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">6. Compte utilisateur</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Vous êtes responsable de la confidentialité de votre compte.
                  Nous nous réservons le droit de suspendre les comptes en cas d&apos;utilisation abusive.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">7. Limitation de responsabilité</h2>
                <p className="text-muted-foreground leading-relaxed">
                  La Maille est fourni &quot;tel quel&quot;. Nous ne sommes pas responsables des :
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                  <li>Erreurs dans les patrons générés</li>
                  <li>Résultats de tricot non satisfaisants</li>
                  <li>Pertes de matériel (fil, temps)</li>
                  <li>Interruptions temporaires du service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">8. Modifications</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nous pouvons modifier ces conditions à tout moment.
                  Les modifications entrent en vigueur dès leur publication sur le site.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">9. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Pour toute question :<br />
                  Email : hello@la-maille.com<br />
                  La Maille · Paris, France
                </p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By using La Maille, you accept these terms of service.
                  If you do not accept these terms, please do not use our service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">2. Service Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  La Maille is a service that generates knitting patterns from photos.
                  The service analyzes your images and creates personalized instructions based on your measurements.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">3. Important Limitations</h2>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    Patterns generated by La Maille are automatic ESTIMATES. They have not been tested
                    and may contain errors. You must:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                    <li>Always knit a gauge swatch before starting</li>
                    <li>Verify calculations yourself</li>
                    <li>Adapt instructions based on your experience</li>
                  </ul>
                </div>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  La Maille does not guarantee that patterns will produce the exact result of the source image.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">4. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The patterns you generate are for your personal use. You may:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                  <li>Knit garments for yourself or as gifts</li>
                  <li>Modify and adapt patterns to your needs</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  You may not resell patterns generated by La Maille.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">5. Uploaded Content</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By uploading images to La Maille, you warrant that:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                  <li>You have the right to use these images</li>
                  <li>The images do not violate others&apos; copyrights</li>
                  <li>The images are appropriate (no offensive content)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">6. User Account</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You are responsible for keeping your account secure.
                  We reserve the right to suspend accounts in case of misuse.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">7. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  La Maille is provided &quot;as is&quot;. We are not responsible for:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                  <li>Errors in generated patterns</li>
                  <li>Unsatisfactory knitting results</li>
                  <li>Material losses (yarn, time)</li>
                  <li>Temporary service interruptions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">8. Modifications</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may modify these terms at any time.
                  Changes take effect upon publication on the site.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">9. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For any questions:<br />
                  Email: hello@la-maille.com<br />
                  La Maille · Paris, France
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
