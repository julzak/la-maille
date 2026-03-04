export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  landing_page?: string;
}

const UTM_STORAGE_KEY = "lamaille_utms";
const UTM_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
] as const;

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, params);
  }
}

/**
 * Reads UTM params from the current URL and persists them in localStorage.
 * Only overwrites existing stored UTMs if new params are present in the URL.
 */
export function captureUTMs() {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const hasUTMs = UTM_PARAM_KEYS.some((key) => params.has(key));
  if (!hasUTMs) return;

  const utms: UTMParams = {};
  UTM_PARAM_KEYS.forEach((key) => {
    const val = params.get(key);
    if (val) utms[key] = val;
  });
  utms.landing_page = window.location.pathname;

  localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utms));
}

export function getStoredUTMs(): UTMParams {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as UTMParams) : {};
  } catch {
    return {};
  }
}

export function clearUTMs() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(UTM_STORAGE_KEY);
  }
}
