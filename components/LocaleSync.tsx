"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import {
  LANG_COOKIE,
  LANG_COOKIE_MAX_AGE,
  getPathLocale,
  parseAcceptLanguage,
  readLanguageFromCookieString,
} from "@/lib/i18n/detect";

/**
 * Aligne le store i18n sur la locale d'URL lors des navigations client
 * (EN racine <-> /fr). Sur les routes applicatives (locale d'URL nulle),
 * ne touche pas au store : comportement cookie inchangé.
 *
 * Pose aussi le cookie de langue, ce que faisait le middleware avant que les
 * pages vitrine deviennent statiques (le middleware ne tourne plus dessus) :
 * visiter /fr exprime une préférence explicite et l'écrit ; ailleurs un
 * cookie existant n'est jamais réécrit, et un cookie absent est initialisé
 * depuis la langue du navigateur.
 */
export function LocaleSync() {
  const pathname = usePathname();

  useEffect(() => {
    const locale = getPathLocale(pathname);
    if (locale && useI18n.getState().language !== locale) {
      useI18n.setState({ language: locale });
    }

    const stored = readLanguageFromCookieString(document.cookie);
    const wanted =
      locale === "fr"
        ? "fr"
        : (stored ??
          parseAcceptLanguage(
            (navigator.languages?.length
              ? navigator.languages
              : [navigator.language]
            ).join(",")
          ));
    if (stored !== wanted) {
      document.cookie = `${LANG_COOKIE}=${wanted}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; samesite=lax`;
    }
  }, [pathname]);

  return null;
}
