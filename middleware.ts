import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  LANG_COOKIE,
  LANG_COOKIE_MAX_AGE,
  isValidLanguage,
  parseAcceptLanguage,
} from "@/lib/i18n/detect";

export async function middleware(request: NextRequest) {
  const existing = request.cookies.get(LANG_COOKIE)?.value;
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
