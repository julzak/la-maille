"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslation } from "@/lib/i18n";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user, isLoading, openAuthModal } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);
  const [modalShown, setModalShown] = useState(false);

  useEffect(() => {
    // Wait for auth to initialize
    if (isLoading) return;

    // Auth has loaded
    setAuthChecked(true);

    // Show auth modal once if not logged in
    if (!user && !modalShown) {
      openAuthModal("signup", pathname);
      setModalShown(true);
    }
  }, [user, isLoading, openAuthModal, pathname, modalShown]);

  // Reset modalShown when user logs in
  useEffect(() => {
    if (user) {
      setModalShown(false);
    }
  }, [user]);

  // Show loading while auth is initializing
  if (isLoading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // User is authenticated - show content
  if (user) {
    return <>{children}</>;
  }

  // Not authenticated - show placeholder while modal is open
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🧶</div>
        <p className="text-muted-foreground">{t("auth.signUpToSeePattern")}</p>
      </div>
    </div>
  );
}
