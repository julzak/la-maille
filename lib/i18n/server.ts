import { cookies, headers } from "next/headers";
// API interne de Next 14 (voir getRenderPathname). Le suffixe `.external`
// garantit qu'on lit la même instance que le moteur de rendu.
import { staticGenerationAsyncStorage } from "next/dist/client/components/static-generation-async-storage.external";
import {
  LANG_COOKIE,
  getPathLocale,
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
 * Chemin de la page en cours de rendu, SANS passer par headers() ni cookies().
 *
 * Pourquoi : lire headers() dans le layout racine bascule tout le site en
 * rendu dynamique, donc une fonction Vercel par visite, y compris sur les
 * pages vitrine et le blog (quota Fluid Active CPU du forfait Hobby consommé
 * à 75 % le 2026-11-13). Next 14 ne donne pas le chemin au layout racine par
 * une API publique : on le lit dans le store de rendu interne, disponible au
 * build (prérendu) comme à la requête, et qui ne rend pas la page dynamique.
 *
 * Garde-fou : si ce store disparaît (montée de version de Next), on renvoie
 * null et getRequestLocale retombe sur le cookie, donc sur l'ancien
 * comportement dynamique, correct mais coûteux. `scripts/test-static-marketing.ts`
 * détecte ce retour en arrière après un build. À la migration vers Next 15,
 * remplacer par un segment racine `[locale]`.
 */
function getRenderPathname(): string | null {
  try {
    const pathname = staticGenerationAsyncStorage.getStore()?.urlPathname;
    return typeof pathname === "string" ? pathname.split("?")[0] : null;
  } catch {
    return null;
  }
}

/**
 * Locale de la requête : l'URL prime sur les pages marketing (EN racine, FR
 * sous /fr), ce qui les laisse statiques. Sinon fallback cookie /
 * Accept-Language (routes applicatives, rendues à la requête).
 */
export function getRequestLocale(): Language {
  const pathname = getRenderPathname();
  const fromUrl = pathname ? getPathLocale(pathname) : null;
  if (fromUrl) return fromUrl;
  return getServerLanguage();
}
