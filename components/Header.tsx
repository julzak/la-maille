"use client";

import Link from "next/link";
import { LanguageSelector } from "@/components/LanguageSelector";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex flex-col">
          <span className="logo-text text-xl tracking-wider text-foreground">
            LA MAILLE
          </span>
          <span className="text-xs text-muted-foreground -mt-0.5">
            your French knitting studio
          </span>
        </Link>

        <LanguageSelector />
      </div>
    </header>
  );
}
