"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Logo } from "@/components/Logo";
import { UserMenu } from "@/components/UserMenu";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslation } from "@/lib/i18n";

export function Header() {
  const { user, isLoading } = useAuthStore();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            className="hidden sm:flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Blog
          </Link>
          {/* Mes patrons link - only shown when logged in */}
          {!isLoading && user && (
            <Link
              href="/mes-patrons"
              className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bookmark className="h-4 w-4" />
              <span>{t("savedPatterns.title")}</span>
            </Link>
          )}
          <LanguageSelector />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
