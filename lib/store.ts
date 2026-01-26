import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GarmentAnalysis, Gauge, Measurements, YarnInfo, GeneratedPattern } from "./types";
import type { Language } from "./i18n";

interface LaMailleState {
  // Image
  imageFile: File | null;
  imagePreview: string | null;
  imageName: string | null;
  imageType: string | null;
  setImage: (file: File, preview: string) => void;
  clearImage: () => void;

  // Analyse
  analysis: GarmentAnalysis | null;
  analysisLoading: boolean;
  analysisError: string | null;
  setAnalysis: (analysis: GarmentAnalysis) => void;
  setAnalysisLoading: (loading: boolean) => void;
  setAnalysisError: (error: string | null) => void;

  // Mesures
  gauge: Gauge | null;
  measurements: Measurements | null;
  yarn: YarnInfo | null;
  setFormData: (gauge: Gauge, measurements: Measurements, yarn: YarnInfo) => void;

  // Patron
  pattern: GeneratedPattern | null;
  patternLanguage: Language | null;
  patternLoading: boolean;
  patternError: string | null;
  setPattern: (pattern: GeneratedPattern, language: Language) => void;
  setPatternLoading: (loading: boolean) => void;
  setPatternError: (error: string | null) => void;

  // Reset
  resetAll: () => void;

  // Helpers
  hasImage: () => boolean;
  hasAnalysis: () => boolean;
  hasPattern: () => boolean;
}

const initialState = {
  // Image
  imageFile: null,
  imagePreview: null,
  imageName: null,
  imageType: null,

  // Analyse
  analysis: null,
  analysisLoading: false,
  analysisError: null,

  // Mesures
  gauge: null,
  measurements: null,
  yarn: null,

  // Patron
  pattern: null,
  patternLanguage: null,
  patternLoading: false,
  patternError: null,
};

export const useLaMailleStore = create<LaMailleState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Image actions
      setImage: (file: File, preview: string) =>
        set({
          imageFile: file,
          imagePreview: preview,
          imageName: file.name,
          imageType: file.type,
          // Clear previous analysis when new image is set
          analysis: null,
          analysisError: null,
          pattern: null,
          patternError: null,
        }),

      clearImage: () =>
        set({
          imageFile: null,
          imagePreview: null,
          imageName: null,
          imageType: null,
        }),

      // Analyse actions
      setAnalysis: (analysis: GarmentAnalysis) =>
        set({
          analysis,
          analysisLoading: false,
          analysisError: null,
        }),

      setAnalysisLoading: (loading: boolean) =>
        set({
          analysisLoading: loading,
          ...(loading ? { analysisError: null } : {}),
        }),

      setAnalysisError: (error: string | null) =>
        set({
          analysisError: error,
          analysisLoading: false,
        }),

      // Form data actions
      setFormData: (gauge: Gauge, measurements: Measurements, yarn: YarnInfo) =>
        set({
          gauge,
          measurements,
          yarn,
        }),

      // Pattern actions
      setPattern: (pattern: GeneratedPattern, language: Language) =>
        set({
          pattern,
          patternLanguage: language,
          patternLoading: false,
          patternError: null,
        }),

      setPatternLoading: (loading: boolean) =>
        set({
          patternLoading: loading,
          ...(loading ? { patternError: null } : {}),
        }),

      setPatternError: (error: string | null) =>
        set({
          patternError: error,
          patternLoading: false,
        }),

      // Reset
      resetAll: () => set(initialState),

      // Helpers
      hasImage: () => {
        const state = get();
        return !!(state.imagePreview);
      },

      hasAnalysis: () => {
        const state = get();
        return !!(state.analysis && state.analysis.analysable);
      },

      hasPattern: () => {
        const state = get();
        return !!(state.pattern);
      },
    }),
    {
      name: "lamaille-storage",
      storage: createJSONStorage(() => sessionStorage),
      // Ne pas persister les objets File (non sérialisables) ni les états de chargement
      partialize: (state) => ({
        imagePreview: state.imagePreview,
        imageName: state.imageName,
        imageType: state.imageType,
        analysis: state.analysis,
        gauge: state.gauge,
        measurements: state.measurements,
        yarn: state.yarn,
        pattern: state.pattern,
        patternLanguage: state.patternLanguage,
      }),
      // Merge hydrated state with current state instead of replacing
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<LaMailleState> | undefined;
        return {
          ...currentState,
          ...(persisted || {}),
          // Prefer current state's image if it exists (freshly set)
          imagePreview: currentState.imagePreview || persisted?.imagePreview || null,
          imageName: currentState.imageName || persisted?.imageName || null,
          imageType: currentState.imageType || persisted?.imageType || null,
        };
      },
    }
  )
);

// Import React hooks for the hydration hook
import { useState, useEffect } from "react";

// Hook pour vérifier si le store est hydraté (côté client)
export const useStoreHydrated = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Check if already hydrated immediately
    if (useLaMailleStore.persist.hasHydrated()) {
      console.log("[Store] Already hydrated");
      setHydrated(true);
      return;
    }

    // Wait for Zustand persist to complete hydration
    const unsubscribe = useLaMailleStore.persist.onFinishHydration(() => {
      console.log("[Store] Hydration finished");
      setHydrated(true);
    });

    // Fallback: if hydration doesn't complete in 500ms, assume it's done
    // This handles edge cases where the callback might not fire
    const fallbackTimer = setTimeout(() => {
      if (!useLaMailleStore.persist.hasHydrated()) {
        console.log("[Store] Hydration fallback triggered");
      }
      setHydrated(true);
    }, 500);

    return () => {
      if (unsubscribe) unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, []);

  return hydrated;
};
