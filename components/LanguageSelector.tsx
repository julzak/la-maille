"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation, type Language } from "@/lib/i18n";
import { getPathLocale } from "@/lib/i18n/detect";

/**
 * URL équivalente dans l'autre locale, ou null si la page n'est pas
 * localisée par URL (routes applicatives : on ne change que le cookie).
 * Les articles de blog n'ont pas d'équivalent slug à slug : on renvoie
 * vers le listing blog de l'autre locale.
 */
function equivalentPath(pathname: string, target: Language): string | null {
  const current = getPathLocale(pathname);
  if (!current || current === target) return null;

  if (target === "fr") {
    if (pathname === "/") return "/fr";
    if (pathname.startsWith("/blog/")) return "/fr/blog";
    return `/fr${pathname}`;
  }

  if (pathname === "/fr") return "/";
  const stripped = pathname.slice("/fr".length) || "/";
  if (stripped.startsWith("/blog/")) return "/blog";
  return stripped;
}

export function LanguageSelector() {
  const { language, setLanguage } = useTranslation();
  const pathname = usePathname();
  const newLang: Language = language === "fr" ? "en" : "fr";
  const target = equivalentPath(pathname, newLang);

  const className =
    "flex items-center gap-1.5 text-xs font-medium px-2 h-8 rounded-md hover:bg-muted transition-colors";
  const ariaLabel = language === "fr" ? "Switch to English" : "Passer en francais";
  const content = (
    <>
      <span aria-hidden="true">🌐</span>
      <span className={language === "en" ? "font-semibold text-foreground" : "text-muted-foreground"}>
        EN
      </span>
      <span className="text-muted-foreground/50">/</span>
      <span className={language === "fr" ? "font-semibold text-foreground" : "text-muted-foreground"}>
        FR
      </span>
    </>
  );

  // Pages localisées par URL : vrai lien <a href>, crawlable par Google.
  // Le clic pose aussi le cookie de préférence avant la navigation.
  if (target) {
    return (
      <Link
        href={target}
        hrefLang={newLang}
        onClick={() => setLanguage(newLang)}
        className={className}
        aria-label={ariaLabel}
      >
        {content}
      </Link>
    );
  }

  // Routes applicatives (non localisées par URL) : on ne change que le cookie.
  return (
    <button onClick={() => setLanguage(newLang)} className={className} aria-label={ariaLabel}>
      {content}
    </button>
  );
}
