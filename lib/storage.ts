/**
 * Local storage utilities for offline-ready persistence
 */

import type {
  GarmentAnalysis,
  Measurements,
  Gauge,
  YarnInfo,
  GeneratedPattern,
} from "./types";

// Storage keys
export const STORAGE_KEYS = {
  CURRENT_PROJECT: "lamaille_current_project",
  KNITTING_PROGRESS: "lamaille_knitting_progress",
  USER_PREFERENCES: "lamaille_preferences",
  GAUGE_CALIBRATION: "lamaille_gauge_calibration",
} as const;

// Stored project interface
export interface StoredProject {
  id: string;
  createdAt: string;
  updatedAt: string;
  step: "analysis" | "measurements" | "pattern"; // Current step in workflow
  imagePreview: string; // base64 or URL
  analysis?: GarmentAnalysis;
  measurements?: Measurements;
  gauge?: Gauge;
  yarn?: YarnInfo;
  pattern?: GeneratedPattern;
}

// Knitting progress interface (for knitting mode)
export interface KnittingProgress {
  patternId: string;
  currentPiece: string;
  currentRow: number;
  markers: {
    row: number;
    note: string;
    timestamp: string;
  }[];
  completedPieces: string[];
  lastUpdated: string;
}

// User preferences interface
export interface UserPreferences {
  language: "fr" | "en";
  nightMode: boolean;
  gaugeCalibration?: number;
}

/**
 * Check if localStorage is available
 */
function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a unique project ID
 */
export function generateProjectId(): string {
  return `project_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ===========================================
// Project Storage
// ===========================================

/**
 * Save project to localStorage
 */
export function saveProject(project: StoredProject): void {
  if (!isStorageAvailable()) return;

  try {
    const projectToSave = {
      ...project,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, JSON.stringify(projectToSave));
  } catch (error) {
    console.error("Failed to save project:", error);
  }
}

/**
 * Load project from localStorage
 */
export function loadProject(): StoredProject | null {
  if (!isStorageAvailable()) return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
    if (!stored) return null;

    const project = JSON.parse(stored) as StoredProject;

    // Validate required fields
    if (!project.id || !project.createdAt) {
      return null;
    }

    return project;
  } catch (error) {
    console.error("Failed to load project:", error);
    return null;
  }
}

/**
 * Clear current project from localStorage
 */
export function clearProject(): void {
  if (!isStorageAvailable()) return;

  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT);
  } catch (error) {
    console.error("Failed to clear project:", error);
  }
}

/**
 * Check if there's a project in progress
 */
export function hasProjectInProgress(): boolean {
  const project = loadProject();
  return project !== null;
}

/**
 * Update specific fields of the current project
 */
export function updateProject(updates: Partial<StoredProject>): void {
  const current = loadProject();
  if (!current) return;

  saveProject({
    ...current,
    ...updates,
  });
}

// ===========================================
// Knitting Progress Storage
// ===========================================

/**
 * Get storage key for knitting progress
 */
function getKnittingProgressKey(patternId: string): string {
  return `${STORAGE_KEYS.KNITTING_PROGRESS}_${patternId}`;
}

/**
 * Save knitting progress
 */
export function saveKnittingProgress(progress: KnittingProgress): void {
  if (!isStorageAvailable()) return;

  try {
    const progressToSave = {
      ...progress,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(
      getKnittingProgressKey(progress.patternId),
      JSON.stringify(progressToSave)
    );
  } catch (error) {
    console.error("Failed to save knitting progress:", error);
  }
}

/**
 * Load knitting progress for a specific pattern
 */
export function loadKnittingProgress(patternId: string): KnittingProgress | null {
  if (!isStorageAvailable()) return null;

  try {
    const stored = localStorage.getItem(getKnittingProgressKey(patternId));
    if (!stored) return null;

    return JSON.parse(stored) as KnittingProgress;
  } catch (error) {
    console.error("Failed to load knitting progress:", error);
    return null;
  }
}

/**
 * Clear knitting progress for a specific pattern
 */
export function clearKnittingProgress(patternId: string): void {
  if (!isStorageAvailable()) return;

  try {
    localStorage.removeItem(getKnittingProgressKey(patternId));
  } catch (error) {
    console.error("Failed to clear knitting progress:", error);
  }
}

// ===========================================
// User Preferences Storage
// ===========================================

/**
 * Save user preferences
 */
export function savePreferences(preferences: Partial<UserPreferences>): void {
  if (!isStorageAvailable()) return;

  try {
    const current = loadPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save preferences:", error);
  }
}

/**
 * Load user preferences
 */
export function loadPreferences(): UserPreferences {
  const defaults: UserPreferences = {
    language: "fr",
    nightMode: false,
  };

  if (!isStorageAvailable()) return defaults;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (!stored) return defaults;

    return { ...defaults, ...JSON.parse(stored) };
  } catch (error) {
    console.error("Failed to load preferences:", error);
    return defaults;
  }
}

// ===========================================
// Gauge Calibration Storage
// ===========================================

/**
 * Save gauge calibration value
 */
export function saveGaugeCalibration(pixelsPerCm: number): void {
  if (!isStorageAvailable()) return;

  try {
    localStorage.setItem(STORAGE_KEYS.GAUGE_CALIBRATION, String(pixelsPerCm));
  } catch (error) {
    console.error("Failed to save gauge calibration:", error);
  }
}

/**
 * Load gauge calibration value
 */
export function loadGaugeCalibration(): number | null {
  if (!isStorageAvailable()) return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GAUGE_CALIBRATION);
    if (!stored) return null;

    const value = parseFloat(stored);
    if (isNaN(value) || value < 20 || value > 80) return null;

    return value;
  } catch (error) {
    console.error("Failed to load gauge calibration:", error);
    return null;
  }
}

