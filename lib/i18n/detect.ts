export type Language = "fr" | "en";

export const LANG_COOKIE = "lamaille-lang";
export const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isValidLanguage(value: unknown): value is Language {
  return value === "fr" || value === "en";
}

export function parseAcceptLanguage(
  header: string | null | undefined
): Language {
  if (!header) return "en";

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) =>
        p.trim().toLowerCase().startsWith("q=")
      );
      const q = qParam ? Number.parseFloat(qParam.split("=")[1]) : 1;
      return {
        tag: tag.trim().toLowerCase(),
        q: Number.isFinite(q) ? q : 0,
      };
    })
    .filter((x) => x.tag.length > 0 && x.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    if (tag.startsWith("fr")) return "fr";
    if (tag.startsWith("en")) return "en";
  }
  return "en";
}

export function readLanguageFromCookieString(
  cookieString: string | null | undefined
): Language | null {
  if (!cookieString) return null;
  const match = cookieString.match(
    new RegExp(`(?:^|;\\s*)${LANG_COOKIE}=([^;]+)`)
  );
  if (!match) return null;
  const value = decodeURIComponent(match[1]);
  return isValidLanguage(value) ? value : null;
}
