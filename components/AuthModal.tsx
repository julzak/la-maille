"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AuthModal() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    clearPendingRedirect,
  } = useAuthStore();

  const [mode, setMode] = useState<"signin" | "signup">(authModalMode);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Sync mode with store when modal opens
  useState(() => {
    setMode(authModalMode);
  });

  // Called when user manually closes the modal (X button, click outside, Escape)
  const handleClose = () => {
    const redirect = clearPendingRedirect();
    closeAuthModal();
    resetForm();

    // If user was trying to access a protected page without logging in, redirect to home
    if (redirect && redirect !== "/") {
      router.replace("/");
    }
  };

  // Called after successful login - just reset form, don't redirect to home
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setError(null);
    setIsLoading(false);
  };

  // Called after successful auth - close modal, the auth state change will trigger re-render
  const handleAuthSuccess = () => {
    // Clear the pending redirect since user is now authenticated
    // They'll stay on the current page and see the content
    clearPendingRedirect();
    closeAuthModal();
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createClient();

    try {
      if (mode === "signup") {
        // Check if username is available
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", username.toLowerCase().trim())
          .single();

        if (existingUser) {
          setError(t("auth.usernameExists"));
          setIsLoading(false);
          return;
        }

        // Sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.toLowerCase().trim(),
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          toast.success(t("auth.signUpSuccess"));
          handleAuthSuccess();
        }
      } else {
        // Sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        toast.success(t("auth.signInSuccess"));
        handleAuthSuccess();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("auth.unknownError");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("auth.unknownError");
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "signin" ? t("auth.signIn") : t("auth.signUp")}
          </DialogTitle>
          <DialogDescription>
            {mode === "signin"
              ? t("auth.signInDescription")
              : t("auth.signUpDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {t("auth.continueWithGoogle")}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("auth.or")}
              </span>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          {/* Username (signup only) */}
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="username">{t("auth.username")}</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("auth.usernamePlaceholder")}
                required
                disabled={isLoading}
                minLength={3}
                maxLength={30}
                pattern="^[a-zA-Z0-9_-]+$"
              />
              <p className="text-xs text-muted-foreground">
                {t("auth.usernameHelp")}
              </p>
            </div>
          )}

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Submit button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "signin" ? t("auth.signInButton") : t("auth.signUpButton")}
          </Button>
        </form>

        {/* Toggle mode */}
        <div className="text-center text-sm">
          {mode === "signin" ? (
            <p>
              {t("auth.noAccount")}{" "}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => setMode("signup")}
              >
                {t("auth.createAccount")}
              </button>
            </p>
          ) : (
            <p>
              {t("auth.hasAccount")}{" "}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => setMode("signin")}
              >
                {t("auth.signInLink")}
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
