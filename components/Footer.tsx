"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-muted/30 mt-auto border-t border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-4">
          <Logo showTagline={false} />
          <p className="text-sm text-muted-foreground">
            Made with ❤️ &amp; 🧶 in Paris
          </p>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link
              href="/knitting-pattern-generator"
              className="hover:text-foreground transition-colors"
            >
              Pattern Generator
            </Link>
            <Link
              href="/how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/photo-to-knitting-pattern"
              className="hover:text-foreground transition-colors"
            >
              Photo to Pattern
            </Link>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              {t("privacy.title")}
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              {t("terms.title")}
            </Link>
          </nav>
          <p className="text-xs text-muted-foreground text-center">
            {t("footerDisclaimer")}
          </p>
        </div>
      </div>
    </footer>
  );
}
