"use client";

import { useTranslation, type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function LanguageSelector() {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    const newLang: Language = language === "fr" ? "en" : "fr";
    setLanguage(newLang);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="text-xs font-medium px-2 h-8"
      aria-label={language === "fr" ? "Switch to English" : "Passer en francais"}
    >
      {language === "fr" ? "EN" : "FR"}
    </Button>
  );
}
