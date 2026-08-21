"use client";

import { SsrLanguageContext, useI18n, type Language } from "@/lib/i18n";

/**
 * Fournit la locale de la requete aux Client Components pendant le rendu
 * serveur (voir SsrLanguageContext dans lib/i18n.ts pour le pourquoi) et
 * aligne le store client par securite. Doit envelopper tout ce qui appelle
 * useTranslation().
 */
export function I18nProvider({
  lang,
  children,
}: {
  lang: Language;
  children: React.ReactNode;
}) {
  if (useI18n.getState().language !== lang) {
    useI18n.setState({ language: lang });
  }
  return (
    <SsrLanguageContext.Provider value={lang}>{children}</SsrLanguageContext.Provider>
  );
}
