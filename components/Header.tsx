"use client";

import Link from "next/link";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Logo } from "@/components/Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        <LanguageSelector />
      </div>
    </header>
  );
}
