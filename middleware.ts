import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  LANG_COOKIE,
  LANG_COOKIE_MAX_AGE,
  isValidLanguage,
  parseAcceptLanguage,
} from "@/lib/i18n/detect";

/**
 * Ne tourne QUE sur les routes applicatives, l'API et l'auth (voir matcher).
 * Les pages vitrine et le blog sont statiques et servis par le CDN sans
 * passer ici : leur langue vient de l'URL (lib/i18n/server.ts), le cookie de
 * langue y est posé côté client (components/LocaleSync.tsx) et la redirection
 * de confort / -> /fr est dans next.config.mjs.
 */
export async function middleware(request: NextRequest) {
  const existing = request.cookies.get(LANG_COOKIE)?.value;

  // Routes applicatives : langue pilotée par le cookie, sinon Accept-Language.
  const detected = isValidLanguage(existing)
    ? existing
    : parseAcceptLanguage(request.headers.get("accept-language"));

  // Mutate request cookies so the rest of the chain (layout via cookies())
  // sees the resolved language on the very first request.
  if (existing !== detected) {
    request.cookies.set(LANG_COOKIE, detected);
  }

  const response = await updateSession(request);

  if (existing !== detected) {
    response.cookies.set(LANG_COOKIE, detected, {
      maxAge: LANG_COOKIE_MAX_AGE,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}

export const config = {
  // Liste explicite : toute nouvelle route qui a besoin de la session Supabase
  // ou du cookie de langue côté serveur doit être ajoutée ici.
  matcher: [
    "/analyse/:path*",
    "/patron/:path*",
    "/mes-patrons/:path*",
    "/tricot/:path*",
    "/api/:path*",
    "/auth/:path*",
  ],
};
