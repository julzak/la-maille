"use client";

import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();

  const toggleLanguage = () => {
    const newLang: Language = language === "fr" ? "en" : "fr";
    setLanguage(newLang);
    const target = equivalentPath(pathname, newLang);
    if (target) {
      router.push(target);
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 text-xs font-medium px-2 h-8 rounded-md hover:bg-muted transition-colors"
      aria-label={language === "fr" ? "Switch to English" : "Passer en francais"}
    >
      <span aria-hidden="true">🌐</span>
      <span className={language === "en" ? "font-semibold text-foreground" : "text-muted-foreground"}>
        EN
      </span>
      <span className="text-muted-foreground/50">/</span>
      <span className={language === "fr" ? "font-semibold text-foreground" : "text-muted-foreground"}>
        FR
      </span>
    </button>
  );
}
