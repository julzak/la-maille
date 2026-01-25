"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { KnittingMode } from "@/components/KnittingMode";
import { useLaMailleStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";

export default function TricotPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { pattern } = useLaMailleStore();
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on client side (hydration)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle exit from knitting mode
  const handleExit = () => {
    router.push("/patron");
  };

  // Loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t("loading")}</p>
      </div>
    );
  }

  // No pattern available
  if (!pattern) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <p className="text-4xl mb-4">🧶</p>
        <h1 className="text-xl font-bold mb-2">{t("patternNotFound")}</h1>
        <p className="text-muted-foreground mb-6">
          {t("tryWithAnotherPhoto")}
        </p>
        <Button onClick={() => router.push("/patron")}>
          {t("goBackToPattern")}
        </Button>
      </div>
    );
  }

  return <KnittingMode pattern={pattern} onExit={handleExit} />;
}
