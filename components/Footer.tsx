"use client";

import { Logo } from "@/components/Logo";
import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-muted/30 mt-auto border-t border-border">
      <div className="container mx-auto px-4 py-5 flex flex-col items-center">
        <Logo showTagline={false} className="mb-1" />
        <p className="text-sm text-muted-foreground mb-1">
          Fait avec ❤️ & 🧶 à Paris
        </p>
        <p className="text-xs text-muted-foreground">
          {t("footerDisclaimer")}
        </p>
      </div>
    </footer>
  );
}
