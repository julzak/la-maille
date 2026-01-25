"use client";

import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-muted/30 mt-auto border-t border-border">
      <div className="container mx-auto px-4 py-10 text-center">
        <p className="logo-text text-sm tracking-wider text-muted-foreground mb-2">
          LA MAILLE
        </p>
        <p className="text-sm text-muted-foreground">
          {t("footerMadeWith")} — {t("footerDisclaimer")}
        </p>
      </div>
    </footer>
  );
}
