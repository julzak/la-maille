import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GarmentAnalysis, Gauge, Measurements, YarnInfo, GeneratedPattern } from "./types";
import type { Language } from "./i18n";

interface LaMailleState {
  // Images (multiple)
  imageFiles: File[];
  imagePreviews: string[];
  // Keep single image accessors for backward compatibility
  imageFile: File | null;
  imagePreview: string | null;
  imageName: string | null;
  imageType: string | null;
  setImages: (files: File[], previews: string[]) => void;
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
  // Images (multiple)
  imageFiles: [] as File[],
  imagePreviews: [] as string[],
  // Single image (backward compat, derived from arrays)
  imageFile: null as File | null,
  imagePreview: null as string | null,
  imageName: null as string | null,
  imageType: null as string | null,

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
      setImages: (files: File[], previews: string[]) =>
        set({
          imageFiles: files,
          imagePreviews: previews,
          // Backward compat: first image
          imageFile: files[0] || null,
          imagePreview: previews[0] || null,
          imageName: files[0]?.name || null,
          imageType: files[0]?.type || null,
          // Clear previous analysis when new images are set
          analysis: null,
          analysisError: null,
          pattern: null,
          patternError: null,
        }),

      setImage: (file: File, preview: string) =>
        set({
          imageFiles: [file],
          imagePreviews: [preview],
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
          imageFiles: [],
          imagePreviews: [],
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
        imagePreviews: state.imagePreviews,
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
          // Prefer current state's images if they exist (freshly set)
          imagePreviews: currentState.imagePreviews?.length ? currentState.imagePreviews : persisted?.imagePreviews || [],
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
