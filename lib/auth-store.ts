import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "signin" | "signup";
  pendingRedirect: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  openAuthModal: (mode?: "signin" | "signup", redirect?: string) => void;
  closeAuthModal: () => void;
  clearPendingRedirect: () => string | null;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: true,
      isAuthModalOpen: false,
      authModalMode: "signin",
      pendingRedirect: null,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setIsLoading: (isLoading) => set({ isLoading }),

      openAuthModal: (mode = "signin", redirect) =>
        set({
          isAuthModalOpen: true,
          authModalMode: mode,
          pendingRedirect: redirect || null,
        }),

      closeAuthModal: () =>
        set({
          isAuthModalOpen: false,
        }),

      clearPendingRedirect: () => {
        const redirect = get().pendingRedirect;
        set({ pendingRedirect: null });
        return redirect;
      },

      logout: () =>
        set({
          user: null,
          profile: null,
          isAuthModalOpen: false,
          pendingRedirect: null,
        }),
    }),
    {
      name: "lamaille-auth",
      partialize: () => ({
        // Only persist minimal auth state, not the full user object
        // The actual auth state is managed by Supabase cookies
      }),
    }
  )
);
