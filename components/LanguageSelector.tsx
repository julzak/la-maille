"use client";

import { useTranslation, type Language } from "@/lib/i18n";

export function LanguageSelector() {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    const newLang: Language = language === "fr" ? "en" : "fr";
    setLanguage(newLang);
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
