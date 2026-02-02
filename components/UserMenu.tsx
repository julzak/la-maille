"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function UserMenu() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, profile, isLoading, openAuthModal, logout } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    console.log("Starting sign out...");
    setIsLoggingOut(true);
    setShowLogoutDialog(false);

    const forceLogout = () => {
      console.log("Force logout - clearing all state...");
      logout();
      localStorage.removeItem("lamaille-auth");

      // Clear all Supabase cookies manually
      document.cookie.split(";").forEach((c) => {
        const name = c.split("=")[0].trim();
        if (name.includes("supabase") || name.includes("sb-")) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });

      toast.success(t("auth.signOutSuccess"));
      window.location.replace("/");
    };

    // Set a timeout in case signOut hangs
    const timeoutId = setTimeout(() => {
      console.warn("SignOut timeout - forcing logout");
      forceLogout();
    }, 3000);

    try {
      const supabase = createClient();
      console.log("Calling supabase.auth.signOut()...");

      const { error } = await supabase.auth.signOut({ scope: 'local' });

      clearTimeout(timeoutId);
      console.log("SignOut result:", { error });

      if (error) {
        console.error("Supabase signOut error:", error);
      }

      forceLogout();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Error signing out:", error);
      forceLogout();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => openAuthModal("signin")}
      >
        {t("auth.signIn")}
      </Button>
    );
  }

  // Logged in
  const displayName = profile?.username || user.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm font-medium">
              {displayName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowLogoutDialog(true)}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("auth.signOut")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout confirmation dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("auth.signOutTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("auth.signOutConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>
              {t("cancel")}
            </AlertDialogCancel>
            <Button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoggingOut && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("auth.signOut")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
