"use client";

import { useRouter } from "next/navigation";
import { useLaMailleStore } from "@/lib/store";
import { clearProject } from "@/lib/storage";

/**
 * Logique de demarrage d'une analyse a partir de photos uploadees, partagee
 * entre la home (`app/page.tsx`) et le widget d'upload inline du blog
 * (`components/BlogInlineUploader.tsx`) : stocke les images dans le store
 * Zustand, laisse le temps au persist middleware d'ecrire dans
 * sessionStorage, puis redirige vers /analyse ou l'appel API a lieu.
 */
export function useStartAnalysis() {
  const router = useRouter();
  const { setImages, setAnalysisLoading, analysisLoading } = useLaMailleStore();

  const startAnalysis = async (files: File[], previews: string[]) => {
    try {
      // Clear any previous project when starting new
      clearProject();
      setImages(files, previews);
      setAnalysisLoading(true);

      // Wait for Zustand persist to flush to sessionStorage before navigation
      await new Promise((resolve) => setTimeout(resolve, 100));

      router.push("/analyse");
    } catch (err) {
      console.error("[useStartAnalysis] Error in startAnalysis:", err);
      // Even if persist fails, force navigation with in-memory state
      setAnalysisLoading(true);
      router.push("/analyse");
    }
  };

  return { startAnalysis, analysisLoading };
}
