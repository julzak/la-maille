"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Gate email sur l'export PDF / impression du patron (BRIEF-01).
 * Persiste dans localStorage (pas sessionStorage comme lib/store.ts) : une fois
 * deverrouille sur ce navigateur, l'utilisateur n'est plus jamais sollicite,
 * meme apres fermeture de l'onglet.
 */
interface EmailGateState {
  unlocked: boolean;
  unlock: () => void;
}

export const useEmailGateStore = create<EmailGateState>()(
  persist(
    (set) => ({
      unlocked: false,
      unlock: () => set({ unlocked: true }),
    }),
    {
      name: "lamaille-email-gate",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/**
 * Attend la fin de l'hydratation du store persiste avant de faire confiance a
 * `unlocked`. Sans ca, un utilisateur deja deverrouille verrait le modal
 * clignoter au chargement, et /patron/print pourrait rediriger a tort avant
 * que localStorage n'ait ete lu.
 */
export function useEmailGateHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useEmailGateStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    const unsubscribe = useEmailGateStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );
    const fallbackTimer = setTimeout(() => setHydrated(true), 500);

    return () => {
      unsubscribe?.();
      clearTimeout(fallbackTimer);
    };
  }, []);

  return hydrated;
}
