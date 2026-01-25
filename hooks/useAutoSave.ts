"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface AutoSaveOptions {
  delay?: number; // Debounce delay in ms
  onSave?: () => void; // Callback after save
  enabled?: boolean; // Enable/disable auto-save
}

interface AutoSaveState {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved: Date | null;
}

/**
 * Hook for auto-saving data to localStorage with debounce
 * @param key - localStorage key
 * @param data - Data to save
 * @param options - Configuration options
 * @returns { status, lastSaved, save, clear }
 */
export function useAutoSave<T>(
  key: string,
  data: T,
  options: AutoSaveOptions = {}
) {
  const { delay = 1000, onSave, enabled = true } = options;

  const [state, setState] = useState<AutoSaveState>({
    status: "idle",
    lastSaved: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dataRef = useRef<T>(data);
  const previousDataRef = useRef<string>("");

  // Update ref when data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Save function
  const save = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const serialized = JSON.stringify(dataRef.current);

      // Skip if data hasn't changed
      if (serialized === previousDataRef.current) {
        return;
      }

      setState((prev) => ({ ...prev, status: "saving" }));

      localStorage.setItem(key, serialized);
      previousDataRef.current = serialized;

      const now = new Date();
      setState({ status: "saved", lastSaved: now });

      onSave?.();

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          status: prev.lastSaved === now ? "idle" : prev.status,
        }));
      }, 2000);
    } catch (error) {
      console.error("Auto-save failed:", error);
      setState((prev) => ({ ...prev, status: "error" }));
    }
  }, [key, onSave]);

  // Clear saved data
  const clear = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(key);
      previousDataRef.current = "";
      setState({ status: "idle", lastSaved: null });
    } catch (error) {
      console.error("Failed to clear saved data:", error);
    }
  }, [key]);

  // Load initial data
  const load = useCallback((): T | null => {
    if (typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      previousDataRef.current = stored;
      return JSON.parse(stored) as T;
    } catch (error) {
      console.error("Failed to load saved data:", error);
      return null;
    }
  }, [key]);

  // Auto-save with debounce when data changes
  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      save();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, save]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    status: state.status,
    lastSaved: state.lastSaved,
    save,
    clear,
    load,
  };
}

export default useAutoSave;
