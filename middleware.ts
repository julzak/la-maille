import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  LANG_COOKIE,
  LANG_COOKIE_MAX_AGE,
  LOCALE_HEADER,
  getPathLocale,
  isValidLanguage,
  parseAcceptLanguage,
} from "@/lib/i18n/detect";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const existing = request.cookies.get(LANG_COOKIE)?.value;

  // Redirection de confort (302, volontairement PAS 301) : un visiteur dont le
  // cookie indique déjà une préférence FR et qui arrive sur la racine EN est
  // renvoyé vers la home FR. Jamais basé sur Accept-Language seul : un crawler
  // (Googlebot) sans cookie n'est jamais redirigé, la racine sert l'EN.
  if (pathname === "/" && existing === "fr") {
    const url = request.nextUrl.clone();
    url.pathname = "/fr";
    return NextResponse.redirect(url, 302);
  }

  const urlLocale = getPathLocale(pathname);

  // La locale d'URL fait foi sur les pages marketing. Visiter /fr exprime une
  // préférence explicite : on la persiste dans le cookie (UX des routes
  // applicatives + redirection de confort ci-dessus). Les pages EN racine ne
  // réécrivent PAS le cookie. Ailleurs, détection cookie/Accept-Language
  // inchangée.
  const detected =
    urlLocale === "fr"
      ? "fr"
      : isValidLanguage(existing)
        ? existing
        : parseAcceptLanguage(request.headers.get("accept-language"));

  // Propage la locale d'URL au rendu (layout racine, pages blog) via un
  // header interne. On l'écrase/supprime systématiquement pour qu'un client
  // ne puisse pas l'injecter.
  if (urlLocale) {
    request.headers.set(LOCALE_HEADER, urlLocale);
  } else {
    request.headers.delete(LOCALE_HEADER);
  }

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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
