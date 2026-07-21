import { cookies, headers } from "next/headers";
import {
  LANG_COOKIE,
  LOCALE_HEADER,
  isValidLanguage,
  parseAcceptLanguage,
  type Language,
} from "./detect";

export function getServerLanguage(): Language {
  const stored = cookies().get(LANG_COOKIE)?.value;
  if (isValidLanguage(stored)) return stored;
  return parseAcceptLanguage(headers().get("accept-language"));
}

/**
 * Locale de la requête : l'URL prime (header posé par le middleware sur les
 * pages marketing : EN racine, FR sous /fr), sinon fallback cookie /
 * Accept-Language (routes applicatives).
 */
export function getRequestLocale(): Language {
  const fromUrl = headers().get(LOCALE_HEADER);
  if (isValidLanguage(fromUrl)) return fromUrl;
  return getServerLanguage();
}
