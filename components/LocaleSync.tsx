"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { getPathLocale } from "@/lib/i18n/detect";

/**
 * Aligne le store i18n sur la locale d'URL lors des navigations client
 * (EN racine <-> /fr). Sur les routes applicatives (locale d'URL nulle),
 * ne touche à rien : comportement cookie inchangé.
 */
export function LocaleSync() {
  const pathname = usePathname();

  useEffect(() => {
    const locale = getPathLocale(pathname);
    if (locale && useI18n.getState().language !== locale) {
      useI18n.setState({ language: locale });
    }
  }, [pathname]);

  return null;
}
