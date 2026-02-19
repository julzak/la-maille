"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore, type UserProfile } from "@/lib/auth-store";
import { AuthModal } from "@/components/AuthModal";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setIsLoading } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    // Safety timeout - if auth takes more than 5s, stop loading
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    // Get initial session
    const initAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setUser(null);
          setIsLoading(false);
          clearTimeout(timeout);
          return;
        }

        setUser(user);

        if (user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          setProfile(profile as UserProfile | null);
        }
      } catch {
        // Auth initialization failed silently
      } finally {
        clearTimeout(timeout);
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || event === "INITIAL_SESSION" && !session) {
        // User signed out or no initial session
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const user = session?.user ?? null;
      setUser(user);

      if (user) {
        // Fetch user profile on sign in
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile(profile as UserProfile | null);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setProfile, setIsLoading]);

  return (
    <>
      {children}
      <AuthModal />
    </>
  );
}
