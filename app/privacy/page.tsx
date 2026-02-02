"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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

        <h1 className="text-3xl font-bold mb-2">{t("privacy.title")}</h1>
        <p className="text-muted-foreground mb-8">
          {t("privacy.lastUpdated")}: 2 février 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {language === "fr" ? (
            <>
              <section>
                <h2 className="text-xl font-semibold mb-4">1. Collecte des données</h2>
                <p className="text-muted-foreground leading-relaxed">
                  La Maille collecte les données suivantes lorsque vous utilisez notre service :
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                  <li>Adresse email (pour la création de compte)</li>
                  <li>Pseudo (nom d&apos;utilisateur choisi)</li>
                  <li>Photos de tricots que vous uploadez (pour générer les patrons)</li>
                  <li>Mesures corporelles que vous saisissez (pour personnaliser les patrons)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">2. Utilisation des données</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Vos données sont utilisées uniquement pour :
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                  <li>Créer et gérer votre compte</li>
                  <li>Générer des patrons de tricot personnalisés</li>
                  <li>Améliorer notre service d&apos;analyse d&apos;images</li>
                  <li>Vous envoyer des communications importantes (emails de bienvenue, mises à jour)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">3. Stockage et sécurité</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Vos données sont stockées de manière sécurisée sur les serveurs de Supabase (hébergés en Europe).
                  Les images uploadées sont traitées puis supprimées après génération du patron.
                  Nous utilisons le chiffrement HTTPS pour toutes les communications.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">4. Partage des données</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nous ne vendons jamais vos données personnelles. Vos données peuvent être partagées uniquement avec :
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                  <li>Supabase (hébergement et authentification)</li>
                  <li>OpenAI/Anthropic (analyse d&apos;images - les images sont traitées puis supprimées)</li>
                  <li>Resend (envoi d&apos;emails)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">5. Vos droits</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Conformément au RGPD, vous avez le droit de :
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                  <li>Accéder à vos données personnelles</li>
                  <li>Rectifier vos données</li>
                  <li>Supprimer votre compte et vos données</li>
                  <li>Exporter vos données</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Pour exercer ces droits, contactez-nous à : hello@la-maille.com
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">6. Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nous utilisons uniquement des cookies essentiels pour le fonctionnement du site
                  (session d&apos;authentification, préférences de langue). Aucun cookie publicitaire n&apos;est utilisé.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">7. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Pour toute question concernant cette politique de confidentialité :<br />
                  Email : hello@la-maille.com<br />
                  La Maille · Paris, France
                </p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-xl font-semibold mb-4">1. Data Collection</h2>
                <p className="text-muted-foreground leading-relaxed">
                  La Maille collects the following data when you use our service:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                  <li>Email address (for account creation)</li>
                  <li>Username (chosen display name)</li>
                  <li>Photos of knitted items you upload (to generate patterns)</li>
                  <li>Body measurements you enter (to customize patterns)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">2. Data Usage</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your data is used only to:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                  <li>Create and manage your account</li>
                  <li>Generate personalized knitting patterns</li>
                  <li>Improve our image analysis service</li>
                  <li>Send you important communications (welcome emails, updates)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">3. Storage and Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your data is securely stored on Supabase servers (hosted in Europe).
                  Uploaded images are processed and then deleted after pattern generation.
                  We use HTTPS encryption for all communications.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">4. Data Sharing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We never sell your personal data. Your data may only be shared with:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                  <li>Supabase (hosting and authentication)</li>
                  <li>OpenAI/Anthropic (image analysis - images are processed then deleted)</li>
                  <li>Resend (email delivery)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">5. Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  In accordance with GDPR, you have the right to:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                  <li>Access your personal data</li>
                  <li>Rectify your data</li>
                  <li>Delete your account and data</li>
                  <li>Export your data</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  To exercise these rights, contact us at: hello@la-maille.com
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">6. Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We only use essential cookies for site functionality
                  (authentication session, language preferences). No advertising cookies are used.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">7. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For any questions about this privacy policy:<br />
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
