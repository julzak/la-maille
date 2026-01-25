"use client";

import { useTranslation } from "@/lib/i18n";

interface WeavingLoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function WeavingLoader({ message, size = "md" }: WeavingLoaderProps) {
  const { t } = useTranslation();

  const displayMessage = message || t("loading");

  const sizeClasses = {
    sm: "gap-1",
    md: "gap-1.5",
    lg: "gap-2",
  };

  const dotClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`flex ${sizeClasses[size]}`}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`${dotClasses[size]} bg-primary rounded-full animate-bounce`}
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <p className="text-muted-foreground font-serif text-lg">{displayMessage}</p>
    </div>
  );
}
